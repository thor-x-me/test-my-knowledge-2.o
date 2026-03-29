from sqlalchemy.orm import Session
from . import db_models



def create_agent_chat(
        db: Session,
        user_id: str
):
    db_create_chat = db_models.AgentChatHistory(
        user_id=user_id
    )
    db.add(db_create_chat)
    db.flush()
    agent_chat_id = db_create_chat.agent_chat_id
    db.commit()
    return agent_chat_id
