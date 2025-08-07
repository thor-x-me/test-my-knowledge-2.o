import json
import logging
from typing import List, Dict, Optional, Tuple


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QuizService:
    """
    Service class for managing quiz, scoring, and quiz logic.
    Integrates with GeminiService for question generation.
    """
    
    def __init__(self, questions: list, difficulty: str):
        """
        Initialize the Quiz service with Gemini API key.
        
        Args:
            questions (list): questions of the quiz with their options, answers, and explanation.
        """
        self.difficulty = difficulty
        self.questions = questions
        self.current_question_idx = 0
        self.totaL_questions = len(questions)
        not_attempted = "_"
        self.score = [not_attempted for question in questions]

    def get_quiz_info(self):
        return {
            "total_questions": self.totaL_questions,
            "difficulty": self.difficulty,
        }

    def start_quiz(self) -> Dict:
        """
        Start the quiz session with question of following format
        [
            {
                "question": first question,
                "options": {
                    "A": option A,
                    "B": option B,
                    "C": option C,
                    "D": option D,
                },
                "correct_answer": correct option either A,B,C or D,
                "explanation": Explanation for the correct option,"
            },

        ]
        Returns:
            Dict: first question
        """        
        if len(self.questions) > 0:     # checking if questions are available to server
            return {
                "success": True,
                "current_question_idx": self.current_question_idx,
                "question": self.questions[self.current_question_idx]["question"],
                "options": self.questions[self.current_question_idx]["options"],
                "attempt_status": False if self.score[self.current_question_idx] == "_" else True
            }
        return {
                "success": False,
                "current_question": 0,
                "total_questions": self.totaL_questions,
                "question": "No question to present."
            }
    

    def get_next_question(self, ongoing_question_idx: int) -> Dict:
        """
        Get the current question for the quiz session.
        
        Args:
            ongoing_question_idx (str): question index of the current question.
            
        Returns:
            Dict: Current question information
        """

        current_idx = self.current_question_idx
        if current_idx >= ongoing_question_idx or ongoing_question_idx < 0:     # we are not using any negative indexing
            return {"error": "No more questions"}

        self.current_question_idx += 1      # selected next question
        return {
            "success": True,
            "current_question_idx": self.current_question_idx,
            "question": self.questions[self.current_question_idx]["question"],
            "options": self.questions[self.current_question_idx]["options"],
            "attempt_status": False if self.score[self.current_question_idx] == "_" else True
        }
    

    def submit_answer(self, ongoing_question_idx: int, selected_option: str) -> Dict:
        """
        Submit an answer for the current question.
        
        Args:
            ongoing_question_idx (int): question index of the current question.
            selected_option (str): User's answer (A, B, C, or D)
            
        Returns:
            Dict: Answer submission result
        """

        if self.totaL_questions <= ongoing_question_idx or ongoing_question_idx < 0:            # we are not using negative indexing here
            return {"error": "Something went wrong!"}


        correct_option = self.questions[ongoing_question_idx]["correct_answer"]
        
        # Validate answer format
        answer = selected_option.upper().strip()
        if answer not in ["A", "B", "C", "D"]:
            return {"error": "Invalid answer format. Use A, B, C, or D"}
        
        # Check if answer is correct
        is_correct = answer == correct_option
        if is_correct:
            self.score[ongoing_question_idx] = 1
        else:
            self.score[ongoing_question_idx] = 0

        return {
            "success": True,            # request to check answer completed successfully
            "result": is_correct,       # True if the selected option was correct else False
            "correct_answer": correct_option,  # The correct answer key (A, B, C, or D)
            "explanation": self.questions[ongoing_question_idx]["explanation"] if is_correct else "Wrong!",
        }
    

    def get_quiz_results(self) -> Dict:
        """
        Get final results for a completed quiz session.

        Returns:
            Dict: Quiz results
        """

        correct_answers = self.score.count(1)
        wrong_answers = self.score.count(0)
        not_attempted = "_"

        return {
            "success": True,
            "total_correct": correct_answers,
            "total_wrong": wrong_answers,
            "not_attempted": not_attempted,
            "total_questions": self.totaL_questions,
            "percentage": round((correct_answers/self.totaL_questions) * 100, 2)
        }


