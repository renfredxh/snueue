import praw
import re
from models import User, get_db
from uuid import uuid4
from config import Reddit as config

class AuthenticationFailure(Exception):
    pass

class SubmissionCollection(object):

    def __init__(self, submissions):
        self.submissions = [s for s in submissions]

    @staticmethod
    def media_type(submission):
        """Determine the platform the submission links to based on its url"""
        url = submission.url
        types = {
            'youtube': [r'youtube\.', 'youtu\.be']
        }
        for t, patterns in types.iteritems():
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

def get_submissions(source, sorting, excluded):
    r = praw.Reddit(user_agent=config.USER_AGENT)
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
    r = praw.Reddit(user_agent=config.USER_AGENT)
    r.set_oauth_app_info(
        client_id=config.CLIENT_ID,
        client_secret=config.CLIENT_SECRET,
        redirect_uri=config.CALLBACK_URL
    )
    scope = ['identity', 'history', 'vote']
    state = str(uuid4())
    url = r.get_authorize_url(state, scope, True)
    redis = get_db()
    state_key = 'authentication_state:{}'.format(state)
    redis.setex(state_key, config.AUTH_EXPIRE, 1)
    return url

def authenticate(state, code):
    r = praw.Reddit(user_agent=config.USER_AGENT)
    r.set_oauth_app_info(
        client_id=config.CLIENT_ID,
        client_secret=config.CLIENT_SECRET,
        redirect_uri=config.CALLBACK_URL
    )
    state_key = 'authentication_state:{}'.format(state)
    redis = get_db()
    if redis.get(state_key) is None:
        raise AuthenticationFailure("Invalid state token")
    redis.delete(state_key)
    access_information = r.get_access_information(code)
    authenticated_user = r.get_me()
    username = authenticated_user.name
    access_information.update({'username': username})
    user = User(username)
    user.set(access_information)
    return user

