import os
import filetype
from dotenv import load_dotenv
from fastapi import HTTPException, Request
from clerk_backend_api import Clerk, AuthenticateRequestOptions
import logging


load_dotenv()
logger = logging.getLogger(__name__)


clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

def authenticate_user_get_user_details(request):
    auth_header = request.headers.get("authorization")
    try:
        request_state = clerk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                authorized_parties=["http://localhost:3000", "http://localhost:8000", "http://localhost:5173", "https://learn-with-yuki-frontend.vercel.app/"],   #use the frontend port address or source of request
                jwt_key=os.getenv("JWT_KEY")
            )
        )
        print(request_state)
        if not request_state.is_signed_in:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_id = request_state.payload.get("sub")
        return {"user_id": user_id}

    except Exception as e:
        logger.exception(f"Error logging in user: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authentication")


def get_audio_format(file_path: str) -> str | None:
    kind = filetype.guess(file_path)
    if kind:
        return kind.extension  # e.g. "mp3", "wav", "ogg", "flac"
    return None
