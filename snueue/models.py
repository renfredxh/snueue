from snueue.utils import console
from flask.ext.login import UserMixin

class RedisModel:
    model_name = None
    model_fields = ()
    model_sets = ()

    def __init__(self, id, data=None):
        if data is not None:
            self.__dict__ = data
        if not (isinstance(self.model_fields, tuple) and
                isinstance(self.model_sets, tuple)):
            raise TypeError("Model sets and fields must be tuples")
        self._modified = {}
        self.id = id

    def __setattr__(self, name, value):
        super().__setattr__(name, value)
        if name in self.model_fields:
            self._modified[name] = value
        self.__dict__[name] = value

    def __str__(self):
        return "{}:{} {}".format(self.model_name, self.id, self.__dict__)

class User(UserMixin, RedisModel):
    model_name = 'user'
    model_fields = (
        'username', 'access_token', 'refresh_token', 'remember_token', 'last_refresh'
    )
    model_sets = ('scope',)

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

class Artist(RedisModel):
    model_name = 'artist'
    model_fields = ('genre', 'location')
    model_sets = ('members', 'albums')
