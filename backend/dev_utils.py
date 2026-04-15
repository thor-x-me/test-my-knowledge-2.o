import requests
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class ClerkJWTGenerator:
    def __init__(self, secret_key: str):
        """
        Initialize the Clerk JWT generator.

        Args:
            secret_key: Your Clerk secret key (starts with 'sk_test_' or 'sk_live_')
        """
        self.secret_key = secret_key
        self.base_url = "https://api.clerk.com/v1"
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {secret_key}'
        }

    def create_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Create a new session for a user.

        Args:
            user_id: The Clerk user ID (starts with 'user_')

        Returns:
            Session data dictionary or None if failed
        """
        url = f"{self.base_url}/sessions"
        payload = {"user_id": user_id}

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            session_data = response.json()
            print(f"✓ Session created successfully")
            print(f"  Session ID: {session_data.get('id')}")
            print(f"  Status: {session_data.get('status')}")
            return session_data
        except requests.exceptions.RequestException as e:
            print(f"✗ Failed to create session: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"  Response: {e.response.text}")
            return None

    def get_jwt_token(self, session_id: str, expires_in_seconds: Optional[int] = None) -> Optional[str]:
        """
        Get JWT token for a session.

        Args:
            session_id: The session ID (starts with 'sess_')
            expires_in_seconds: Token expiration time in seconds (None for default)

        Returns:
            JWT token string or None if failed
        """
        url = f"{self.base_url}/sessions/{session_id}/tokens"
        payload = {"expires_in_seconds": expires_in_seconds}

        try:
            response = requests.post(url, headers=self.headers, json=payload)
            response.raise_for_status()
            token_data = response.json()
            jwt_token = token_data.get('jwt')
            print(f"✓ JWT token generated successfully")
            return jwt_token
        except requests.exceptions.RequestException as e:
            print(f"✗ Failed to get JWT token: {e}")
            if hasattr(e, 'response') and e.response:
                print(f"  Response: {e.response.text}")
            return None

    def generate_token(self, user_id: str, expires_in_seconds: Optional[int] = None) -> Optional[str]:
        """
        Complete workflow: create session and get JWT token.

        Args:
            user_id: The Clerk user ID (starts with 'user_')
            expires_in_seconds: Token expiration time in seconds (None for default)

        Returns:
            JWT token string or None if failed
        """
        print(f"\n=== Generating JWT token for user: {user_id} ===\n")

        # Step 1: Create session
        session = self.create_session(user_id)
        if not session:
            return None

        session_id = session.get('id')
        if not session_id:
            print("✗ No session ID in response")
            return None

        # Step 2: Get JWT token
        jwt_token = self.get_jwt_token(session_id, expires_in_seconds)

        if jwt_token:
            print(f"\n✅ JWT Token obtained successfully!")
            print(f"\n{'=' * 60}")
            print("JWT TOKEN:")
            print(f"{'=' * 60}")
            print(jwt_token)
            print(f"{'=' * 60}\n")

        return jwt_token


def main():
    SECRET_KEY = os.getenv("DEV_SECRET_KEY")
    USER_ID = os.getenv("DEV_USER_ID")

    # 3600 for 1 hour, None for default
    EXPIRES_IN_SECONDS = 3600

    # Create generator instance
    clerk = ClerkJWTGenerator(SECRET_KEY)

    # Generate token
    token = clerk.generate_token(USER_ID, EXPIRES_IN_SECONDS)

    # Use the token for testing
    if token:
        print(f"  Authorization: Bearer {token}")

        # Save token to file
        with open("jwt_token.txt", "w") as f:
            f.write(token)


if __name__ == "__main__":
    main()

import jwt  # pip install PyJWT
import base64


def decode_clerk_token(token: str):
    # Remove "Bearer " prefix if present
    if token.startswith("Bearer "):
        token = token[7:]

    # Decode without verification (just to read claims)
    decoded = jwt.decode(token, options={"verify_signature": False})
    print("Token claims:")
    for key, value in decoded.items():
        print(f"  {key}: {value}")
    return decoded


# # Usage: paste your token here
# token = "eyJhbGciOiJSUzI1NiIsImNhdCI6ImNsX0I3ZDRQRDExMUFBQSIsImtpZCI6Imluc18zOURLTGxDTW8yT044VzhkYjB0alFaRkNqdHgiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3NzYyNzgzOTYsImZ2YSI6Wzk5OTk5LC0xXSwiaWF0IjoxNzc2Mjc0Nzk2LCJpc3MiOiJodHRwczovL3RvcC1ob3JuZXQtOTUuY2xlcmsuYWNjb3VudHMuZGV2IiwibmJmIjoxNzc2Mjc0Nzg2LCJzaWQiOiJzZXNzXzNDUDZLc0xMQTIwN1ZZOHJSTWJuYWhBYUl2WSIsInN0cyI6ImFjdGl2ZSIsInN1YiI6InVzZXJfMzlKU1Y5a0NEUzZ2aEdpRHpVNk5GU2ZFdEw5IiwidiI6Mn0.hWTYGTJYHbvxGaN9xySQpjkXoNCoTxw5KjVYkFgGpcIq1OeCBhgZPLuB9vMDnvdv6HCxxPjLhWqpldI7peg0C8_buM5R0Azx3SefiRHi2p7ZIaEp4qQwUBa2qRj0zDCXg9GK4oX6avBYD4g7mspIr2NFuvU3tdTPuUNJXG2tRxzfowNAlFIxxSs9MvoqAA7FxW5oB4yZkruTzeiLnfsbWu-qaqaIb3STFlp7PTvIAOUyH9ecTf5BdyEdcuWH1mQYadug6j9UPSoExg7YAY3mE3h3vxN5ozAuNI0Zb-8AtGHpYaEhdEJJ1ir5YC0JG2v3kj58hIZT4DMvYqbW7wxGaw"
# decode_clerk_token(token)