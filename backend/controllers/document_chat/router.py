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
import fitz  # PyMuPDF
from PIL import Image
import settings

# Importing services
from backend.services.openai_provider import OpenAIService, FileItem
from backend.services.gemini_services import GeminiService
from backend.utils import authenticate_user_get_user_details
from database.db_models import get_db

# Importing db methods
from database.document_chat_db import (
    create_conversation,
    get_document_chat_history,
    add_document_chat_messages_batch,
    get_document_chat_message_history,
    get_document_id
)

# I/O validation
class ChatMessageHistory(BaseModel):
    chat: List[Dict[str, str]]

class ChatRequest(BaseModel):
    message: str
    conversation_id: int
    new_query_page: int
    pages_added: dict[int, FileItem] = dict()     # {1: {"type": "input_image", "file_id": file_id,}, ...]
    history: Optional[ChatMessageHistory] = list()

class ChatResponse(BaseModel):
    response: str

logger = logging.getLogger(__name__)


# Initialize FastAPI router
router = APIRouter(
    tags=["DocumentChat"],
)

load_dotenv()

# gemini_service = GeminiService(os.getenv("GEMINI_API_KEY"))
openai_service = OpenAIService(os.getenv("OPENAI_API_KEY"), model=os.getenv("OPENAI_MODEL"))

@router.get("/")
async def root():
    """Root endpoint for DocumentChat API"""
    logger.info("DocumentChat API Root endpoint called")
    return {"message": "DocumentChat Platform API",
            "Status": "running"}


@router.post("/create_new_document_chat")   # test successful
async def create_new_document_chat(
        request: Request,
        file: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    if not user_id:
        logger.warning(f"User: {user_id} not found.")
        raise HTTPException(status_code=401, detail="User not authorized.")

    # Save file locally
    try:
        extension = Path(file.filename).suffix
        unique_filename = f"{uuid.uuid4()}{extension}"
        file_path = f"{settings.PDF_STORE_LOCATION}/{unique_filename}"
        with open(file_path, "wb") as f:
            f.write(await file.read())
    except:
        logger.exception(f"Error while saving file: {str(file)}")
        raise HTTPException(status_code=500, detail="Failed to save file.")

    # Upload to external service
    # file_uri = gemini_service.upload_pdf_file(file_path=file_path)

    # add new conversation in db
    new_document_conversation = create_conversation(db=db, document_id=unique_filename, user_id=user_id)
    logger.info(f"Created new document conversation for user: {user_id} with document id: {unique_filename}")
    return {
        "conversation": new_document_conversation
    }


@router.post("/chat", response_model=ChatResponse)  # test successful
async def chat_with_document(
        request: Request,
        chat_request: ChatRequest,
        db: Session = Depends(get_db)
):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    if not user_id:
        logger.warning(f"User: {user_id} not found.")
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Validate inputs
    if len(chat_request.message.strip()) == 0:
        logger.warning(f"Empty chat message: {chat_request.message.strip()}")
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    def pdf_page_to_image(pdf_path: str, page_number: int, output_image: str):
        try:
            doc = fitz.open(pdf_path)
            page = doc[page_number - 1]
            pix = page.get_pixmap()
            pix.save(output_image)
            doc.close()
            return output_image
        except Exception as e:
            logger.exception(f"Error creating image from pdf: {str(output_image)}")


    if chat_request.new_query_page not in chat_request.pages_added.keys():
        # logic to get image from PDF page
        document_id = get_document_id(db, user_id, chat_request.conversation_id)
        pdf_file_path = f'{settings.PDF_STORE_LOCATION}/{document_id}'
        print(pdf_file_path)
        page_image = pdf_page_to_image(
            pdf_path=pdf_file_path,
            page_number=chat_request.new_query_page,
            output_image=f"{settings.IMAGE_STORE_LOCATION}/{document_id}_{chat_request.new_query_page}.png"
        )
        page_id = openai_service.upload_file(page_image)
        chat_request.pages_added[chat_request.new_query_page] = page_id
    else:
        page_id = chat_request.pages_added.get(chat_request.new_query_page)
    try:
        # Generate response
        message_with_context = str(
            chat_request.history) + chat_request.message if chat_request.history else chat_request.message
        # response = gemini_service.generate_response(message_with_context, chat_request.file_uri)
        file_items = list()
        file_items.extend(chat_request.pages_added.values())

        response = openai_service.generate_response(
            prompt=message_with_context,
            file_items=[{"type": "input_image", "file_id": page_id}] if page_id else None
        )


        # save chat to db
        messages = [
            {"conversation_id": chat_request.conversation_id, "is_bot": False, "message_text": chat_request.message},
            {"conversation_id": chat_request.conversation_id, "is_bot": True, "message_text": response.output_text}
        ]
        add_document_chat_messages_batch(db, messages)
        logger.info(f"Successfully added chat message for user: {user_id}")
        print('response', response, '\n\n')
        return ChatResponse(response= response.output_text)

    except Exception as e:
        logging.exception(f"Chat error for user {user_id}: {str(e)}")
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