from django.forms import Widget


class SecretKeyWidget(Widget):
    template_name = "biblios/widgets/read_only_secret_key.html"
