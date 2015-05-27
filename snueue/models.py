from snueue import db
from flask.ext.login import UserMixin

class RedisAdapter:
    database = db

    def get_db(self):
        pass

    @classmethod
    def format_key(self, type, id):
        return '{}:{}'.format(type, id)

    @classmethod
    def get(self, key_type, id):
        if isinstance(key_type, str):
            key = self.format_key(key_type, id)
            return db.get(key)
        elif issubclass(key_type, RedisModel):
            key = self.format_key(key_type.name, id)
            data = db.hgetall(key)
            if data is None: return None
            for set_name in key_type.sets:
                data[set_name] = db.smembers(self.format_key(key, set_name))
            return key_type(id, data)
        else:
            raise TypeError("Key type must be a string or RedisModel")

    @classmethod
    def set(self, key_type, id, value, expiration=None):
        key = self.format_key(key_type, id)
        if expiration is not None:
            db.setex(key, expiration, value)
        db.set(key, value)

    @classmethod
    def save(self, model):
        pipe = db.pipeline()
        key = self.format_key(model.name, model.id)
        pipe.hmset(key, model.modified)
        for set_field in model.sets:
            set_key = self.format_key(key, set_field)
            old_set = db.smembers(set_key)
            new_set = model.__dict__[set_field]
            add = new_set.difference(old_set)
            remove = old_set.difference(new_set)
            for item in add:
                pipe.sadd(set_key, item)
            for item in remove:
                pipe.srem(set_key, item)

    @classmethod
    def delete(self, model, id):
        db.delete(self.format_key(model, id))

class RedisModel:
    name = None
    fields = ()
    sets = ()

    def __init__(self, id, data=None):
        self.modified = {}
        if data is not None:
            self.__dict__ = data
        self.id = id

    def __setattr__(self, name, value):
        super().__setattr__(name, value)
        if name in self.fields:
            self.modified[name] = value
        self.__dict__[name] = value

class User(UserMixin, RedisModel):
    name = 'user'
    fields = (
        'username', 'access_token', 'refresh_token', 'remember_token', 'last_refresh'
    )
    sets = ('scope',)

    def get_id(self):
        return self.username

    def get_auth_token(self):
        return self.remember_token

    def access_information(self):
        return {
            'access_token': self.access_token,
            'refresh_token': self.refresh_token,
            'scope': self.scope
        }
