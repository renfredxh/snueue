from snueue import app

def console(tag, message, color='blue'):
    COLORS = {
        'red': '0;31', 'green': '0;32',
        'green': '0;33', 'blue': '0;34',
    }
    NORMAL = '\033[0m'
    tag_color = '\033[{}m'.format(COLORS[color])
    app.logger.debug(
        "{}[{}]{} {}".format(tag_color, tag.upper(), NORMAL, message)
    )
