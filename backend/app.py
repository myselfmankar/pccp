import random
from flask import Flask, request, jsonify
import boto3
from cryptography.fernet import Fernet
import hashlib, math
import requests
from config import Config
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def distance(p1, p2):
    return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)


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


def encrypt(data):
    print(f"Encrypting key: {fernet}")
    return fernet.encrypt(data.encode()).decode()

def decrypt(data):
    print(f"Decrypting key: {fernet}")
    return fernet.decrypt(data.encode()).decode()

def hash_password(password):
    
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_email = data.get('user_email')
    password = data.get('password')
    hashed_password = hash_password(password)
    coordinates = data.get('coordinates')
    encrypted_coordinates = encrypt(str(coordinates))
    image_url = data.get('image_url')

    try:
        users_table.put_item(
            Item={
                'user_email': user_email,
                'password': hashed_password,
                'master_image_url': image_url,
                'master_coordinates': encrypted_coordinates,
            }
        )
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        print(f"Error during PutItem: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_registration_image', methods=['GET'])
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
        return jsonify({'error': str(e)}), 500

@app.route('/get_pccp_image', methods=['GET'])
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
def login():
    data = request.get_json()
    user_email = data.get('user_email')
    password = data.get('password')
    coordinates = data.get('coordinates')
    hashed_password = hash_password(password)
    print(coordinates)
    try:
        response = users_table.get_item(Key={'user_email': user_email})
        user = response.get('Item')

        if user and user['password'] == hashed_password:
            print("User found and password matches")
            print("Master coordinates ",user['master_coordinates'])
            print("Coordinates ",decrypt(user['master_coordinates']))
            stored_coordinates = eval(decrypt(user['master_coordinates'])) #Decrypt and convert to list of dicts.
            print(stored_coordinates)
            print(coordinates)
            if len(coordinates) != len(stored_coordinates):
                return jsonify({'message': 'Incorrect number of PCCP coordinates'}), 401

            matches = 0
            for coord in coordinates:
                for stored_coord in stored_coordinates:
                    if coord['x'] == stored_coord['x'] and coord['y'] == stored_coord['y']:
                        matches += 1
                        break
            if matches == len(coordinates):
                return jsonify({'message': 'Login successful'}), 200
            else:
                return jsonify({'message': 'Incorrect PCCP coordinates'}), 401
        else:
            return jsonify({'message': 'Invalid email or password'}), 401
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500
    
    

@app.route('/store_pccp', methods=['POST'])
def store_pccp():
    data = request.get_json()
    user_name = data.get('user_name')
    site_url = data.get('site_url')
    encrypted_password = encrypt(data.get('password'))

    try:
        passwords_table.put_item(
            Item={
                'user_name': user_name,
                'site_url': site_url,
                'password': encrypted_password,
            }
        )
        return jsonify({'message': 'PCCP data stored successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_password', methods=['GET'])
def get_password():
    user_name = request.args.get('user_name')
    site_url = request.args.get('site_url')

    try:
        response = passwords_table.get_item(Key={'user_name': user_name, 'site_url': site_url})
        if 'Item' in response:
            item = response['Item']
            decrypted_password = decrypt(item['password'])

            user_response = users_table.get_item(Key={'user_name': user_name})
            if 'Item' in user_response:
                master_image_url = user_response['Item']['master_image_url']
                master_coordinates = decrypt(user_response['Item']['master_coordinates'])

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
        return jsonify({'error': str(e)}), 500

@app.route('/get_pccp_login', methods=['POST'])
def get_pccp_login():
    data = request.get_json()
    user_email = data.get('user_email')

    try:
        response = users_table.get_item(Key={'user_email': user_email})
        user = response.get('Item')
        if user and 'master_image_url' in user:
            return jsonify({'image_url': user['master_image_url']}), 200
        else:
            return jsonify({'error': 'Image not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)