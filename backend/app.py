from flask import Flask, request, jsonify
import boto3
from cryptography.fernet import Fernet
import os
import hashlib
import base64
import requests # For Unsplash API
from config import Config 
from flask_cors import CORS


app = Flask(__name__)
CORS(app) 

# AWS Configuration
dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=Config.AWS_ACCESS_KEY,
    aws_secret_access_key=Config.AWS_SECRET_KEY,
    region_name=Config.AWS_REGION
)

users_table = dynamodb.Table(Config.DYNAMODB_USERS_TABLE)
passwords_table = dynamodb.Table(Config.DYNAMODB_PASSWORDS_TABLE)

s3 = boto3.client(
    's3',
    aws_access_key_id=Config.AWS_ACCESS_KEY,
    aws_secret_access_key=Config.AWS_SECRET_KEY,
    region_name=Config.AWS_REGION
)

bucket_name = Config.S3_BUCKET_NAME
# Generate Fernet Key (FOR HACKATHON ONLY!)
fernet_key = Fernet.generate_key()
fernet = Fernet(fernet_key)

def encrypt(data):
    return fernet.encrypt(data.encode()).decode()

def decrypt(data):
    return fernet.decrypt(data.encode()).decode()

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_email = data.get('user_email')
    password = data.get('password')
    hashed_password = hash_password(password)

    try:
        users_table.put_item(
            Item={
                'user_email': user_email,
                'password': hashed_password,
            }
        )
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_email = data.get('user_email')
    password = data.get('password')
    hashed_password = hash_password(password)

    try:
        response = users_table.get_item(Key={'user_email': user_email})
        if 'Item' in response and response['Item']['password'] == hashed_password:
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/store_pccp', methods=['POST'])
def store_pccp():
    data = request.get_json()
    user_email = data.get('user_email')
    site_url = data.get('site_url')
    encrypted_password = encrypt(data.get('password'))
    coordinates = data.get('coordinates')
    encrypted_coordinates = encrypt(str(coordinates))

    # Fetch random image from Unsplash
    headers = {"Authorization": f"Client-ID {Config.UNSPLASH_ACCESS_KEY}"}
    response = requests.get("https://api.unsplash.com/photos/random", headers=headers)
    if response.status_code == 200:
        image_url = response.json()['urls']['regular']
    else:
        return jsonify({'error': 'Failed to fetch image from Unsplash'}), 500

    try:
        passwords_table.put_item(
            Item={
                'user_email': user_email,
                'site_url': site_url,
                'password': encrypted_password,
                'image_url': image_url,
                'coordinates': encrypted_coordinates,
            }
        )
        return jsonify({'message': 'PCCP data stored successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_password', methods=['GET'])
def get_password():
    user_email = request.args.get('user_email') 
    site_url = request.args.get('site_url') 

    try:
        response = passwords_table.get_item(Key={'user_email': user_email, 'site_url': site_url})
        print("ok")
        if 'Item' in response:
            item = response['Item']
            decrypted_password = decrypt(item['password'])
            decrypted_coordinates = decrypt(item['coordinates'])
            return jsonify({
                'password': decrypted_password,
                'image_url': item['image_url'],
                'coordinates': decrypted_coordinates,
            }), 200
        else:
            return jsonify({'message': 'Password not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)