The recommended way for most individuals or small organizations to run Libriscan is on a Linux server with [Docker Compose](https://docs.docker.com/compose/). The server will need to have Python installed, and you'll also need to know the domain (or a subdomain) where you plan to access Libriscan.

In a Docker Compose setup, Libriscan will require three services: the Libriscan application itself, Libriscan's task queue Huey, and a reverse proxy to manage traffic. There are many options for the reverse proxy; if you don't have a preference we recommend [Caddy](https://caddyserver.com/). 

### Configuration

We provide a [sample Compose file](https://github.com/Crimson-Vision/Libriscan/blob/main/sample-config/compose.yaml) to use a starting point. Following these steps in a terminal or SSH client should get a working Libriscan system up and running.

1. SSH into your server as the user you will run Libriscan under, and navigate to your home directory with `cd ~`. (You will probably already be in that directory, but make sure.)
1. Copy the contents of the sample Compose file above to this location, as `compose.yml`. If necessary, edit the file and change the line `TZ=America/New_York` to use your local [time zone definition](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) instead. If you following our reference implementation, you do not need to make any other changes to this file.
1. Create a new directory to use for your system's persistant storage with `mkdir ~/appdata`. You can call the directory something other than `appdata`, just be sure to update the path as necessary in any of the provided config files. Note that it's also possible to use other directories outside your user's home folder, like something mounted in `/mnt` or `/opt` but Docker permissions may be difficult to manage in those cases.
1. Create a directory for Libriscan with: `mkdir ~/appdata/libriscan`.
1. In a Python interpreter (`python3` etc), generate a secure secret key and note the value:
  ```python
  import secrets
  print(secrets.token_urlsafe(64))
  ```
6. Create a .env file with `nano ~/appdata/libriscan/.env`. Add the following lines with the appropriate values:
  ```
  LB_ALLOWED_HOSTS = <your_host_domain>
  LB_TRUSTED_ORIGINS = <https://your_host_domain>
  LB_DEBUG = False
  LB_SECRET_KEY = <the key you generated in the last step>
  ```
  Note that LB_ALLOWED_HOSTS should have a value like "www.crimson-vision.tech", with no https:// prefix, but LB_TRUSTED_ORIGINS should include it like "https://www.crimson-vision.tech".

7. Copy the [sample Gunicorn config](https://github.com/Crimson-Vision/Libriscan/blob/stage/sample-config/gunicorn.conf.py) to `~/appdata/libriscan/gunicorn.conf.py`. You do not need to edit this file.
8. Create a directory for the Caddy config: `mkdir -p ~/appdata/caddy/caddy` (not a typo).
9. Copy the [sample Caddy config](https://github.com/Crimson-Vision/Libriscan/blob/stage/sample-config/Caddyfile) to `~/appdata/caddy/caddy/Caddyfile`. Edit the file to add a valid email address; Caddy will use it to register the system's SSL certificates for HTTPS.

### Post-Install Steps 
1. Run `docker compose up -d` to download the current versions of Caddy and Libriscan and run them as configured.
2. Once the containers are running, type `docker compose exec -ti libriscan bash`. This will connect you to a shell inside that container.
3. Run `./manage.py createsuperuser` and follow the steps to create your superuser account.
4. Run `./manage.py shell < setup_staff_group.py` to set up access for staff users within the admin page.