def get_all_subclasses(python_class):
    """
    Helper function to get all the subclasses of a class.
    :param python_class: Any Python class that implements __subclasses__()
    """
    python_class.__subclasses__()

    subclasses = set()
    check_these = [python_class]

    while check_these:
        parent = check_these.pop()
        for child in parent.__subclasses__():
            if child not in subclasses:
                subclasses.add(child)
                check_these.append(child)

    return sorted(subclasses, key=lambda x: x.__name__)


def get_concrete_models(base_model):
    """
    Helper function to get all concrete models
    that are subclasses of base_model
    in sorted order by name.
    :param base_model: A Django models.Model instance.
    """
    found = get_all_subclasses(base_model)

    def filter_func(model):
        meta = getattr(model, '_meta', '')
        if getattr(meta, 'abstract', True):
            # Skip meta classes
            return False
        if '_Deferred_' in model.__name__:
            # See deferred_class_factory() in django.db.models.query_utils
            # Catches when you do .only('attr') on a queryset
            return False
        return True

    subclasses = list(filter(filter_func, found))
    return sorted(subclasses, key=lambda x: x.__name__)

from django.core import serializers
from django.apps import apps
from collections import OrderedDict
from django.db.models.query import QuerySet

def get_objects():
    app_list = OrderedDict()

    from cms.models import CMSPlugin

    for m in get_concrete_models(CMSPlugin):
        app_config = apps.get_app_config(m._meta.app_label)
        app_list[app_config] = None

    for label in ['cms', 'filer']:
        app_config = apps.get_app_config(label)
        app_list[app_config] = None

    models = serializers.sort_dependencies(app_list.items())

    for model in models:
        model.objects.queryset_class = QuerySet

        for obj in model.objects.iterator():
            yield obj

with open('cms_dump.json', 'w') as fp:
    serializers.serialize('json', get_objects(), use_natural_foreign_keys=True, stream=fp)
