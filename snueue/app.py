from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, jsonify, flash
from flaskext.compass import Compass
from flask.ext.assets import Environment, Bundle
import reddit
import config

app = Flask(__name__, static_folder='assets')
app.config.from_object('config')
compass = Compass(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submissions', methods=['POST'])
def submissions():
    source, sorting = request.form['source'], request.form['sorting']
    if source == '':
        return jsonify(app.config['MOCK_API'])
    # Searches can be in the form "/r/subreddit_name" or "subreddit_name"
    subreddit = re.search(r'(?:/r/)([^/]*)', source)
    if subreddit:
        source = subreddit.group(1)
    return jsonify({
        'submissions': reddit.get_submissions(source, sorting)
    })

if __name__ == '__main__':
    app.run(debug=True)
