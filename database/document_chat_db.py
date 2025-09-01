from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from . import db_models

def create_conversation(
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

def add_document_chat_message_history(
        db: Session,
        conversation_id: int,
        is_bot: bool,
        message_text: str,
):
    document_message = db_models.DocumentChatMessageHistory(
        conversation_id=conversation_id,
        is_bot=is_bot,
        message_text=message_text
    )
    db.add(document_message)
    db.commit()
    db.refresh(document_message)
    return document_message

def add_document_chat_messages_batch(db: Session, messages: list):
    try:
        for msg in messages:
            document_message = db_models.DocumentChatMessageHistory(**msg)
            db.add(document_message)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e


def get_document_chat_history(db: Session, user_id: str, skip: int = 0, limit: int = 10):
    results = (db.query(db_models.DocumentChatHistory)
               .filter(db_models.DocumentChatHistory.user_id == user_id)
               .order_by(desc(db_models.DocumentChatHistory.created_at))
               .offset(skip)
               .limit(limit)
               .all())

    return {
        "conversations": results,
        "returned_count": len(results),
        "requested_limit": limit
    }


def get_document_chat_message_history(db: Session, conversation_id: int, user_id: str):
    return (db.query(db_models.DocumentChatMessageHistory)
            .join(db_models.DocumentChatHistory,
                  db_models.DocumentChatMessageHistory.conversation_id == db_models.DocumentChatHistory.conversation_id)
            .filter(
                db_models.DocumentChatMessageHistory.conversation_id == conversation_id,
                db_models.DocumentChatHistory.user_id == user_id
            )
            .order_by(asc(db_models.DocumentChatMessageHistory.timestamp))
            .all())