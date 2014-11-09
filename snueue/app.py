import re
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, jsonify, flash
from flaskext.compass import Compass
from flask.ext.assets import Environment, Bundle
import reddit
import config

app = Flask(__name__, static_folder='assets')
app.config.from_object('config.Production')
assets = Environment(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/r/<subreddit>')
def index_with_subreddit(subreddit):
    return render_template('index.html', source='/r/{}'.format(subreddit))

@app.route('/submissions', methods=['POST'])
def submissions():
    source, sorting = request.form['source'], request.form['sorting']
    try:
        excluded = request.form.getlist('excluded[]')
    except KeyError:
        excluded = []
    if source == '':
        return jsonify(app.config['MOCK_API'])
    # Searches can be in the form "/r/subreddit_name" or "subreddit_name"
    subreddit = re.search(r'(?:/r/)([^/]*)', source)
    if subreddit:
        source = subreddit.group(1)
    return jsonify({
        'source': '/r/{}'.format(source),
        'submissions': reddit.get_submissions(source, sorting, excluded)
    })

@app.errorhandler(500)
def internal_error(exception):
    app.logger.exception(exception)
    return render_template('error/500.html'), 500

if __name__ == '__main__':
    app.config.from_object('config.Development')
    app.logger.addHandler(app.config.get('LOGGING_HANDLER'))
    app.run()
