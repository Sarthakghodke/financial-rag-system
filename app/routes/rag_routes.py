from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document, User
from app.schemas import SearchRequest
from app.services.chunking_service import chunk_text
from app.services.embedding_service import embed_query, embed_texts
from app.services.pdf_service import extract_text_from_pdf
from app.auth import get_current_user

try:
    import chromadb
except ImportError:  # pragma: no cover - helpful message at runtime
    chromadb = None


router = APIRouter(prefix="/rag", tags=["RAG"])
CHROMA_PATH = "chroma_db"
COLLECTION_NAME = "financial_documents"


def get_collection():
    """Open the persistent ChromaDB collection used for document chunks."""
    if chromadb is None:
        raise HTTPException(status_code=500, detail="chromadb is not installed")

    client = chromadb.PersistentClient(path=CHROMA_PATH)
    return client.get_or_create_collection(name=COLLECTION_NAME)


@router.post("/index-document/{document_id}")
def index_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Extract, chunk, embed, and store one uploaded PDF in ChromaDB."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        text = extract_text_from_pdf(document.file_path)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    if not text:
        raise HTTPException(status_code=400, detail="No text could be extracted from PDF")

    # 1. Split PDF text into chunks.
    chunks = chunk_text(text)

    # 2. Convert chunks into embedding vectors.
    embeddings = embed_texts(chunks)

    # 3. Store chunks, vectors, and useful metadata in ChromaDB.
    collection = get_collection()

    ids = [f"doc-{document.id}-chunk-{index}" for index in range(len(chunks))]
    metadatas = [
        {
            "document_id": document.id,
            "title": document.title,
            "company_name": document.company_name,
            "document_type": document.document_type,
            "chunk_index": index,
        }
        for index in range(len(chunks))
    ]

    collection.upsert(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    return {"message": "Document indexed successfully", "chunks_indexed": len(chunks)}


@router.post("/search")
def search_documents(
    request: SearchRequest,
    current_user: User = Depends(get_current_user),
):
    """Search ChromaDB and return the top relevant document chunks."""
    collection = get_collection()
    query_embedding = embed_query(request.query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=request.top_k,
        include=["documents", "metadatas", "distances"],
    )

    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]
    distances = results.get("distances", [[]])[0]

    matches = []
    for chunk, metadata, distance in zip(documents, metadatas, distances):
        matches.append(
            {
                "chunk": chunk,
                "metadata": metadata,
                "score": distance,
            }
        )

    return {"query": request.query, "results": matches}
