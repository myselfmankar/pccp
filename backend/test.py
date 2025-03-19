from wsgiref import headers
from config import Config
import requests

print(Config.UNSPLASH_ACCESS_KEY)
headers = {"Authorization": f"Client-ID {Config.UNSPLASH_ACCESS_KEY}"}
response = requests.get("https://api.unsplash.com/photos/random", headers=headers)
if response.status_code == 200:
    image_url = response.json()['urls']['regular']
    print(image_url)
else:
    print(response.status_code)
    print("unable to fetch image from Unsplash")
