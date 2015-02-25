from flask import Flask
from flask.ext.login import LoginManager
from flask.ext.assets import Environment, Bundle
from flaskext.compass import Compass

app = Flask(__name__, static_folder='assets')

app.config.from_object('snueue.config.Production')
app.secret_key = app.config['SECRET_KEY']
assets = Environment(app)

login_manager = LoginManager()
login_manager.init_app(app)

import snueue.views
