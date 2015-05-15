import redis
from flask import Flask
from flask.ext.login import LoginManager
from flask.ext.assets import Environment, Bundle

app = Flask(__name__, static_folder='assets')

app.config.from_object('snueue.config.base')

assets = Environment(app)

login_manager = LoginManager()
login_manager.init_app(app)

db = redis.StrictRedis(host=app.config['REDIS_HOST'],
                       port=app.config['REDIS_PORT'],
                       db=app.config['REDIS_DB'],
                       decode_responses=True)

from snueue.models import User

@login_manager.user_loader
def load_user_from_id(id):
    return User.get_user(id)

@login_manager.token_loader
def load_token(token):
    id = db.get('remember_token:{}'.format(token))
    if id is None:
        return None
    return User.get_user(id)

import snueue.views
