import multiprocessing

# Gunicorn Settings
# See https://docs.gunicorn.org/en/stable/settings.html for full details and additional options

# socket address to bind
bind = "0.0.0.0:8000"

# calculate number of workers
workers = multiprocessing.cpu_count() * 2 + 1

# use threaded workers
worker_class = "gthread"

# if this value is not 1, gthread workers will be used regardless of the worker_class
threads = multiprocessing.cpu_count() * 2 if worker_class == "gthread" else 1

# restart a worker after a given number of requests.
# some jitter keeps them all from restarting at the same time
max_requests = 500
max_requests_jitter = 25
