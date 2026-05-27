from functools import lru_cache

from sentence_transformers import SentenceTransformer


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    """Load the embedding model once and reuse it across requests."""
    return SentenceTransformer(MODEL_NAME)


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Create embeddings for multiple document chunks."""
    model = get_embedding_model()
    return model.encode(texts).tolist()


def embed_query(query: str) -> list[float]:
    """Create one embedding for a user search query."""
    model = get_embedding_model()
    return model.encode(query).tolist()
