import re
import logging
from snueue import app

if __name__ == '__main__':
    config_object = 'snueue.config.development'
    app.config.from_object(config_object)
    app.logger.addHandler(app.config.get('LOGGING_HANDLER'))
    app.logger.info("App initialized in with config {}".format(config_object))
    app.run()
else:
    config_object = 'snueue.config.production'
    app.config.from_object(config_object)
    app.logger.addHandler(app.config.get('LOGGING_HANDLER'))
    app.logger.setLevel(logging.INFO)
    app.logger.info("App initialized in with config {}".format(config_object))
