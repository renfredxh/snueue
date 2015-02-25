import re
from snueue import app

if __name__ == '__main__':
    app.config.from_object('snueue.config.Development')
    app.logger.addHandler(app.config.get('LOGGING_HANDLER'))
    app.run()
