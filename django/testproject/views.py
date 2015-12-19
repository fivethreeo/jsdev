# -*- coding: utf-8 -*-
from django.conf import settings
from django.views.generic import CreateView
from testproject.forms import DeltagerForm
'''
from django.core.mail import EmailMessage
from django.template.loader import render_to_string

def send_email(instance):
    
    subject  = ''.join(render_to_string('baat/baat_subject.html', {'instance': instance}).splitlines())
    body = render_to_string('baat/baat_body.html', {'instance': instance})
    msg = EmailMessage(subject, body, 'mail@3kanten.it', [instance.epost] )
    #msg.attach_file('/home/trekanten/public_html/media/2014 - Informasjon til deg som skal ta Båtførerprøven.pdf')
    msg.encoding = 'iso-8859-1'
    msg.send()
    
    subject  = ''.join(render_to_string('baat/baat_msubject.html', {'instance': instance}).splitlines())
    body = render_to_string('baat/baat_mbody.html', {'instance': instance})
    mmsg = EmailMessage(subject, body, instance.epost, ['mail@3kanten.it'] )
    mmsg.encoding = 'iso-8859-1'
    mmsg.send()
    
def send_email_confirm(instance):
    
    subject  = ''.join(render_to_string('baat/baat_subject.html', {'instance': instance}).splitlines())
    body = render_to_string('baat/baat_body.html', {'instance': instance})
    msg = EmailMessage(subject, body, 'mail@3kanten.it', [instance.epost] )
    msg.encoding = 'iso-8859-1'
    msg.send()
    
    subject  = ''.join(render_to_string('baat/baat_msubject.html', {'instance': instance}).splitlines())
    body = render_to_string('baat/baat_mbody.html', {'instance': instance})
    mmsg = EmailMessage(subject, body, instance.epost, ['mail@3kanten.it'] )
    mmsg.encoding = 'iso-8859-1'
    mmsg.send()
    
def send_email_reject(instance):
    
    subject  = ''.join(render_to_string('baat/baat_subject.html', {'instance': instance}).splitlines())
    body = render_to_string('baat/baat_body.html', {'instance': instance})
    msg = EmailMessage(subject, body, 'mail@3kanten.it', [instance.epost] )
    msg.encoding = 'iso-8859-1'
    msg.send()
    
    subject  = ''.join(render_to_string('baat/baat_msubject.html', {'instance': instance}).splitlines())
    body = render_to_string('baat/baat_mbody.html', {'instance': instance})
    mmsg = EmailMessage(subject, body, instance.epost, ['mail@3kanten.it'] )
    mmsg.encoding = 'iso-8859-1'
    mmsg.send()
'''
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