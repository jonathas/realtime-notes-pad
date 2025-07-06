import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import json

# Initialize Firebase Admin SDK
def initialize_firebase():
    try:
        # Try to get credentials from environment variable
        firebase_key = os.getenv("FIREBASE_PRIVATE_KEY")
        if firebase_key:
            # Parse the private key (replace \\n with actual newlines)
            firebase_key = firebase_key.replace('\\n', '\n')
            
            cred_dict = {
                "type": "service_account",
                "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                "private_key": firebase_key,
                "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK initialized successfully")
        else:
            print("⚠️ Firebase credentials not found - running without authentication")
    except Exception as e:
        print(f"⚠️ Firebase initialization failed: {e}")

# Call during app startup
initialize_firebase()

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify Firebase ID token and return user info.
    Returns None if no token provided (for optional auth).
    """
    if not credentials:
        return None
    
    try:
        # Verify the Firebase ID token
        decoded_token = auth.verify_id_token(credentials.credentials)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
            "name": decoded_token.get("name"),
            "picture": decoded_token.get("picture")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

async def require_auth(user = Depends(get_current_user)):
    """
    Require authentication - raises 401 if no valid token provided.
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user