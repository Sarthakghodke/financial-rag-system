# Financial Document Management and Semantic Search System

## Overview
A full-stack AI-powered financial document management system built using FastAPI, React, and RAG architecture.

The system allows users to:
- Upload financial PDF documents
- Store document metadata
- Generate embeddings
- Perform semantic search using vector similarity

---

## Features

### Authentication
- JWT Authentication
- User Registration
- User Login
- Protected APIs

### Document Management
- Upload PDF documents
- Store metadata
- Retrieve documents

### AI / RAG Features
- PDF Text Extraction
- Chunking using LangChain
- Embedding generation using Sentence Transformers
- ChromaDB vector storage
- Semantic search

---

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- LangChain
- ChromaDB
- Sentence Transformers

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

---

## APIs

### Auth APIs
- POST /auth/register
- POST /auth/login

### Document APIs
- POST /documents/upload
- GET /documents

### RAG APIs
- POST /rag/index-document/{document_id}
- POST /rag/search

---

## RAG Workflow

PDF → Text Extraction → Chunking → Embeddings → ChromaDB → Semantic Search

---

## Setup Instructions

### Backend

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload