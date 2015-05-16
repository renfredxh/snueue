import logging
from logging import NullHandler
from snueue.config.base import *

DEBUG = True
ASSETS_DEBUG = True

SECRET_KEY = get_secret('SNUEUE_SECRET_KEY')

# Optional host to be passed into app.run. Useful for running in docker 
# so app can run with the host as 0.0.0.0 and be accessible from the host.
# Defaults to 127.0.0.1 (localhost)
HOST = get_secret('SNUEUE_HOST', False)

REDIS_HOST = get_secret('SNUEUE_DATABASE_HOST', False) or "localhost"

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
