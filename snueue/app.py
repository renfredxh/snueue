import reddit
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, jsonify, flash
from flaskext.compass import Compass

# Configuration
DEBUG = True

app = Flask(__name__, static_folder='assets')
app.config.from_object(__name__)
compass = Compass(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    return jsonify(result=reddit.get_submissions(request.form['source']))

if __name__ == '__main__':
    app.run()
