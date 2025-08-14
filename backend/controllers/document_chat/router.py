from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import logging
from datetime import datetime
from dotenv import load_dotenv
import os
import uuid

# Importing services
from backend.services.document_chat_services import DocumentChatService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv(r"../.env")

# Initialize FastAPI router
router = APIRouter(
    tags=["DocumentChat"],
)

session_data = {}

@router.get("/")
async def root():
    """Root endpoint for DocumentChat API"""
    return {"message": "DocumentChat Platform API",
            "Status": "running"}


@router.post("/session/new")
async def create_session():
    """Create a new document chat session and return session_id"""
    session_id = str(uuid.uuid4())
    session_data[session_id] = {
        "service": DocumentChatService(),
        "created_at": datetime.now().isoformat(),
    }
    return {"success": True, "session_id": session_id}


@router.post("/document/upload")
async def upload_document(session_id: str = Form(...), file: UploadFile = File(...)):
    """
    Upload a PDF document for a given session. Expects multipart/form-data with fields:
    - session_id: string
    - file: UploadFile (PDF)
    """
    try:
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Invalid session_id. Create a session first.")

        if file.content_type not in ["application/pdf", "application/x-pdf", "application/acrobat"]:
            raise HTTPException(status_code=400, detail="Only PDF files are supported")

        # Ensure downloads directory exists
        uploads_dir = os.path.join("..", "backend", "downloads")
        os.makedirs(uploads_dir, exist_ok=True)

        # Persist the uploaded file to disk
        saved_path = os.path.join(uploads_dir, f"{uuid.uuid4()}_{file.filename}")
        with open(saved_path, "wb") as out_file:
            out_file.write(await file.read())

        # Upload to Gemini via the service and store file handle
        service: DocumentChatService = session_data[session_id]["service"]
        uploaded_file = service.upload_document(saved_path)

        if not uploaded_file:
            raise HTTPException(status_code=500, detail="Failed to upload document to model")

        return {
            "success": True,
            "session_id": session_id,
            "filename": file.filename,
            "saved_path": saved_path,
            "file": str(uploaded_file),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/chat")
async def chat_with_document(payload: dict):
    """
    Send a prompt to chat with the uploaded documents.
    Body JSON: { "session_id": string, "prompt": string }
    """
    try:
        session_id = payload.get("session_id")
        prompt = payload.get("prompt")

        if not session_id or not prompt:
            raise HTTPException(status_code=400, detail="Both session_id and prompt are required")

        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Invalid session_id. Create a session first.")

        service: DocumentChatService = session_data[session_id]["service"]
        reply = service.chat_with_document(prompt)

        if reply is None:
            raise HTTPException(status_code=500, detail="Failed to generate response")

        return {
            "success": True,
            "session_id": session_id,
            "prompt": prompt,
            "reply": reply,
            "token_count_total": service.document_chat_token_count,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error chatting with document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")



