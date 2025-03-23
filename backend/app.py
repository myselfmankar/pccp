import random
from flask import Flask, request, jsonify
import boto3
from cryptography.fernet import Fernet
import requests
from config import Config
from flask_cors import CORS
import json
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash, check_password_hash 
import bcrypt 
import logging
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError  # Import ClientError

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow requests from any origin
limiter = Limiter(get_remote_address, app=app, default_limits=["200 per day", "50 per hour"])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=Config.AWS_ACCESS_KEY,
    aws_secret_access_key=Config.AWS_SECRET_KEY,
    region_name=Config.AWS_REGION
)

users_table = dynamodb.Table(Config.DYNAMODB_USERS_TABLE)
passwords_table = dynamodb.Table(Config.DYNAMODB_PASSWORDS_TABLE)
SIMPLE_IMAGE_QUERIES = ["solid color", "geometric pattern", "abstract shape"]

fernet = Fernet(Config.FERNET_KEY.encode())
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
jwt = JWTManager(app)

def encrypt(data):
    logger.info(f"Encrypting data")
    return fernet.encrypt(data.encode()).decode()

def decrypt(data):
    logger.info(f"Decrypting data")
    return fernet.decrypt(data.encode()).decode()

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

@app.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    user_email = data.get('user_email')
    password = data.get('password')
    hashed_password = hash_password(password) 
    coordinates = data.get('coordinates')
    encrypted_coordinates = encrypt(json.dumps(coordinates))
    image_url = data.get('image_url')

    try:
        users_table.put_item(
            Item={
                'user_email': user_email,
                'password': hashed_password, 
                'master_image_url': image_url,
                'master_coordinates': encrypted_coordinates,
            },
            ConditionExpression='attribute_not_exists(user_email)'
        )
        return jsonify({'message': 'User registered successfully'}), 201
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'ConditionalCheckFailedException':
            return jsonify({'message': 'User already exists'}), 400
        elif error_code == 'ResourceNotFoundException':
            logger.error(f"Table not found: {e}")
            return jsonify({'error': 'Required DynamoDB table not found. Please check your table configuration.'}), 500
        else:
            logger.error(f"Error during PutItem: {e}")
            return jsonify({'error': str(e)}), 500
    except Exception as e:
        logger.error(f"Error during PutItem: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_registration_image', methods=['GET'])
@limiter.limit("10 per minute")
def get_registration_image():
    try:
        response = users_table.scan()
        if response['Items']:
            item = response['Items'][0]
            image_url = item['master_image_url']
            return jsonify({'image_url': image_url}), 200
        else:
            return jsonify({'error': 'No users found'}), 404
    except Exception as e:
        logger.error(f"Error fetching registration image: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/get_pccp_image', methods=['GET'])
@limiter.limit("10 per minute")
def get_pccp_image():
    headers = {"Authorization": f"Client-ID {Config.UNSPLASH_ACCESS_KEY}"}
    query = random.choice(SIMPLE_IMAGE_QUERIES)
    params = {"query": query}
    response = requests.get("https://api.unsplash.com/photos/random", headers=headers, params=params)
    if response.status_code == 200:
        image_url = response.json()['urls']['regular']
        return jsonify({'image_url': image_url}), 200
    else:
        return jsonify({'error': 'Failed to fetch image from Unsplash'}), 500

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    user_email = data.get('user_email')
    password = data.get('password')
    coordinates = data.get('coordinates')
    logger.info(f"Login attempt for user: {user_email}")
    try:
        response = users_table.get_item(Key={'user_email': user_email})
        user = response.get('Item')

        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            decrypted_coordinates = json.loads(decrypt(user['master_coordinates']))
            if decrypted_coordinates is None: 
                return jsonify({'message': 'Decryption error'}), 500

            if len(coordinates) != len(decrypted_coordinates):
                return jsonify({'message': 'Incorrect number of PCCP coordinates'}), 401

            sent_coordinates_set = {(int(coord['x']), int(coord['y'])) for coord in coordinates}
            stored_coordinates_set = {(int(coord['x']), int(coord['y'])) for coord in decrypted_coordinates}

            if sent_coordinates_set == stored_coordinates_set:
                payload = {
                'exp': datetime.now(timezone.utc) + timedelta(hours=1),
                'iat': datetime.now(timezone.utc),
                'sub': user_email
                }
                access_token = create_access_token(identity=user_email)
                return jsonify({'message': 'Login successful', 'token': access_token}), 200
            else:
                return jsonify({'message': 'Incorrect PCCP coordinates'}), 401
            
        else:
            return jsonify({'message': 'Invalid email or password'}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

@app.route('/store_pccp', methods=['POST'])
@limiter.limit("5 per minute")
def store_pccp():
    data = request.get_json()
    user_email = data.get('user_email')  # use user_email as the partition key
    site_url = data.get('site_url')
    encrypted_password = encrypt(data.get('password'))
    try:
        passwords_table.put_item(
            Item={
                'user_email': user_email,   # updated key
                'site_url': site_url,
                'username': data.get('username'),  # still store username if provided
                'password': encrypted_password,
            }
        )
        return jsonify({'message': 'PCCP data stored successfully'}), 201
    except Exception as e:
        logger.error(f"Error storing PCCP data: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_password', methods=['GET'])
@limiter.limit("10 per minute")
def get_password():
    user_email = request.args.get('user_email')  # updated parameter name
    site_url = request.args.get('site_url')
    try:
        response = passwords_table.get_item(Key={'user_email': user_email, 'site_url': site_url})
        if 'Item' in response:
            item = response['Item']
            decrypted_password = decrypt(item['password'])
            user_response = users_table.get_item(Key={'user_email': user_email})  # updated key
            if 'Item' in user_response:
                master_image_url = user_response['Item']['master_image_url']
                master_coordinates = json.loads(decrypt(user_response['Item']['master_coordinates']))
                return jsonify({
                    'password': decrypted_password,
                    'master_image_url': master_image_url,
                    'master_coordinates': master_coordinates,
                }), 200
            else:
                return jsonify({'message': 'User not found'}), 404
        else:
            return jsonify({'message': 'Password not found'}), 404
    except Exception as e:
        logger.error(f"Error fetching password: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_passwords', methods=['GET'])
@jwt_required()
@limiter.limit("10 per minute")
def get_passwords():
    user_email = request.args.get('user_email')
    try:
        response = passwords_table.query(
            KeyConditionExpression=Key('user_email').eq(user_email)
        )
        items = response.get('Items', [])
        return jsonify(items), 200
    except Exception as e:
        # If table or resource not found, return empty list
        if hasattr(e, 'response') and e.response.get('Error', {}).get('Code') == 'ResourceNotFoundException':
            return jsonify([]), 200
        logger.error(f"Error querying passwords table: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_pccp_login', methods=['POST'])
@limiter.limit("5 per minute")
def get_pccp_login():
    try:
        data = request.get_json()
        if not data or 'user_email' not in data:
            return jsonify({'error': 'Missing user_email in request'}), 400
            
        user_email = data.get('user_email')
        response = users_table.get_item(
            Key={
                'user_email': user_email
            }
        )
        
        if 'Item' in response:
            master_image_url = response['Item'].get('master_image_url')
            if master_image_url:
                return jsonify({'image_url': master_image_url}), 200
            return jsonify({'error': 'Image URL not found for user'}), 404
        return jsonify({'error': 'User not found'}), 404
        
    except boto3.exceptions.ClientError as e:
        error_code = e.response.get('Error', {}).get('Code')
        error_message = e.response.get('Error', {}).get('Message')
        logger.error(f"DynamoDB Error: {error_code} - {error_message}")
        return jsonify({'error': f'Database error: {error_message}'}), 500
    except Exception as e:
        logger.error(f"Error fetching PCCP login image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True)