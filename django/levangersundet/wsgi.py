"""
WSGI config for levangersundet project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.8/howto/deployment/wsgi/
"""

import sys, os, subprocess
command = ['bash', '-c', 'source '+ os.path.join(os.path.dirname(sys.executable), 'postactivate')]
proc = subprocess.Popen(command, stdout = subprocess.PIPE)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "levangersundet.settings")

application = get_wsgi_application()
