from sqlalchemy import Column, Integer, String, create_engine, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

engine = create_engine(
    "postgresql://postgres:1234@localhost/postgres",
    isolation_level="REPEATABLE READ",echo=False)
Base = declarative_base()

# Document chat model

class DocumentChatHistory(Base):
    """
    This table stores chat history of DocumentChat feature.
    """
    __tablename__ = "conversation"

    conversation_id = Column(Integer, primary_key=True, nullable=False)
    document_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.now)

class DocumentChatMessageHistory(Base):
    """
    This table stores individual messages in document chat conversations.
    """
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, nullable=False)
    conversation_id = Column(Integer, ForeignKey("conversation.conversation_id"), nullable=False)
    is_bot = Column(Boolean, nullable=False)  # True for bot, False for user
    message_text = Column(String, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.now)


# Video to Quiz DB tables

class VideoCache(Base):
    """
    This table stores video information.
    """
    __tablename__ = "video_cache"

    video_id = Column(String, primary_key=True, nullable=False)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    length = Column(Integer, nullable=False)
    views = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    keywords = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=False)

class VideoToQuiz(Base):
    """
    This table all the quiz information, each quiz have an id,
     and it can be used to get question from MCQsVideoToQuiz table.
    """
    __tablename__ = "video_to_quiz"

    id = Column(Integer, primary_key=True)
    created_by = Column(String, nullable=False)
    date_created = Column(DateTime, nullable=False, default=datetime.now)
    video_id = Column(String, nullable=False)
    video_title = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    no_of_questions = Column(Integer, nullable=False)
    mcqs = relationship("MCQsVideoToQuiz", back_populates="quiz")

class VideoToQuizQuota(Base):
    """
    This table store quota of each user for generating quiz (not perfect, must be updated properly)
    """
    __tablename__ = "video_to_quiz_quota"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False, unique=True)
    quota_remaining = Column(Integer, nullable=False, default=50)
    last_reset_date = Column(DateTime, default=datetime.now)

class MCQsVideoToQuiz(Base):
    """
    This table stores multiple choice questions,
     each question is connected to an id in VideoToQuiz table through foreign key.
    """
    __tablename__ = "mcqs_video_to_quiz"

    question_id = Column(Integer, primary_key=True, autoincrement=True)
    quiz_id = Column(Integer, ForeignKey("video_to_quiz.id"))

    question = Column(String, nullable=False)
    a = Column(String, nullable=False)
    b = Column(String, nullable=False)
    c = Column(String, nullable=False)
    d = Column(String, nullable=False)
    correct_answer = Column(String, nullable=False)
    explanation = Column(String, nullable=False)

    quiz = relationship("VideoToQuiz", back_populates="mcqs")

class MCQsVideoToQuizResult(Base):
    """
    This table store result of a quiz attempt by any user.
    """
    __tablename__ = "mcqs_video_to_quiz_result"

    quiz_id = Column(Integer, ForeignKey("video_to_quiz.id"), primary_key=True)
    user_id = Column(String, nullable=False)
    total_correct_attempt = Column(Integer, nullable=False)
    total_wrong_attempt = Column(Integer, nullable=False)
    not_attempted = Column(Integer, nullable=False)

Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
