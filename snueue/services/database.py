import redis

from snueue import app
from snueue.utils import console
from snueue.models import RedisModel

REDIS = None

def get_db():
    global REDIS
    if REDIS is None:
        REDIS = redis.StrictRedis(host=app.config['REDIS_HOST'],
                             port=app.config['REDIS_PORT'],
                             db=app.config['REDIS_DB'],
                             decode_responses=True)
    return REDIS

def format_key(type, id):
    return '{}:{}'.format(type, id)

def get(key_type, id):
    db = get_db()
    if isinstance(key_type, str):
        key = format_key(key_type, id)
        return db.get(key)
    elif issubclass(key_type, RedisModel):
        key = format_key(key_type.model_name, id)
        if db.hlen(key) == 0:
            return None
        data = db.hgetall(key)
        for set_name in key_type.model_sets:
            data[set_name] = db.smembers(format_key(key, set_name))
        return key_type(id, data)
    else:
        raise TypeError("Key type must be a string or RedisModel")

def set(key_type, id, value, expiration=None):
    db = get_db()
    key = format_key(key_type, id)
    if expiration is not None:
        db.setex(key, expiration, value)
    db.set(key, value)
    console("set", "{} {}".format(key, value))

def save(model):
    db = get_db()
    key = format_key(model.model_name, model.id)
    pipe = db.pipeline()
    pipe.hmset(key, model._modified)
    log = "{} {}".format(key, model._modified)
    for set_field in model.model_sets:
        set_key = format_key(key, set_field)
        old_set = db.smembers(set_key)
        new_set = model.__dict__[set_field]
        add = new_set.difference(old_set)
        remove = old_set.difference(new_set)
        for item in add:
            pipe.sadd(set_key, item)
        for item in remove:
            pipe.srem(set_key, item)
        if add: log += "\n  {} += {}".format(set_key, add)
        if remove: log += "\n  {} -= {}".format(set_key, remove)
    pipe.execute()
    console("save", log)

def delete(model, id):
    db = get_db()
    key = format_key(model, id)
    db.delete(key)
    console("delete", "{}".format(key))
