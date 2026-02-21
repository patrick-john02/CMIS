import os
import sys
from waitress import serve
from config.wsgi import application

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    # Run migrations automatically on startup
    from django.core.management import execute_from_command_line
    execute_from_command_line(['manage.py', 'migrate'])

    print("Starting production server on port 8000...")
    serve(application, host='127.0.0.1', port=8000)