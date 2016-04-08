# -*- coding: utf-8 -*-
from cms.app_base import CMSApp
from cms.apphook_pool import apphook_pool
from django.utils.translation import ugettext_lazy as _

class TestApphook(CMSApp):
    name = _("Test Apphook")
    urls = ["testproject.app_urls"]

apphook_pool.register(TestApphook)