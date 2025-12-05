"""
Template tags for loading SVG icons from static files.

Usage: {% icon 'book' css_class='w-5 h-5' %}
Performance: Browser caching, reduced HTML size, better compression, CDN-friendly
"""
from django import template
from django.contrib.staticfiles.finders import find
from django.utils.safestring import mark_safe
import re
from functools import lru_cache

register = template.Library()


@lru_cache(maxsize=128)
def _load_svg(icon_name):
    """Load and cache SVG file content."""
    svg_file = find(f'svg/{icon_name}.svg')
    if not svg_file:
        return None
    try:
        with open(svg_file, 'r', encoding='utf-8') as f:
            return f.read().strip()
    except (IOError, OSError):
        return None


def _update_attr(svg, attr, value):
    """Update or add an attribute to the SVG opening tag."""
    match = re.search(r'<svg([^>]*)>', svg)
    if not match:
        return svg
    attrs = re.sub(rf'\s+{re.escape(attr)}=["\'][^"\']*["\']', '', match.group(1))
    attrs = f'{attrs} ' if attrs and not attrs.endswith(' ') else attrs
    return re.sub(r'<svg([^>]*)>', f'<svg{attrs}{attr}="{value}">', svg, count=1)


@register.simple_tag
def icon(icon_name, css_class='', fill=None, stroke=None, stroke_width=None, id=None):
    """Load SVG icon with customizable attributes. Usage: {% icon 'book' css_class='w-5 h-5' id='my-icon' %}"""
    svg = _load_svg(icon_name)
    if not svg:
        return mark_safe(f'<!-- Icon "{icon_name}" not found -->')
    
    for attr, value in [('class', css_class), ('fill', fill), ('stroke', stroke), ('stroke-width', stroke_width), ('id', id)]:
        if value is not None and value != '':
            svg = _update_attr(svg, attr, value)
    
    return mark_safe(svg)

