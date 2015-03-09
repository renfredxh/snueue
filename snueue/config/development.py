import yaml
import logging
from logging import NullHandler
from snueue.config.base import *

SECRETS_FILE = "snueue/config/secrets.yml"
SECRETS = None

try:
    with open(SECRETS_FILE, 'r') as f:
        SECRETS = yaml.load(f)
except (OSError, IOError) as e:
    print("Warning: missing secrets file {}".format(SECRETS_FILE))

def get_secret(key):
    secret = SECRETS.get(key, None)
    if secret is None:
        print("Warning: missing secret {}".format(key))
    return secret

DEBUG = True
ASSETS_DEBUG = True

SECRET_KEY = get_secret('SNUEUE_SECRET_KEY')

# Reddit API settings
REDDIT_USER_AGENT = get_secret('SNUEUE_REDDIT_USER_AGENT')
REDDIT_CLIENT_ID = get_secret('SNUEUE_REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = get_secret('SNUEUE_REDDIT_CLIENT_SECRET')

# Logging
# Use a no-op logger for developmenet since logs are printed by the
# debug server automatically.
LOGGING_LEVEL = logging.DEBUG
null_handler = NullHandler()
null_handler.setLevel(LOGGING_LEVEL)
LOGGING_HANDLER = null_handler
