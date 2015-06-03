from flask import Flask

app = Flask(__name__, static_folder='assets')
app.config.from_object('snueue.config.base')

import snueue.assets
import snueue.views
