from backend.services.gemini_services import GeminiService
import json

llm = GeminiService(api_key="AIzaSyDJw34iVHbEF_B-XFa_3lSJaq0oYjE4HME")

audio_data = """
The process in which a function calls itself directly or indirectly is called recursion and the corresponding function is called a recursive function.

A recursive algorithm takes one step toward solution and then recursively call itself to further move. The algorithm stops once we reach the solution.
Since called function may further call itself, this process might continue forever. So it is essential to provide a base case to terminate this recursion process.
Steps to Implement Recursion

Step1 - Define a base case: Identify the simplest (or base) case for which the solution is known or trivial. This is the stopping condition for the recursion, as it prevents the function from infinitely calling itself.

Step2 - Define a recursive case: Define the problem in terms of smaller subproblems. Break the problem down into smaller versions of itself, and call the function recursively to solve each subproblem.

Step3 - Ensure the recursion terminates: Make sure that the recursive function eventually reaches the base case, and does not enter an infinite loop.

Step4 - Combine the solutions: Combine the solutions of the subproblems to solve the original problem.
"""

question = llm.generate_quiz_questions(audio_content=audio_data, num_questions=5, difficulty="medium")

print(question)
with open("question2.json", "w") as file:
    json.dump(question, file, indent=4)
