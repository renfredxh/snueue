class Config(object):
    DEBUG = False
    MOCK_API = {
        'submissions': [
            {
                  'id': '1',
                  'title': 'Rick Astley - Never Gonna Give You Up',
                  'type': 'youtube',
                  'url': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                  'media_id': 'dQw4w9WgXcQ',
                  'permalink': 'http://reddit.com'
            },
            {
                  'id': '4',
                  'title': 'KXVO "Pumpkin Dance',
                  'type': 'youtube',
                  'url': 'http://youtu.be/v4IC7qaNr7I',
                  'media_id': 'v4IC7qaNr7I',
                  'permalink': 'http://reddit.com'
            }
        ]
    }

class Production(Config):
    DEBUG = False
    PROPOGATE_EXCEPTIONS = True
    # Log exceptions to stderr
    import logging
    from logging import StreamHandler
    stream_handler = StreamHandler()
    stream_handler.setLevel(logging.WARNING)
    formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    stream_handler.setFormatter(formatter)
    LOGGING_HANDLER = stream_handler

class Development(Config):
    DEBUG = True
    ASSETS_DEBUG = True
