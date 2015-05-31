from uuid import uuid4
from datetime import datetime

import praw

from snueue import app
from snueue.models import User
from snueue.services import login, database

TIMESTAMP_FORMAT = "%d %b %Y %H:%M:%S"
AUTH_EXPIRE_TIME = 55*60 # 55 minutes in seconds

class AuthenticationFailure(Exception):
    pass

def get_timestamp():
    now = datetime.now()
    return now.strftime(TIMESTAMP_FORMAT)

def get_reddit_session():
    return praw.Reddit(user_agent=app.config['REDDIT_USER_AGENT'])

def get_reddit_oauth_session():
    r = get_reddit_session()
    r.set_oauth_app_info(
        client_id=app.config['REDDIT_CLIENT_ID'],
        client_secret=app.config['REDDIT_CLIENT_SECRET'],
        redirect_uri=app.config['REDDIT_CALLBACK_URL']
    )
    return r


def update_access_information(user, access_info):
    user.last_refresh = get_timestamp()
    user.access_token, user.refresh_token, user.scope = (
        access_info['access_token'], access_info['refresh_token'],
        access_info['scope']
    )

def get_reddit_user_session(username):
    r = get_reddit_oauth_session()
    user = database.get(User, username)
    last_refresh = datetime.strptime(user.last_refresh, TIMESTAMP_FORMAT)
    now = datetime.now()
    if (now - last_refresh).seconds > AUTH_EXPIRE_TIME:
        refresh_token = user.refresh_token
        access_information = r.refresh_access_information(refresh_token)
        update_access_information(user, access_information)
    access_information = user.access_information()
    r.set_access_credentials(**access_information)
    return r

def authorize():
    r = get_reddit_oauth_session()
    scope = ['identity', 'history', 'vote']
    state = str(uuid4())
    url = r.get_authorize_url(state, scope, True)
    database.set('authentication_state', state, 1,
                     expiration=app.config['REDDIT_AUTH_EXPIRE'])
    return url

def authenticate(state, code):
    r = get_reddit_oauth_session()
    if database.get('authentication_state', state) is None:
        raise AuthenticationFailure("Invalid state token")
    database.delete('authentication_state', state)
    access_information = r.get_access_information(code)
    authenticated_user = r.get_me()
    username = authenticated_user.name
    user = User(username)
    user.username = username
    update_access_information(user, access_information)
    database.save(user)
    login.set_remember_token(user)
    return user
