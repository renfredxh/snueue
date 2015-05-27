import redis
from flask import Flask
from flask.ext.assets import Environment, Bundle

app = Flask(__name__, static_folder='assets')

app.config.from_object('snueue.config.base')

assets = Environment(app)

db = redis.StrictRedis(host=app.config['REDIS_HOST'],
                       port=app.config['REDIS_PORT'],
                       db=app.config['REDIS_DB'],
                       decode_responses=True)

import snueue.login
import snueue.views
