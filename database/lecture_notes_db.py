from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from . import db_models


def save_file_metadata(
        db: Session,
        document_id: str,
        user_id: str
):
    db_create_conversation = db_models.DocumentChatHistory(
        document_id=document_id,
        user_id=user_id
    )
    db.add(db_create_conversation)
    db.commit()
    db.refresh(db_create_conversation)
    return db_create_conversation