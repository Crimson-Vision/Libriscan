from django.template import Library
from django.utils.html import format_html
from django.utils.translation import gettext

register = Library()


@register.simple_tag
def render_secret_key_as_masked(value):
    if not value:
        return format_html("<p><strong>{}</strong></p>", gettext("No secret key set."))
    return format_html("<p>{}</p>", f"{value[:4]}··················")
