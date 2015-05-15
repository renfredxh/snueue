import os
import logging
from logging import StreamHandler
from socket import gethostname

def get_secret(key, required=True):
    secret = os.environ.get(key)
    if secret is None and required:
        raise KeyError("Missing secret {}".format(key))
    return secret

BASE_URL = "localhost:5000"
PROTOCOL = "http"
HOSTNAME = gethostname()

REDIS_HOST = (get_secret('SNUEUE_DATABASE_HOST', False) or
              get_secret('SNUEUE_PORT_6379_TCP_ADDR', False) or "localhost")
REDIS_PORT = 6379
REDIS_DB = 0

REDDIT_AUTH_EXPIRE = 120
# This needs to match the redirect uri on reddit.com/prefs/apps exactly
REDDIT_CALLBACK_ENDPOINT = "{protocol}://{base_url}/callback/reddit"
REDDIT_CALLBACK_URL = REDDIT_CALLBACK_ENDPOINT.format(protocol=PROTOCOL,
                                                      base_url=BASE_URL)
# Logging
LOGGING_FORMAT = "%(name)s - %(levelname)s - %(message)s"
LOGGING_LEVEL = logging.INFO
stream_handler = StreamHandler()
stream_handler.setLevel(LOGGING_LEVEL)
formatter = logging.Formatter(LOGGING_FORMAT)
stream_handler.setFormatter(formatter)
LOGGING_HANDLER = stream_handler

MOCK_API = {
    'source': '/s/test',
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
