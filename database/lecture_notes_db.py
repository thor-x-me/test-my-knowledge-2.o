from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from database import db_models

def get_new_file_id(
        db: Session,
        user_id: str
):
    new_file = db_models.FilesUploaded(
        user_id=user_id
    )
    db.add(new_file)
    db.flush()
    audio_file_id = new_file.audio_file_id
    db.commit()
    return audio_file_id

def update_file_data(
        db: Session,
        audio_file_id: str,
        file_path: str,
        duration: int,
        status: str
):
    file = db.query(db_models.FilesUploaded).filter(
        db_models.FilesUploaded.audio_file_id == audio_file_id
    ).first()

    file.duration = duration
    file.file_path = file_path
    file.status = status
    db.commit()

def save_lecture_transcript(
        db: Session,
        transcript: str,
        token_count: int,
        audio_file_id: str
):
    db_lecture_data = db_models.FileTranscript(
        audio_file_id=audio_file_id,
        transcript=transcript,
        token_count=token_count,
    )
    db.add(db_lecture_data)
    db.commit()
    db.refresh(db_lecture_data)
    return db_lecture_data

def if_transcript_exists(
        db: Session,
        user_id: str,
        audio_file_id: str,
):
    transcript = db.query(db_models.FileTranscript).filter(
        db_models.FileTranscript.audio_file_id == audio_file_id
    ).first()
    if transcript:
        return {"exists":True, "transcript_id": transcript.transcript_id}
    return {"exists":False, "transcript_id": None}

def get_lecture_transcript(
        db: Session,
        transcript_id: str,
):
    transcript = db.query(db_models.FileTranscript.transcript).filter(
        db_models.FileTranscript.transcript_id == transcript_id
    ).first()
    if transcript:
        return transcript[0]
    return None