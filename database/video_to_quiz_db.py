from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from . import db_models

def add_video_info_to_cache(
        db: Session,
        video_id: str,
        title: str,
        author: str,
        length: int,
        views: int,
        description: str,
        keywords: str,
        thumbnail_url: str
):
    db_video_cache = db_models.VideoCache(
        video_id=video_id,
        title=title,
        author=author,
        length=length,
        views=views,
        description=description,
        keywords=keywords,
        thumbnail_url=thumbnail_url
    )

    db.add(db_video_cache)
    try:
        db.commit()
        db.refresh(db_video_cache)
        return db_video_cache
    except IntegrityError:
        db.rollback()
        # If conflicted, fetch the existing row
        existing = (
            db.query(db_models.VideoCache)
            .filter_by(video_id=video_id)
            .first()
        )
        return existing



def get_video_info_from_cache(db:Session, video_id: str):
    return (db.query(db_models.VideoCache)
            .filter(db_models.VideoCache.video_id == video_id)
            .first())


def create_video_to_quiz_quota(db:Session, user_id: str):
    db_quota = db_models.VideoToQuizQuota(user_id=user_id)
    db.add(db_quota)
    db.commit()
    db.refresh(db_quota)
    return db_quota

def get_video_to_quiz_quota(db: Session, user_id: str):
    return (db.query(db_models.VideoToQuizQuota)
            .filter(db_models.VideoToQuizQuota.user_id == user_id)
            .first())

def reset_video_to_quiz_quota_if_needed(db:Session, quota: db_models.VideoToQuizQuota):
    now = datetime.now()
    if now - quota.last_reset_date > timedelta(hours=24):
        quota.quota_remaining = 10
        quota.last_reset_date = now
        db.commit()
        db.refresh(quota)
    return quota

def create_video_to_quiz(
        db: Session,
        created_by: str,
        video_id: str,
        video_title: str,
        difficulty: str,
        no_of_questions: int
):
    db_video_to_quiz = db_models.VideoToQuiz(
        created_by=created_by,
        video_id=video_id,
        video_title=video_title,
        difficulty=difficulty,
        no_of_questions=no_of_questions
    )
    db.add(db_video_to_quiz)
    db.commit()
    db.refresh(db_video_to_quiz)
    return db_video_to_quiz


def get_user_video_to_quiz(db:Session, user_id: str):
    return db.query(db_models.VideoToQuiz).filter(db_models.VideoToQuiz.created_by == user_id).all()

def get_quiz_info(db: Session, quiz_id: int):
    return db.query(db_models.VideoToQuiz).filter(db_models.VideoToQuiz.id == quiz_id).first()

def get_user_mcqs_video_to_quiz(db: Session, quiz_id: int):
    return db.query(db_models.MCQsVideoToQuiz).filter(db_models.MCQsVideoToQuiz.quiz_id == quiz_id).all()

def add_bulk_mcqs_video_to_quiz(db: Session, quiz_id: int, questions: list[dict]):
    db_mcqs_list = []

    for q in questions:
        db_mcqs_list.append(
            db_models.MCQsVideoToQuiz(
                quiz_id=quiz_id,
                question=q["question"],
                a=q["options"]["A"],
                b=q["options"]["B"],
                c=q["options"]["C"],
                d=q["options"]["D"],
                correct_answer=q["correct_answer"],
                explanation=q["explanation"],
            )
        )

    db.add_all(db_mcqs_list)
    db.commit()

    for obj in db_mcqs_list:
        db.refresh(obj)

    return db_mcqs_list


def add_quiz_result(db: Session, quiz_id: int, user_id: str, total_correct_attempt: int, total_wrong_attempt: int,
                    not_attempted: int):
    # checking if the number of questions are same in both the quiz and result
    total_question = total_wrong_attempt + total_correct_attempt + not_attempted
    no_extra_or_less_questions = db.query(db_models.VideoToQuiz).filter(
        db_models.VideoToQuiz.id == quiz_id,
        db_models.VideoToQuiz.no_of_questions ==total_question
    ).first()

    if not no_extra_or_less_questions:
        raise ValueError(f"Question count mismatch. Expected questions don't match provided answers.")

    # checking if the quiz is already attempted or not,
    # if attempted there will be some result already stored in the db,
    # and we are updating the result then
    existing = db.query(db_models.MCQsVideoToQuizResult).filter(
        db_models.MCQsVideoToQuizResult.quiz_id == quiz_id,
                db_models.MCQsVideoToQuizResult.user_id == user_id
                ).first()


    if existing:
        existing.total_correct_attempt = total_correct_attempt
        existing.total_wrong_attempt = total_wrong_attempt
        existing.not_attempted = not_attempted
        result = existing

    # if it is the first time, we will simply add the result into the db.
    else:
        result = db_models.MCQsVideoToQuizResult(quiz_id=quiz_id, user_id=user_id,
                                                 total_correct_attempt=total_correct_attempt,
                                                 total_wrong_attempt=total_wrong_attempt, not_attempted=not_attempted)
        db.add(result)

    db.commit()
    db.refresh(result)
    return result

def get_quiz_result(db: Session, quiz_id: int, user_id: str):
    return (db.query(db_models.MCQsVideoToQuizResult)
            .filter(db_models.MCQsVideoToQuizResult.quiz_id == quiz_id)
            .filter(db_models.MCQsVideoToQuizResult.user_id == user_id)).first()
