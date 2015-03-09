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

# Security Settings
#
# Option to turn off SSL by setting this to "0". Useful for testing
# production config locally. Otherwise SSL should always be on.
USE_SSL = False if get_secret('SNUEUE_USE_SSL') == '0' else True
SECRET_KEY = get_secret('SNUEUE_SECRET_KEY')
SESSION_COOKIE_SECURE = True if USE_SSL else False
PROTOCOL = "https" if USE_SSL else "http"

# Reddit API settings
REDDIT_AUTH_EXPIRE = 120
REDDIT_USER_AGENT = get_secret('SNUEUE_REDDIT_USER_AGENT')
REDDIT_CLIENT_ID = get_secret('SNUEUE_REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = get_secret('SNUEUE_REDDIT_CLIENT_SECRET')
REDDIT_CALLBACK_URL = REDDIT_CALLBACK_ENDPOINT.format(protocol=PROTOCOL,
                                                      base_url=BASE_URL)

# Log exceptions to stderr
import logging
from logging import StreamHandler
LOGGING_FORMAT = "%(name)s - %(levelname)s - %(message)s"
stream_handler = StreamHandler()
stream_handler.setLevel(LOGGING_LEVEL)
formatter = logging.Formatter(LOGGING_FORMAT)
stream_handler.setFormatter(formatter)
LOGGING_HANDLER = stream_handler
