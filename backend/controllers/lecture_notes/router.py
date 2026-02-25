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

from backend.services.gemini_services import GeminiService, Documents
from backend.utils import authenticate_user_get_user_details
from database.db_models import get_db

from database.lecture_notes_db import save_file_metadata
logger = logging.getLogger(__name__)

UPLOAD_DIR = "audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize FastAPI router
router = APIRouter(
    tags=["LectureNotes"],
    prefix="/lecture_notes",
)

@router.get("/")
async def root():
    """Root endpoint for LectureNotes API"""
    logger.info("LectureNotes API Root endpoint called")
    return {"message": "LectureNotes Platform API",
            "Status": "running"}


@router.post("/upload_audio")  # test successful
async def upload_audio(
        request: Request,
        audio: UploadFile = File(...),
        db: Session = Depends(get_db)
    ):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    lecture_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{lecture_id}.mp3")

    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(await audio.read())

    # Save metadata
    save_file_metadata(
        db=db,
        document_id=lecture_id,
        user_id=user_id
    )
    return {"lecture_id": lecture_id}

@router.get("/generate_notes")
def generate_notes():
    # Step 2: Transcribe
    transcript = transcribe_audio(file_path)

    # Step 3: Generate notes
    notes = generate_notes(transcript)

    return {
        "document_id": document_id,
        "transcript": transcript,
        "notes": notes
    }
