# Libriscan UI Architecture & Style Guide

Quick reference for the Django + HTMX + Tailwind CSS + daisyUI stack.

---

## Architecture

**Stack:** Django (server-rendered) + HTMX (dynamic updates) + Tailwind CSS v4 + daisyUI + Heroicons + OpenSeadragon

**Key Principle:** Server-rendered HTML with progressive enhancement via HTMX. Minimal JavaScript for complex interactions only.

---

## Directory Structure

```
libriscan/biblios/
├── static/
│   ├── css/
│   │   ├── input.css          # Tailwind source (@import "tailwindcss")
│   │   ├── output.css         # Compiled CSS
│   │   └── daisyui.mjs        # daisyUI plugin
│   ├── js/
│   │   ├── utils.js           # Core utilities
│   │   ├── openseadragon-viewer.js
│   │   └── word_details/      # Modular word editing
│   └── svg/                   # Heroicons SVG files
├── templates/biblios/
│   ├── base.html              # Base template
│   └── components/            # Reusable fragments
└── templatetags/
    └── icon_tags.py           # {% icon %} template tag
```

---

## Styling

### Tailwind CSS + daisyUI

**Config:** `static/css/input.css` uses `@import "tailwindcss"` with daisyUI plugin.

**Usage:**
```django
<div class="card bg-base-100 shadow-lg">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <button class="btn btn-primary">Action</button>
  </div>
</div>
```

**daisyUI Components:** `card`, `btn`, `alert`, `modal`, `navbar`, `menu`, `dropdown`

**Theme:** Light/dark via `data-theme` on `<html>`, uses semantic colors (`base-100`, `base-content`, `primary`)

**Best Practice:** Use Tailwind utilities first, custom CSS only for complex interactions.

---

## HTMX

### Setup
```django
{% load django_htmx %}
{% htmx_script %}
<body hx-headers='{"x-csrftoken": "{{ csrf_token }}"}' ...>
```

### Common Patterns

**Content Swap:**
```django
<div hx-get="{% url 'page_words' ... %}" 
     hx-trigger="load, every 2s" 
     hx-swap="outerHTML">
```

**Form Submit:**
```django
<form hx-post="{% url 'update_word' ... %}" 
      hx-target="#word-details" 
      hx-swap="innerHTML">
```

**Button Action:**
```django
<button hx-post="{% url 'toggle_review_flag' ... %}" 
        hx-target="#reviewFlagBtn" 
        hx-swap="outerHTML">
```

### Events
```javascript
document.addEventListener('htmx:afterSwap', (event) => {
  // Reinitialize components after swap
  if (event.target.id === 'openseadragon-viewer') {
    reinitializeViewer(imageUrl);
  }
});
```

---

## Icons (Heroicons)

**Usage:**
```django
{% load icon_tags %}
{% icon 'book' css_class='w-5 h-5' %}
{% icon 'flag-filled' css_class='size-6' fill='rgb(249, 115, 22)' %}
```

**Location:** `static/svg/` - Add new icons here, use `{% icon 'name' %}`

**Benefits:** Browser caching, reduced HTML size, better compression

---

## Image Viewer (OpenSeadragon)

**Setup:**
```django
<script src="{% static 'js/openseadragon/openseadragon.min.js' %}"></script>
<div id="openseadragon-viewer" data-image-url="{{ page.image.url }}"></div>
```

**Reinitialize after HTMX swap:**
```javascript
document.addEventListener('htmx:afterSwap', (event) => {
  const viewer = document.getElementById('openseadragon-viewer');
  if (viewer?.dataset.imageUrl) {
    reinitializeViewer(viewer.dataset.imageUrl);
  }
});
```

---

## JavaScript Utilities

**File:** `static/js/utils.js` → `window.LibriscanUtils`

**Key Functions:**
```javascript
// CSRF & Requests
LibriscanUtils.getCSRFToken()
LibriscanUtils.makeAuthenticatedRequest(url, options)
LibriscanUtils.fetchJSON(url, options)
LibriscanUtils.postFormData(url, data)

// URL Parsing
LibriscanUtils.parseLibriscanURL()
LibriscanUtils.buildWordUpdateURL(wordId)

// UI Helpers
LibriscanUtils.showToast(message, type, duration)
LibriscanUtils.copyElementText(element)
LibriscanUtils.setButtonLoading(button, isLoading, text)
LibriscanUtils.scrollIntoViewSafe(element)

// File Validation
LibriscanUtils.validateFile(file, options)
LibriscanUtils.setupFileValidation(input, button, errorDiv, options)

// Date Formatting
LibriscanUtils.formatDateTime(dateString) // Returns {relative, exact, time}
```

**Best Practice:** Always use `LibriscanUtils` instead of custom utilities.

---

## API Endpoints

**URL Pattern:** `/<short_name>/<collection_slug>/<identifier>/[action]`

**Example:** `/harvard/library/doc123/page4/word/56/update/`

### Common Patterns

**Word Update (HTMX POST):**
```django
<button hx-post="{% url 'update_word' ... %}" 
        hx-target="#word-details" 
        hx-swap="innerHTML">
```

**Polling (HTMX GET):**
```django
<div hx-get="{% url 'page_words' ... %}" 
     hx-trigger="every 2s" 
     hx-swap="outerHTML">
```

**Response Codes:**
- `200` - Normal response
- `204` - Continue polling
- `286` - Stop polling (HTMX-specific)
- `400/500` - Error (show toast)

**Error Handling:**
```javascript
document.addEventListener('htmx:responseError', (event) => {
  const data = JSON.parse(event.detail.xhr.responseText);
  LibriscanUtils.showToast(data.error || 'Error', 'error');
});
```

---

## Best Practices

### Templates
- Extend `base.html`, use `{% block content %}`
- Components in `components/` directory
- Always use `{% icon %}` tag, never inline SVG

### Styling
- Tailwind utilities first: `flex items-center gap-2`
- daisyUI for UI components: `btn btn-primary`
- Custom CSS only for complex interactions
- Use semantic colors: `base-100`, `base-content`

### HTMX
- Target specific elements with `hx-target`
- `outerHTML` for components, `innerHTML` for content
- Reinitialize complex components in `htmx:afterSwap`
- Disable buttons in `htmx:beforeRequest`

### JavaScript
- Use `LibriscanUtils` for common operations
- Listen on `document.body` for HTMX events
- Destroy instances in `htmx:beforeSwap` to prevent leaks

### Endpoints
- Return HTML fragments or JSON for HTMX swaps
- Always return JSON errors: `{"error": "message"}`
- Use `@permission_required` or `OrgPermissionRequiredMixin`

---

## Quick Reference

**Tailwind:** `flex`, `grid`, `p-4`, `gap-2`, `text-2xl`, `bg-base-100`, `md:flex`

**HTMX:** `hx-get`, `hx-post`, `hx-target`, `hx-swap`, `hx-trigger`, `hx-headers`

**Icons:** `{% icon 'name' css_class='w-5 h-5' %}`

**Utils:** `LibriscanUtils.showToast()`, `LibriscanUtils.fetchJSON()`, etc.

---

## Resources

- **SVG Icons:** `biblios/static/svg` https://heroicons.com/
- **Templates:** `biblios/templates`
- **Tailwind:** https://tailwindcss.com/docs
- **daisyUI:** https://daisyui.com/components/
- **HTMX:** https://htmx.org/docs/

---