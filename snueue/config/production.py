import os
from snueue.config.base import *

DEBUG = False
PROPOGATE_EXCEPTIONS = True
TRAP_HTTP_EXCEPTIONS = False
BASE_URL = get_secret('SNUEUE_BASE_URL')
REDIS_HOST = (get_secret('SNUEUE_DATABASE_HOST', False) or
              get_secret('REDIS_SNUEUE_PORT_6379_TCP_ADDR', False))

# Security Settings
#
# Option to turn off SSL by setting this to "0". Useful for testing
# production config locally. Otherwise SSL should always be on.
USE_SSL = False if get_secret('SNUEUE_USE_SSL', False) == '0' else True
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
# Assets settings
COMPASS_CONFIG = {'output_style': ':compressed'}

# Logging settings
import logging
from logging.handlers import SMTPHandler

# Log info to stderr
stream_handler = logging.StreamHandler()
logging_format = "%(name)s - %(levelname)s - %(message)s"
formatter = logging.Formatter(logging_format)
stream_handler.setFormatter(formatter)
LOGGING_HANDLER = stream_handler

# Option to log errors via email
LOGGING_MAIL_HANDLER = None
ADMIN_EMAIL = get_secret('SNUEUE_ADMIN_EMAIL', False)
if ADMIN_EMAIL is not None:
    mail_server = get_secret('SNUEUE_LOGGING_MAIL_SERVER')
    mail_user = get_secret('SNUEUE_LOGGING_MAIL_USER')
    mail_pass = get_secret('SNUEUE_LOGGING_MAIL_PASS')
    mail_handler = SMTPHandler((mail_server, 587), 'errors@snueue.audio',
                               [ADMIN_EMAIL], 'Snueue Server Error',
                               (mail_user, mail_pass))
    mail_handler.setLevel(logging.ERROR)
    LOGGING_MAIL_HANDLER = mail_handler
