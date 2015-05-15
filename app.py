import re
import logging
from snueue import app

if __name__ == '__main__':
    config_object = 'snueue.config.development'
    app.config.from_object(config_object)

    app.logger.addHandler(app.config.get('LOGGING_HANDLER'))
    app.logger.info("App initialized in with config {}".format(config_object))
    app.run(host=app.config.get('HOST'))
else:
    config_object = 'snueue.config.production'
    app.config.from_object(config_object)

    stream_handler = app.config.get('LOGGING_HANDLER')
    app.logger.addHandler(stream_handler)
    app.logger.setLevel(logging.INFO)
    mail_handler = app.config.get('LOGGING_MAIL_HANDLER')
    if mail_handler is not None:
        app.logger.addHandler(mail_handler)
    app.logger.info("App initialized in with config {}".format(config_object))
