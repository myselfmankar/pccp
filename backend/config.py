from dotenv import load_dotenv
import os, base64

load_dotenv()  # Load environment variables from .env file

class Config:
    AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY')
    AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION = os.getenv('AWS_REGION')
    S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
    DYNAMODB_USERS_TABLE = os.getenv('DYNAMODB_USERS_TABLE')
    DYNAMODB_PASSWORDS_TABLE = os.getenv('DYNAMODB_PASSWORDS_TABLE')
    FERNET_SECRET_KEY = (os.getenv('FERNET_SECRET_KEY'))
    UNSPLASH_ACCESS_KEY = (os.getenv('UNSPLASH_ACCESS_KEY'))
    