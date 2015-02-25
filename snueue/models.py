from snueue import db
from config import Config as config
from flask.ext.login import UserMixin, LoginManager, make_secure_token

class RedisModel(object):

    def get_id(self):
        pass

    def set(self, items):
        atoms = {k: v for k, v in items.items() if not isinstance(v, (list, set))}
        iterables = {k: v for k, v in items.items() if isinstance(v, (list, set))}
        db.hmset(self.get_id(), atoms)
        for key, iterable in iterables.items():
            self.add(key, iterable)

    def add(self, set_name, items):
        if not isinstance(items, (list, set)):
            items = [items]
        pipe = db.pipeline()
        for item in items:
            pipe.sadd('{}:{}'.format(self.get_id(), set_name), item)
        return pipe.execute()

    def get(self, field):
        result = db.hmget(self.get_id(), field)
        if result is None:
            return None
        else:
            return result[0]

    def get_all(self, field):
        result = db.smembers("{}:{}".format(self.get_id(), field))
        return result

    def empty(set_name):
        db.delete('{}:{}'.format(self.get_id(), set_name))

class User(UserMixin, RedisModel):

    @classmethod
    def get_user(self, id):
        username = db.hget(id, 'username')
        return User(username)

    def __init__(self, username):
        self.username = username

    def get_id(self):
        return 'user:{}'.format(self.username)

    """Create and save a new remember token for an authentiated user.

    Session tokens are created using the username encrypted with the
    app's secret key via HMAC.
    """
    def set_remember_token(self):
        token = make_secure_token(self.username)
        self.set({'remember_token': token})
        db.set('remember_token:{}'.format(token), self.get_id())

    def clear_remember_token(self):
        token = self.get('remember_token')
        db.delete('remember_token:{}'.format(token))

    def get_auth_token(self):
        print "Getting your auth"
        return self.get('remember_token')

    def access_information(self):
        return {
            'access_token': self.get('access_token'),
            'refresh_token': self.get('refresh_token'),
            'scope': self.get_all('scope')
        }
