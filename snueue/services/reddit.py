import re
from datetime import datetime
from uuid import uuid4

import praw

from snueue import app
from snueue.models import User
from snueue.services import login, database

TIMESTAMP_FORMAT = "%d %b %Y %H:%M:%S"
AUTH_EXPIRE_TIME = 55*60 # 55 minutes in seconds

class AuthenticationFailure(Exception):
    pass

class SubmissionCollection:

    def __init__(self, submissions):
        self.submissions = [s for s in submissions]

    @staticmethod
    def media_type(submission):
        """Determine the platform the submission links to based on its url"""
        url = submission.url
        types = {
            'youtube': [r'youtube\.', 'youtu\.be']
        }
        for t, patterns in types.items():
            if any([re.search(p, url) for p in patterns]):
                return t
        return None

    @staticmethod
    def media_id(submission, sub_type):
        sub_type = SubmissionCollection.media_type(submission)
        if sub_type == 'youtube':
            # Youtube video ids are an 11 digit base-64 encoded string usually
            # embedded the form "v=<id>", "v%3D<id>" or "embed/<id>"
            m = (re.search('(?<=v%3D)[A-Za-z0-9_-]{11}', submission.url) or
                 re.search('(?<=v=)[A-Za-z0-9_-]{11}', submission.url) or
                 re.search('[A-Za-z0-9_-]{11}', submission.url))
            return m if m is None else m.group()

    def filter_self_posts(self):
        return SubmissionCollection([s for s in self.submissions if not s.is_self])

    def filter_media_type(self):
        """Return all submissions in the collection that have a supported
        media type.
        """
        return SubmissionCollection([
            s for s in self.submissions if SubmissionCollection.media_type(s)
        ])

    def to_json(self):
        return [
            {
                'id': submission.id,
                'media_id': SubmissionCollection.media_id(submission, type),
                'title': submission.title,
                'type': SubmissionCollection.media_type(submission),
                'url': submission.url,
                'permalink': submission.permalink
            }
        for submission in self.submissions]

    def __len__(self):
        return len(self.submissions)

    def __str__(self):
        return "SubmissionCollection({})".format(
                    str([s.id for s in self.submissions]))

def get_fetch_method(subreddit, sorting):
    """Return the appropriate method for fetching submissions from a
    subreddit based on the sorting parameter.
    """
    return {
        'hot': subreddit.get_hot,
        'new': subreddit.get_new,
        'hour': subreddit.get_top_from_hour,
        'day': subreddit.get_top_from_day,
        'week': subreddit.get_top_from_week,
        'month': subreddit.get_top_from_month,
        'year': subreddit.get_top_from_year,
        'all': subreddit.get_top_from_all
    }[sorting]

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

def get_submissions(source, sorting, excluded):
    r = get_reddit_session()
    subreddit = r.get_subreddit(source)
    fetch_method = get_fetch_method(subreddit, sorting);
    submissions = []
    limit = 25
    while len(submissions) <= 5 and limit <= 100:
        subs = fetch_method(limit=limit)
        try:
            # Filter out excluded submissions
            subs = [s for s in subs if s.id not in excluded]
        except praw.errors.RedirectException:
            submissions = SubmissionCollection([])
            break
        submissions = SubmissionCollection(subs)
        submissions = submissions.filter_self_posts().filter_media_type()
        limit += 25
    return submissions.to_json()

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

def vote(username, submission_id, direction):
    r = get_reddit_user_session(username)
    submission = r.get_submission(submission_id=submission_id)
    vote_action = {
        1: submission.upvote,
        0: submission.clear_vote,
        -1: submission.downvote
    }[int(direction)]
    return vote_action()