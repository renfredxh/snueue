import reddit
from flask import Flask, request, session, g, redirect, url_for, \
     abort, render_template, jsonify, flash
from flaskext.compass import Compass

# Configuration
DEBUG = True
MOCK = True

app = Flask(__name__, static_folder='assets')
app.config.from_object(__name__)
compass = Compass(app)

mock_data = {
    'submissions': [
        {
              'id': '1',
              'title': 'Rick Astley - Never Gonna Give You Up',
              'type': 'youtube',
              'url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              'mediaId': 'dQw4w9WgXcQ',
              'permalink': 'http://reddit.com'
        },
        {
              'id': '4',
              'title': 'KXVO "Pumpkin Dance',
              'type': 'youtube',
              'url': 'http://youtu.be/v4IC7qaNr7I',
              'mediaId': 'v4IC7qaNr7I',
              'permalink': 'http://reddit.com'
        }
    ]
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    if request.form['source'] == '':
        return jsonify(mock_data)
    return jsonify({
        'submissions': reddit.get_submissions(request.form['source'])
    })

if __name__ == '__main__':
    app.run()
