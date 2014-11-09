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

    def __len__(self):
        return len(self.submissions)

    def __str__(self):
        return "SubmissionCollection({})".format(
                    str([s.id for s in self.submissions]))

def media_type(submission):
    return 'youtube'

def media_id(submission, type):
    type = media_type(submission)
    if type == 'youtube':
        # Youtube video ids are an 11 digit base-64 encoded string usually
        # embedded the form "v=<id>", "v%3D<id>" or "embed/<id>"
        m = (re.search('(?<=v%3D)[A-Za-z0-9_-]{11}', submission.url) or
             re.search('(?<=v=)[A-Za-z0-9_-]{11}', submission.url) or
             re.search('[A-Za-z0-9_-]{11}', submission.url))
        return m.group()

def get_fetch_method(subreddit, sorting):
    """Return the appropriate method for fetching submissions from a
    subreddit based on the sorting parameter.
    """
    return {
        'hot': subreddit.get_hot,
        'top': subreddit.get_top_from_day,
        'new': subreddit.get_new
    }[sorting]

def fetch_submissions(subreddit, sorting, excluded=None):
    fetch_method = get_fetch_method(subreddit, sorting);
    submissions = []
    limit = 25
    while len(submissions) <= 5 and limit <= 100:
        subs = fetch_method(limit=limit)
        # Filter out excluded submissions
        subs = [s for s in subs if s.id not in excluded]
        submissions = SubmissionCollection(subs)
        submissions = submissions.filter_self_posts().filter_media_type()
        limit *= 2
    return submissions

def get_submissions(source, sorting, excluded):
    r = praw.Reddit(user_agent=USER_AGENT)
    subreddit = r.get_subreddit(source)
    submissions = fetch_submissions(subreddit, sorting, excluded=excluded)
    return submissions.to_json()

