from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    """Request body for user registration."""

    username: str = Field(min_length=3, max_length=50)
    email: str
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    """Request body for user login."""

    username: str
    password: str


class UserResponse(BaseModel):
    """User data returned by auth APIs. Password hashes are never returned."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    created_at: datetime


class Token(BaseModel):
    """JWT response returned after successful login."""

    access_token: str
    token_type: str = "bearer"


class RoleCreate(BaseModel):
    name: str


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class AssignRoleRequest(BaseModel):
    user_id: int
    role_id: int


class DocumentResponse(BaseModel):
    """Document metadata returned by document APIs."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    company_name: str
    document_type: str
    file_path: str
    uploaded_by: int
    created_at: datetime


class IndexDocumentRequest(BaseModel):
    document_id: int


class SearchRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)
