#!/usr/bin/env bash

# From https://betterstack.com/community/guides/scaling-python/dockerize-django

python manage.py migrate --noinput

python manage.py collectstatic --noinput

python -m gunicorn -c ./mnt/gunicorn.conf.py libriscan.wsgi:application
