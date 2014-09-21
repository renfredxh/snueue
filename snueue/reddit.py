import praw
import re

USER_AGENT = "Snueue test by /u/SeaCowVengeance"

class SubmissionCollection(object):

    def __init__(self, submissions):
        self.submissions = [s for s in submissions]

    def filter_self_posts(self):
        return SubmissionCollection([s for s in self.submissions if not s.is_self])

    def filter_media_type(self):
        whitelist = ['tube', 'you']
        return SubmissionCollection([
            s for s in self.submissions if any([w in s.url for w in whitelist])
        ])

    def to_json(self):
        return [
            {
                'id': submission.id,
                'media_id': media_id(submission, type),
                'title': submission.title,
                'type': media_type(submission),
                'url': submission.url,
                'permalink': submission.permalink
            }
        for submission in self.submissions]

def media_type(submission):
    return 'youtube'

def media_id(submission, type):
    return {
        'youtube': re.search('[A-Za-z0-9_-]{11}', submission.url).group()
    }[media_type(submission)]

def get_fetch_method(subreddit, sorting):
    return {
        'hot': subreddit.get_hot,
        'top': subreddit.get_top_from_day,
        'new': subreddit.get_new
    }[sorting]

def get_submissions(source, sorting):
    r = praw.Reddit(user_agent=USER_AGENT)
    subreddit = r.get_subreddit(source)
    fetch_submissions = get_fetch_method(subreddit, sorting)
    submissions = fetch_submissions(limit=25)
    sc = SubmissionCollection(submissions)
    sc = sc.filter_self_posts()
    sc = sc.filter_media_type()
    return sc.to_json()

