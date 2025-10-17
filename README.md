# Libriscan

**This solution is ideal for any organization in need of extracting text and handwriting recognition on documents of various kinds.**

***Note:*** *There is no need to modify the Docker container files.*

---

## Getting Started

Perform the following steps to get this repo up and running on your computer:

1.  **Checkout the `stage` branch:**
    ```bash
    git checkout stage
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd libriscan
    ```

3.  **Create a new Python environment:**
    *Using `venv` (recommended):*
    ```bash
    python -m venv venv
    ```
    *Or using `conda`*:
    ```bash
    conda create -n libriscan python=3.8
    ```

4.  **Activate your newly-created environment:**
    *On macOS and Linux:*
    ```bash
    source venv/bin/activate
    ```
    *On Windows:*
    ```bash
    .\venv\Scripts\activate
    ```
    *If you used conda:*
    ```bash
    conda activate libriscan
    ```

5.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

6.  **Run database migrations:**
    ```bash
    python manage.py migrate
    ```

7.  **Create a superuser to access the admin portal:**
    ```bash
    python manage.py createsuperuser
    ```

8.  **Load initial data:**
    ```bash
    python manage.py loaddata orgs collections series docs
    # ...
    # python manage.py loaddata (with every biblios\fixtures entity/file)
    ```

9.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```

---

## Special Notes

### Admin Portal

The admin portal can be accessed at `/admin` in the URL (e.g., `http://127.0.0.1:8000/admin`).

### User Roles

To see data as an end-user, you will need to assign a user role to yourself in the `/admin > User Roles` area of the admin portal.
