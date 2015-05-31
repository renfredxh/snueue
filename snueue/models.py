from snueue.utils import console
from flask.ext.login import UserMixin

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

    def __str__(self):
        return "{}:{} {}".format(self.name, self.id, self.__dict__)

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
