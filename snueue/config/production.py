import os
from snueue.config.base import *

def get_secret(key):
    secret = os.environ.get(key)
    if secret is None:
        raise KeyError("Missing secret {}".format(key))
    return secret

DEBUG = False
PROPOGATE_EXCEPTIONS = True
BASE_URL = get_secret('SNUEUE_BASE_URL')

SECRET_KEY = get_secret('SNUEUE_SECRET_KEY')

# Redis settings
REDIS_URL = get_secret('REDIS_SNUEUE_PORT_6379_TCP_ADDR')

# Reddit API settings
REDDIT_AUTH_EXPIRE = 120
REDDIT_USER_AGENT = get_secret('SNUEUE_REDDIT_USER_AGENT')
REDDIT_CLIENT_ID = get_secret('SNUEUE_REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = get_secret('SNUEUE_REDDIT_CLIENT_SECRET')
REDDIT_CALLBACK_URL = REDDIT_CALLBACK_ENDPOINT.format(BASE_URL)

# Log exceptions to stderr
import logging
from logging import StreamHandler
stream_handler = StreamHandler()
stream_handler.setLevel(logging.WARNING)
formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
stream_handler.setFormatter(formatter)
LOGGING_HANDLER = stream_handler
