import subprocess

from flask.ext.assets import Bundle, Environment
from webassets.filter import Filter, register_filter
from webassets.exceptions import FilterError

from snueue import app

class BabelFilter(Filter):
    name = 'babel'
    max_debug_level = None

    def output(self, _in, out, **kwargs):
        out.write(_in.read())

    def input(self, _in, out, **kwargs):
        binary = 'babel'
        try:
            proc = subprocess.Popen([binary],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        except OSError as e:
            if e.errno == 2:
                raise Exception("babel not installed or in system path for webassets")
            raise
        stdout, stderr = proc.communicate(_in.read().encode('utf-8'))
        if proc.returncode != 0:
            raise FilterError('babel error: {}, {}'.format(
                stderr.decode("utf-8"), stdout.decode("utf-8")
            ))
        elif stderr:
            print("babel filter has warnings:", stderr.decode("utf-8"))
        out.write(stdout.decode('utf-8'))

def bundle_stylesheets():
    css = Bundle(
        'stylesheets/app.scss',
        filters='compass',
        output='build/app.css',
        depends='stylesheets/**/*.scss'
    )
    return css

def bundle_es6():
    files = [
        'application.js',
        'fullscreen.js'
    ]
    es6 = [
        Bundle('javascripts/{}'.format(filename), filters='babel',
               output='build/{}'.format(filename))
        for filename in files
    ]
    return es6

def bundle_jsx():
    files = [
        'queue.jsx'
    ]
    jsx = [
        Bundle('javascripts/{}'.format(filename), filters='babel',
               output='build/{}'.format(filename.replace('.jsx', '.js')))
        for filename in files
    ]
    return jsx

def bundle_javascripts():
    vendor = Bundle(
        'javascripts/vendor/modernizr.js',
        'javascripts/vendor/jquery.js',
        'javascripts/vendor/fixedsticky.js',
        'javascripts/vendor/react/react-with-addons.js',
    )
    application = bundle_es6() + bundle_jsx()
    js = Bundle(
        vendor,
        *application,
        filters='rjsmin',
        output='build/app.js'
    )
    return js

assets = Environment(app)
register_filter(BabelFilter)
assets.register('stylesheets', bundle_stylesheets())
assets.register('javascripts', bundle_javascripts())
