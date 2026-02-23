# backend/run_server.py
import os
import sys
import django

# Set the settings module BEFORE any other Django imports
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize Django to prevent 'ImproperlyConfigured' errors during PyInstaller collection
django.setup()

from django.core.management import execute_from_command_line

if __name__ == '__main__':
    # When running as an .exe, start the server on 8000
    execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000', '--noreload'])