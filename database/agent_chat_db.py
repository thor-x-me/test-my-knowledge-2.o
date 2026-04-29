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

def get_agent_chat(
        db: Session,
        agent_chat_id: str
):
    agent_chat = (db.query(db_models.AgentChatHistory)
                  .filter(db_models.AgentChatHistory.agent_chat_id == agent_chat_id)
                  .first())
    return agent_chat

def get_agent_chat_history(
        db: Session,
        user_id: str,
        offset: int = 0,
        limit: int = 10
):
    agent_chat = (db.query(db_models.AgentChatHistory)
                  .filter(db_models.AgentChatHistory.user_id == user_id)
                  .order_by(db_models.AgentChatHistory.created_at.desc())
                  .offset(offset)
                  .limit(limit)
                  .all())
    return agent_chat

