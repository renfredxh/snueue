from flask import Flask
from flask.ext.assets import Environment

app = Flask(__name__, static_folder='assets')
app.config.from_object('snueue.config.base')

assets = Environment(app)

import snueue.views
