import os
import logging

from fastapi.params import Depends
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Request, UploadFile, File,BackgroundTasks
from pydub import AudioSegment
from backend.services.gemini_services import GeminiService

from backend.utils import authenticate_user_get_user_details
from database.db_models import get_db
from backend.controllers.lecture_notes.prompt import generate_notes_prompt
from database.lecture_notes_db import (
    get_new_file_id, update_file_data,
    save_lecture_transcript,
    if_transcript_exists,
    get_lecture_transcript
)
logger = logging.getLogger(__name__)

UPLOAD_DIR = "audio"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize FastAPI router
router = APIRouter(
    tags=["LectureNotes"]
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
        background_tasks: BackgroundTasks = None,
        db: Session = Depends(get_db)
    ):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    audio_file_id = get_new_file_id(
        db=db,
        user_id=user_id
    )
    file_path = os.path.join(UPLOAD_DIR, f"{audio_file_id}.mp3")

    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(await audio.read())

    # 3. background processing
    background_tasks.add_task(
        _process_audio,
        audio_file_id,
        file_path,
        db=db
    )

    return {"success": True, "audio_file_id": audio_file_id}

@router.get("/is_processing_complete")
def is_processing_complete(
        request: Request,
        audio_file_id: str,
        db:Session = Depends(get_db)
):
    user_id = authenticate_user_get_user_details(request).get("user_id")
    exists = if_transcript_exists(
        db=db,
        user_id=user_id,
        audio_file_id=audio_file_id
    )
    return exists

@router.get("/generate_notes")
def generate_notes(request: Request,transcript_id: str,  db: Session = Depends(get_db)):

    transcript = get_lecture_transcript(transcript_id=transcript_id, db=db)

    if transcript:
        gemini = GeminiService(api_key=os.getenv("GEMINI_API_KEY"))
        final_prompt = generate_notes_prompt + transcript
        notes = gemini.text_completion(text=final_prompt)
        return {"success": True, "notes": notes}

    return {"success": False, "message": "Failed to generate notes"}


def _process_audio(audio_file_id: str, file_path: str, db: Session):
    """
    Find duration of audio and create transcription of the audio lecture
    """

    audio_segment = AudioSegment.from_file(file_path)
    duration = int(len(audio_segment) / 1000)

    update_file_data(
        db=db,
        audio_file_id=audio_file_id,
        duration=duration,
        file_path=file_path,
        status="completed"
    )

    gemini = GeminiService(api_key=os.getenv("GEMINI_API_KEY"))
    file_uri = gemini.upload_audio_file(file_path=file_path)
    transcription = gemini.get_audio_transcription(file_uri=file_uri)
    token_count = gemini.get_token_count(transcription).total_tokens
    save_lecture_transcript(
        db=db,
        audio_file_id=audio_file_id,
        transcript=transcription,
        token_count=token_count
    )

