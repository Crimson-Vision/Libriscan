#!/usr/bin/env bash

# From https://betterstack.com/community/guides/scaling-python/dockerize-django

python manage.py migrate --noinput

python manage.py collectstatic --noinput

python -m gunicorn --bind 0.0.0.0:8000 --workers 5 --timeout 120 libriscan.wsgi:application
