import json
from cryptography.fernet import Fernet
from config import Config # or however you get your fernet object.

coordinates = [{'x': 0, 'y': 0}, {'x': 1, 'y': 0}, {'x': 1, 'y': 1}]

# Convert to JSON string
coordinates_json = json.dumps(coordinates)

# Encrypt
f = Config.FERNET_KEY.encode()
encrypted_coordinates = f.encrypt(coordinates_json.encode())

# Simulate storing in database (in reality, you'd save encrypted_coordinates to your db)
stored_in_db = encrypted_coordinates

print(f"Stored in database: {stored_in_db}") #this is what you get from DB

# Simulate retrieving from database
retrieved_from_db = stored_in_db

# Decrypt
try:
    decrypted_json = f.decrypt(retrieved_from_db).decode()
    print(f"Decrypted JSON: {decrypted_json}")

    # Parse JSON
    decrypted_coordinates = json.loads(decrypted_json)
    print(f"Decrypted coordinates: {decrypted_coordinates}")

except Exception as e:
    print(f"Decryption or parsing error: {e}")