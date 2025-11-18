# Libriscan

**This solution is ideal for any organization in need of extracting text and handwriting recognition on documents of various kinds.**

***Note:*** *There is no need to modify the Docker container files.*

---

## Documentation

📖 **[Page Text Management User Guide](docs/PAGE_TEXT_MANAGEMENT_USER_GUIDE.md)** - Comprehensive guide to editing and managing extracted text, including image viewer controls, word editing, keyboard shortcuts, suggestions, audit history, and more.

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

## CSS Setup (Tailwind / DaisyUI)

**Reference:** [daisyUI Django Installation Guide](https://daisyui.com/docs/install/django/?lang=en)

### One-Time Initial Setup

**1. Navigate to CSS directory:**

```bash
cd libriscan/biblios/static/css
```

**2. Download Tailwind CSS executable (choose your platform - run ONLY ONE):**

```bash
# macOS Apple Silicon (M1/M2/M3)
curl -sLo tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64

# macOS Intel
# curl -sLo tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-x64

# Linux ARM64
# curl -sLo tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-arm64

# Linux x64
# curl -sLo tailwindcss https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64

# Windows x64
# curl -sLo tailwindcss.exe https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe
```

**3. Make executable (macOS/Linux only):**

```bash
chmod +x tailwindcss
```

**4. Download daisyUI plugins:**

```bash
curl -sLO https://github.com/saadeghi/daisyui/releases/latest/download/daisyui.mjs
curl -sLO https://github.com/saadeghi/daisyui/releases/latest/download/daisyui-theme.mjs
```

**5. Verify `input.css` configuration:**

The `input.css` file should be configured to scan your templates and JavaScript files:

```css
@import "tailwindcss";

@source "../../templates/**/*.html";
@source "../../static/js/**/*.js";
@source not "./tailwindcss.exe";
@source not "./daisyui{,*}.mjs";

@plugin "./daisyui.mjs";

@plugin "./daisyui-theme.mjs" {
  /* custom themes */
}
```

**6. Generate `output.css` (first time):**

```bash
./tailwindcss -i input.css -o output.css
```

**Windows users:**

```bash
tailwindcss.exe -i input.css -o output.css
```

### Development Workflow

When making CSS/template changes, run in two terminals:

**Terminal 1 - Tailwind (watch mode):**

```bash
cd libriscan/biblios/static/css
./tailwindcss -i input.css -o output.css --watch
```

**Windows users:**

```bash
cd libriscan/biblios/static/css
tailwindcss.exe -i input.css -o output.css --watch
```

**Terminal 2 - Django:**

```bash
cd libriscan
python manage.py runserver
```

**Notes:**
- Only run Tailwind when changing CSS/templates. `output.css` is auto-generated - don't edit manually.
- The `input.css` file scans:
  - `biblios/templates/**/*.html` - All HTML template files
  - `biblios/static/js/**/*.js` - JavaScript files (for dynamically generated classes)
- If you add templates or JS files in other locations, update the `@source` directives in `input.css`.


### Admin Portal

The admin portal can be accessed at `/admin` in the URL (e.g., `http://127.0.0.1:8000/admin`).

### User Roles

To see data as an end-user, you will need to assign a user role to yourself in the `/admin > User Roles` area of the admin portal.
