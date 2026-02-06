import os
import uuid
import logging
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.params import Depends
from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Query


# Importing services
from backend.services.gemini_services import GeminiService, Documents
from backend.utils import authenticate_user_get_user_details
from database.db_models import get_db

# Importing db methods
from database.document_chat_db import (
    create_conversation,
    get_document_chat_history,
    add_document_chat_messages_batch,
    get_document_chat_message_history
)

# I/O validation
class ChatMessageHistory(BaseModel):
    chat: List[Dict[str, str]]

class ChatRequest(BaseModel):
    message: str
    file_uri: Dict[str, Any]
    conversation_id: int
    history: Optional[ChatMessageHistory] = None

class ChatResponse(BaseModel):
    response: str

logger = logging.getLogger(__name__)


# Initialize FastAPI router
router = APIRouter(
    tags=["DocumentChat"],
)

load_dotenv(r"../.env")

gemini_service = GeminiService(os.getenv("GEMINI_API_KEY"))


@router.get("/")
async def root():
    """Root endpoint for DocumentChat API"""
    logger.info("DocumentChat API Root endpoint called")
    return {"message": "DocumentChat Platform API",
            "Status": "running"}


@router.post("/create-new-document-chat")   # test successful
async def create_new_document_chat(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    if not user_id:
        logger.warning(f"User: {user_id} not found.")
        raise HTTPException(status_code=401, detail="User not authorized.")
    # Save file locally
    try:
        extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{extension}"
        file_path = f"uploads/{unique_filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
    except:
        logger.error(f"Error while saving file: {str(file)}")
        raise HTTPException(status_code=500, detail="Failed to save file.")

    # Upload to external service
    file_uri = gemini_service.upload_pdf_file(file_path=file_path)

    # add new conversation in db
    create_new_document_conversation = create_conversation(db=db, document_id=unique_filename, user_id=user_id)
    logger.info(f"Created new document conversation for user: {user_id} with document id: {unique_filename}")
    return {
        "conversation": create_new_document_conversation,
        "file_uri": file_uri
    }


@router.post("/chat", response_model=ChatResponse)  # test successful
async def chat_with_document(request: Request, chat_request: ChatRequest, db: Session = Depends(get_db)):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    if not user_id:
        logger.warning(f"User: {user_id} not found.")
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Validate inputs
    if len(chat_request.message.strip()) == 0:
        logger.warning(f"Empty chat message: {chat_request.message.strip()}")
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        # Generate response
        message_with_context = str(
            chat_request.history) + chat_request.message if chat_request.history else chat_request.message
        response = gemini_service.generate_response(message_with_context, chat_request.file_uri)

        # Batch database operations
        messages = [
            {"conversation_id": chat_request.conversation_id, "is_bot": False, "message_text": chat_request.message},
            {"conversation_id": chat_request.conversation_id, "is_bot": True, "message_text": response}
        ]
        add_document_chat_messages_batch(db, messages)
        logger.info(f"Successfully added chat message for user: {user_id}")

        return ChatResponse(response=response)

    except Exception as e:
        logging.error(f"Chat error for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process chat request")


@router.get("/chat_history")    # test successful
async def get_chat_with_document_history(
        request: Request,
        skip: int = Query(0, ge=0),
        limit: int = Query(10, ge=1, le=100),
        db: Session = Depends(get_db)
):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    if not user_id:
        logger.warning(f"User: {user_id} not found.")
        raise HTTPException(status_code=401, detail="Unauthorized")

    history = get_document_chat_history(db=db, user_id=user_id, skip=skip, limit=limit)
    logger.info(f"Found {len(history)} chat messages for user: {user_id}")
    return {"conversations": history, "count": len(history)}


@router.get("/chat_message_history")    # test successful
async def get_chat_with_document_message_history(
        request: Request,
        conversation_id: int = Query(..., gt=0),
        db: Session = Depends(get_db)
):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    if not user_id:
        logger.warning(f"User: {user_id} not found.")
        raise HTTPException(status_code=401, detail="Unauthorized")

    messages = get_document_chat_message_history(db, conversation_id, user_id)
    if not messages:
        logger.warning(f"No chat messages for user: {user_id}")
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"messages": messages}