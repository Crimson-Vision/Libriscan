#!/usr/bin/env bash

# From https://betterstack.com/community/guides/scaling-python/dockerize-django

python manage.py migrate --noinput

python -m gunicorn --bind 0.0.0.0:8000 --workers 3 libriscan.wsgi:application
