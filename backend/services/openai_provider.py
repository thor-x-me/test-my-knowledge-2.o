import logging
from pydantic import BaseModel
from typing import List
from openai import OpenAI

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FileItem(BaseModel):
    type: str
    file_id: str


class OpenAIService:
    """
    Service class for interacting with OpenAI for text generation.
    """

    def __init__(self, api_key: str, model: str = "gpt-4o-mini") -> None:
        """
        Initialize the OpenAI service with API key.

        Args:
            api_key (str): OpenAI API key
        """
        self.client = OpenAI(api_key=api_key)
        self.model = model

    # Function to create a file id with the Files API
    def upload_file(self, file_path):
        with open(file_path, "rb") as file_content:
            result = self.client.files.create(
                file=file_content,
                purpose="vision",
            )
            return result.id

    def generate_response(self, prompt: str, file_items: list[FileItem] = None) -> str:

        input_object = [{
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                ],
            }]

        if file_items:
            for file_id_items in file_items:
                print('file_id_items', file_id_items)
                input_object[0]["content"].append(file_id_items)


        response = self.client.responses.create(
            model=self.model,
            input=input_object
        )
        return response



