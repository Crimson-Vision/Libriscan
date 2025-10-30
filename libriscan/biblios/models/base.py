from rules.contrib.models import RulesModelMixin, RulesModelBase


from django.db import models


# Custom model in case there's a need for anything more than just the rules meta class
class BibliosModel(models.Model, RulesModelMixin, metaclass=RulesModelBase):
    class Meta:
        abstract = True
