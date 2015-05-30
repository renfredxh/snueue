from flask.ext.login import LoginManager, make_secure_token

from snueue import app
from snueue.models import User, RedisAdapter

login_manager = LoginManager()
login_manager.init_app(app)

"""Create and save a new remember token for an authentiated user.

Session tokens are created using the username encrypted with the
app's secret key via HMAC.
"""
def set_remember_token(user):
    token = make_secure_token(user.id)
    user.remember_token = token
    RedisAdapter.set('remember_token', token, user.id)

def clear_remember_token(user):
    print(user.__dict__)
    RedisAdapter.delete('remember_token', user.remember_token)

def get_auth_token(id):
    user = RedisAdapter.get(User, id)
    return user.remember_token

@login_manager.user_loader
def load_user_from_id(id):
    return RedisAdapter.get(User, id)

@login_manager.token_loader
def load_token(token):
    id = RedisAdapter.get('remember_token', token)
    if id is None:
        return None
    return RedisAdapter.get(User, id)

