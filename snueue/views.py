import re

from flask import request, session, g, redirect, url_for, \
     abort, render_template, jsonify, flash
from flask.ext.login import current_user, login_user, \
     logout_user, login_required

from snueue import app, config
from snueue.services import reddit, login
from snueue.models import User
from snueue.services.reddit import AuthenticationFailure

@app.after_request
def add_hostname(response):
    response.headers['X-Hostname'] = app.config['HOSTNAME']
    return response

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<type>/<subreddit>')
def index_with_subreddit(type, subreddit):
    return render_template('index.html', source='/{}/{}'.format(type, subreddit))

@app.route('/submissions', methods=['GET'])
def submissions():
    try:
        source = request.args.get('q') or request.args['source']
        sorting = request.args['sorting']
    except KeyError:
        abort(422)
    try:
        excluded = request.args.getlist('excluded[]')
    except KeyError:
        excluded = []
    if source == '/s/test':
        return jsonify(app.config['MOCK_API'])
    # Searches can be in the form "/r/subreddit_name" or "subreddit_name"
    subreddit = re.search(r'(?:/r/)([^/]*)', source)
    if subreddit:
        source = subreddit.group(1)
        submissions = reddit.get_submissions(source, sorting, excluded)
    else:
        abort(422)
    return jsonify({
        'source': '/r/{}'.format(source),
        'submissions': submissions
    })

@app.route('/authorize/reddit')
def oauth_authorize():
    if not current_user.is_anonymous():
        return redirect(url_for('index'))
    redirect_url = reddit.authorize()
    return redirect(redirect_url)

@app.route('/callback/reddit')
def oauth_callback():
    if not current_user.is_anonymous():
        return redirect(url_for('index'))
    code = request.args.get('code', '')
    state = request.args.get('state', '')
    try:
        user = reddit.authenticate(state, code)
    except AuthenticationFailure:
        abort(403)
    login_user(user, True)
    return redirect(url_for('index'))

@app.route('/user/vote', methods=['PUT'])
@login_required
def vote():
    direction = request.form.get('direction', None)
    submission = request.form.get('submission', None)
    response = reddit.vote(current_user.username, submission, direction)
    return str(response), 200

@app.route('/logout')
@login_required
def logout():
    login.clear_remember_token(current_user)
    logout_user()
    return redirect(url_for('index'))

@app.errorhandler(500)
def internal_error(exception):
    return render_template('error/500.html'), 500
