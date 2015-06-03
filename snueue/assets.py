from flask.ext.assets import Bundle, Environment

from snueue import app

def bundle_stylesheets():
    css = Bundle(
        'stylesheets/app.scss',
        filters='compass',
        output='build/app.css',
        depends='stylesheets/**/*.scss'
    )
    return css

assets = Environment(app)
assets.register('stylesheets', bundle_stylesheets())
