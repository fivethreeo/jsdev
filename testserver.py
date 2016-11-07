#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals
import os
import sys

def noop_gettext(s):
    return s

port = 8000

for arg in sys.argv:

    if arg.startswith('--port='):
        port = arg.split('=')[1]

gettext = noop_gettext

from mainapp import settings 
HELPER_SETTINGS = {k: v for k, v in settings.__dict__.items() if k.upper() == k}

HELPER_SETTINGS['MIDDLEWARE_CLASSES']=HELPER_SETTINGS['MIDDLEWARE_CLASSES'] + \
   ['cms.middleware.utils.ApphookReloadMiddleware']

del HELPER_SETTINGS['DATABASES']
del HELPER_SETTINGS['MEDIA_ROOT']
del HELPER_SETTINGS['STATIC_ROOT']

def run():
    from djangocms_helper import runner

    os.environ.setdefault('DATABASE_URL', 'sqlite://localhost/testdb.sqlite')

    # we use '.runner()', not '.cms()' nor '.run()' because it does not
    # add 'test' argument implicitly
    runner.runner([sys.argv[0], 'mainapp', 'server', '--bind', '0.0.0.0', '--port', str(port)])

if __name__ == "__main__":
    run()
