# -*- coding: utf-8 -*-
from django.conf import settings
from django.views.generic import CreateView
from testproject.forms import DeltagerForm

from post_office import mail

class TestCreateView(CreateView):
    form_class = DeltagerForm
    template_name = 'test.html'

    def get_success_url(self):
        return '/nb/%s/' % self.testtype

    def form_valid(self, form):
        response = super(TestCreateView, self).form_valid(form)
        mail.send(
            [self.object.epost],
            settings.SERVER_EMAIL,
            template=self.testtype,
            context={'deltager': self.object},
            priority='now'
        )
        mail.send(
            [settings.TEST_NOTIFY_EMAIL],
            settings.SERVER_EMAIL,
            template='%s_notify' % self.testtype,
            context={'deltager': self.object},
            priority='now'
        )
        return response

    def dispatch(self, *args, **kwargs):
        self.testtype = kwargs.get('testtype', False)
        return super(TestCreateView, self).dispatch(*args, **kwargs)