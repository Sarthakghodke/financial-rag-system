from pathlib import Path
from shutil import copyfileobj
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Document, User
from app.schemas import DocumentResponse
from app.auth import get_current_user
from app.utils.rbac import require_role


router = APIRouter(prefix="/documents", tags=["Documents"])
UPLOAD_DIR = Path("uploads")


def ensure_upload_folder_exists() -> None:
    """Create the uploads folder if it does not already exist."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def is_pdf_file(file: UploadFile) -> bool:
    """Check both content type and file extension for simple PDF validation."""
    filename = file.filename or ""
    return file.content_type == "application/pdf" and filename.lower().endswith(".pdf")


def save_uploaded_pdf(file: UploadFile) -> str:
    """Save the uploaded PDF and return the saved file path."""
    ensure_upload_folder_exists()
    safe_filename = f"{uuid4()}_{Path(file.filename or 'document.pdf').name}"
    file_path = UPLOAD_DIR / safe_filename

    with file_path.open("wb") as buffer:
        copyfileobj(file.file, buffer)

    return str(file_path)


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_document(
    title: str = Form(...),
    company_name: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a PDF, save it to disk, and store its metadata in SQLite."""
    if not is_pdf_file(file):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_path = save_uploaded_pdf(file)

    document = Document(
        title=title,
        company_name=company_name,
        document_type=document_type,
        file_path=file_path,
        uploaded_by=current_user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("", response_model=list[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all uploaded document metadata rows."""
    return db.query(Document).order_by(Document.created_at.desc()).all()


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return one document metadata row by ID."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_user: User = Depends(require_role("Admin")),
    db: Session = Depends(get_db),
):
    """Delete a document metadata row and remove its saved PDF file."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    path = Path(document.file_path)
    if path.exists():
        path.unlink()

    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully"}
