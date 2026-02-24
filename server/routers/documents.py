from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from database import get_db
from models import Document, User, UserRole
from schemas import DocumentCreate, DocumentResponse
from core.dependencies import get_current_user, require_roles

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    skip: int = 0, limit: int = 100, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Document).offset(skip).limit(limit)
    result = await db.execute(query)
    documents = result.scalars().all()
    return documents

@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def create_document(
    document_in: DocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    document = Document(**document_in.model_dump())
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Document).filter(Document.id == document_id))
    document = result.scalars().first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document
