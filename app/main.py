from fastapi import FastAPI

from app.database import Base, engine
from app.models import Document, Role, User, UserRole  # noqa: F401
from app.routes import auth_routes, document_routes, rag_routes, role_routes


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Financial Document Management and Semantic Search System",
    description="FastAPI backend with JWT auth, RBAC, PDF management, and RAG search.",
    version="1.0.0",
)

app.include_router(auth_routes.router)
app.include_router(document_routes.router)
app.include_router(role_routes.router)
app.include_router(rag_routes.router)


@app.get("/")
def health_check():
    return {"message": "Financial Document Management API is running"}