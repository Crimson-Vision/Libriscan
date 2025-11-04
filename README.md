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

## CSS Changes (Tailwind / DaisyUI)

Follow the below instructions to have your local environment ready for changes in CSS, if you are changing CSS classes on the teamplates.

Reference site used:
https://daisyui.com/docs/install/django/?lang=en

In case the above site is down or changed, you can follow the manual installation steps on your computer:

Terminal
## Run the corresponding command for your OS

### Linux
curl -sLo myapp/static/css/tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-arm64
curl -sLo myapp/static/css/tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-arm64-musl
curl -sLo myapp/static/css/tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
curl -sLo myapp/static/css/tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64-musl

### MacOS
curl -sLo myapp/static/css/tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64
curl -sLo myapp/static/css/tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-x64

### Windows
curl -sLo myapp/static/css/tailwindcss.exe https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe
Make the file executable (For Linux and MacOS):

Terminal
```
chmod +x myapp/static/css/tailwindcss
```

Get daisyUI bundle JS file
Run this code to download latest version of daisyUI as a single js file and put it next to Tailwind's executable file.

Terminal
```
curl -sLO myapp/static/css/daisyui.mjs https://github.com/saadeghi/daisyui/releases/latest/download/daisyui.mjs
curl -sLO myapp/static/css/daisyui-theme.mjs https://github.com/saadeghi/daisyui/releases/latest/download/daisyui-theme.mjs
```

Add Tailwind CSS and daisyUI to your CSS file.
Address your HTML and other markup files in the source function.

***biblios/static/css/input.css***
```
@import "tailwindcss";

@source not "./tailwindcss";
@source not "./daisyui{,*}.mjs";

@plugin "./daisyui.mjs";

/* Optional for custom themes – Docs: https://daisyui.com/docs/themes/#how-to-add-a-new-custom-theme */
@plugin "./daisyui-theme.mjs"{
  /* custom theme here */
}
```


### Admin Portal

The admin portal can be accessed at `/admin` in the URL (e.g., `http://127.0.0.1:8000/admin`).

### User Roles

To see data as an end-user, you will need to assign a user role to yourself in the `/admin > User Roles` area of the admin portal.
