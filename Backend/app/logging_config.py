import logging
import os
from logging.handlers import RotatingFileHandler


def setup_logging(app):
    log_level = os.environ.get('LOG_LEVEL', 'INFO').upper()
    log_format = '%(asctime)s [%(levelname)s] %(name)s: %(message)s'

    app.logger.setLevel(getattr(logging, log_level))

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter(log_format))
    app.logger.addHandler(console_handler)

    if os.environ.get('FLASK_DEBUG', 'false').lower() != 'true':
        file_handler = RotatingFileHandler(
            'bytemend.log', maxBytes=5_000_000, backupCount=3
        )
        file_handler.setFormatter(logging.Formatter(log_format))
        app.logger.addHandler(file_handler)
