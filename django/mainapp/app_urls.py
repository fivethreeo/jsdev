# -*- coding: utf-8 -*-
from django.conf.urls import *  # NOQA
from levangersundet.views import TestCreateView

urlpatterns = patterns('',
    url(r'^$', TestCreateView.as_view()),
    url(r'^(?P<testtype>baat|datakort|sol)/$', TestCreateView.as_view())
)
