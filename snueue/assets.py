import subprocess

from flask.ext.assets import Bundle, Environment
from webassets.filter import ExternalTool, register_filter
from webassets.exceptions import FilterError

from snueue import app

class BrowserifyFilter(ExternalTool):
    """Use Babelify and Browserify to transform and bundle javascript."""

    name = 'browserify'
    binary = name
    max_debug_level = None

    def input(self, infile, outfile, **kwargs):
        transforms = ['babelify']
        args = ['browserify']

        args.extend(['--transform'] + transforms)
        args.append(kwargs['source_path'])
        if app.config['DEBUG']:
            args.append('--debug')

        try:
            self.subprocess(args, outfile, infile)
        except FilterError as e:
            raise FilterError(str(e).replace('\\n', '\n'))

def bundle_stylesheets():
    css = Bundle(
        'stylesheets/app.scss',
        filters='compass',
        output='build/app.css',
        depends='stylesheets/**'
    )
    return css

def bundle_javascripts():
    vendor = Bundle(
        'javascripts/vendor/modernizr.js',
        'javascripts/vendor/jquery.js',
        'javascripts/vendor/fixedsticky.js',
        'javascripts/vendor/react/react-with-addons.js',
    )
    application = Bundle(
        'javascripts/application.js',
        filters='browserify',
        output='build/application.js',
        depends=('javascripts/**')
    )
    js = Bundle(
        vendor,
        application,
        filters='rjsmin',
        output='build/app.js'
    )
    return js

assets = Environment(app)
register_filter(BrowserifyFilter)
assets.register('stylesheets', bundle_stylesheets())
assets.register('javascripts', bundle_javascripts())
