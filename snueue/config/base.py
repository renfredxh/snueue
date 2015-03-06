import os
from socket import gethostname

BASE_URL = "http://localhost:5000"
HOSTNAME = gethostname()

REDIS_URL = os.environ.get('REDIS_SNUEUE_PORT_6379_TCP_ADDR') or "localhost"
REDIS_PORT = 6379
REDIS_DB = 0

REDDIT_AUTH_EXPIRE = 120
# This needs to match the redirect uri on reddit.com/prefs/apps exactly
REDDIT_CALLBACK_ENDPOINT = "{}/callback/reddit"
REDDIT_CALLBACK_URL = REDDIT_CALLBACK_ENDPOINT.format(BASE_URL)

MOCK_API = {
    'submissions': [
        {
            'id': '1',
            'title': 'Rick Astley - Never Gonna Give You Up',
            'type': 'youtube',
            'url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            'media_id': 'dQw4w9WgXcQ',
            'permalink': 'http://reddit.com'
        },
        {
            'id': '4',
            'title': 'KXVO "Pumpkin Dance',
            'type': 'youtube',
            'url': 'http://youtu.be/v4IC7qaNr7I',
            'media_id': 'v4IC7qaNr7I',
            'permalink': 'http://reddit.com'
        }
    ]
}