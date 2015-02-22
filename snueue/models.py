import redis
from config import Config as config
from flask.ext.login import UserMixin, LoginManager

class RedisModel(object):

    def get_id(self):
        pass

    def set(self, items):
        atoms = {k: v for k, v in items.items() if not isinstance(v, (list, set))}
        iterables = {k: v for k, v in items.items() if isinstance(v, (list, set))}
        db = get_db()
        db.hmset(self.get_id(), atoms)
        for key, iterable in iterables.items():
            self.add(key, iterable)

    def add(self, set_name, items):
        if not isinstance(items, (list, set)):
            items = [items]
        db = get_db()
        pipe = db.pipeline()
        for item in items:
            pipe.sadd('{}:{}'.format(self.get_id(), set_name), item)
        return pipe.execute()

    def get(self, field):
        db = get_db()
        result = db.hmget(self.get_id(), field)
        if result is None:
            return None
        else:
            return result[0]

    def get_all(self, field):
        db = get_db()
        result = db.smembers("{}:{}".format(self.get_id(), field))
        return result

    def empty(set_name):
        db = get_db()
        s.delete('{}:{}'.format(self.get_id(), set_name))

    def access_information(self):
        return {
            'access_token': self.get('access_token'),
            'refresh_token': self.get('refresh_token'),
            'scope': self.get_all('scope')
        }

class User(UserMixin, RedisModel):

    def __init__(self, username):
        self.username = username

    def get_id(self):
        return 'user:{}'.format(self.username)

    @classmethod
    def get_user(self, id):
        db = get_db()
        username = db.hget(id, 'username')
        return User(username)

def get_db():
    return redis.StrictRedis(host=config.REDIS_URL, port=config.REDIS_PORT,
                             db=config.REDIS_DB)
