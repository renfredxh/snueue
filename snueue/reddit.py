import praw

USER_AGENT = "Snueue test by /u/SeaCowVengeance"

class SubmissionCollection(object):

    def __init__(self, submissions):
        self.submissions = submissions

    def filter_self_posts(self):
        return SubmissionCollection([s for s in self.submissions if not s.is_self])

    def to_json(self):
        return [
            {
                'title': submission.title,
                'type': get_media_type(submission),
                'url': submission.url,
                'permalink': submission.permalink
            }
        for submission in self.submissions]

def get_media_type(submission):
    return 'youtube'

def get_submissions(location):
    r = praw.Reddit(user_agent=USER_AGENT)
    submissions = r.get_subreddit(location).get_hot(limit=10)
    sc = SubmissionCollection(submissions)
    sc = sc.filter_self_posts()
    return sc.to_json()

