import re
import reddit
import config
from snueue import app, login_manager
from flask import request, session, g, redirect, url_for, \
     abort, render_template, jsonify, flash
from flask.ext.login import current_user, login_user, \
     logout_user, login_required
from reddit import AuthenticationFailure
from models import User

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/r/<subreddit>')
def index_with_subreddit(subreddit):
    return render_template('index.html', source='/r/{}'.format(subreddit))

@app.route('/submissions')
def submissions():
    source = request.args.get('q') or request.args['source']
    sorting = request.args['sorting']
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
    logout_user()
    return redirect(url_for('index'))

@login_manager.user_loader
def load_user(id):
    return User.get_user(id)

@app.errorhandler(500)
def internal_error(exception):
    app.logger.exception(exception)
    return render_template('error/500.html'), 500
