
To deploy existing app in django/
=================================

Install `nodejs`_ or `io.js`_ and `Python`_.

::

  pip install awscli
  npm install
  aws configure
  gulp configure
  gulp deploy_lambda_resource
  gulp deploy_full_stack

To build css/javascript
=======================

Install `nodejs`_ or `io.js`_.

Install node modules: ::

  npm install
  npm install -g bower

Install bower assets: ::

  bower install

Pasteable commands: ::

  npm install
  npm install -g bower
  bower install
  gulp build 
  
To run project locally
======================

Install `nodejs`_ or `io.js`_ and `Python`_.

Install node modules needed: ::

  npm install

Install virtualenv: ::
  
  pip install virtualenv

Create virtualenv: ::

  virtualenv env

Install python modules: ::

  env/bin/pip install -r requirements-dev.txt

Sync django database: ::

  env/bin/python django/manage.py syncdb

Pasteable commands (linux): ::

  pip install virtualenv

  virtualenv env
  env/bin/pip install -r requirements-dev.txt
  env/bin/python django/manage.py syncdb
  gulp serve

Pasteable commands (win): ::
  
  pip install virtualenv

  virtualenv env
  env\Scripts\pip.exe install -r requirements-dev.txt
  env\Scripts\python.exe django\manage.py syncdb
  gulp serve
  
  
To run project on pythonanywhere
================================

Create virtualenv: ::

  project=levangersundet
  mkvirtualenv ${project}env  --python=/usr/bin/python3.5


Install python modules: ::

  ${project}env/bin/pip install -r requirements.txt

Sync django database: ::

  env/bin/python django/manage.py syncdb

Pasteable commands: ::

  project=levangersundet
  mkvirtualenv ${project}  --python=/usr/bin/python3.5
  ${project}/bin/pip install -r requirements.txt
  ${project}/bin/python django/manage.py migrate

  mkdir -p /var/www/${project}/media                                                                                            
  mkdir -p /var/www/${project}/static
  
  ${project}/bin/python django/manage.py collectstatic

postinitialize: ::

  #!/bin/sh
  # This hook is run before this virtualenv is activated.

  PAW_DB_ENGINE=django.db.backends.postgresql_psycopg2
  PAW_DB_NAME=levangersundet
  PAW_DB_USERNAME=levangersundet
  PAW_DB_PASSWORD=
  PAW_DB_HOST=fivethreeo-190.postgres.pythonanywhere-services.com
  PAW_DB_PORT=10190
  PAW_STATIC=/var/www/levangersundet/static
  PAW_MEDIA=/var/www/levangersundet/media



  export PAW_DB_ENGINE
  export PAW_DB_NAME
  export PAW_DB_USERNAME
  export PAW_DB_PASSWORD
  export PAW_DB_HOST
  export PAW_DB_PORT

postinitialize source: ::

  # +++++++++++ CUSTOM WSGI +++++++++++
  # If you have a WSGI file that you want to serve using PythonAnywhere, perhaps
  # in your home directory under version control, then use something like this:


  import sys, os, subprocess

  venv = '/home/fivethreeo/.virtualenvs/levangersundetenv'
  postactivate = os.path.join(venv, 'bin', 'postactivate')
  command = ['bash', '-c', 'source '+ postactivate + ' && env']
  proc = subprocess.Popen(command, stdout = subprocess.PIPE)

  for line in proc.stdout:
    (key, _, value) = line.decode().strip().partition("=")
    os.environ[key] = value

  path = '/home/fivethreeo/levangersundet/django/'
  if path not in sys.path:
      sys.path.append(path)

  from levangersundet.wsgi import application

Install ansible on cygwin with lynx: ::

  lynx -source rawgit.com/transcode-open/apt-cyg/master/apt-cyg > apt-cyg
  install apt-cyg /bin
  apt-cyg install wget binutils curl gmp libgmp-devel make python python-devel \
  python-crypto python-openssl python-setuptools \
  git nano openssh openssl openssl-devel libffi-devel gcc-core gcc-g++
  wget http://peak.telecommunity.com/dist/ez_setup.py
  python ez_setup.py -U setuptools
  # restart terminal
  easy_install pip
  pip install ansible
  ssh-keygen -t rsa -b 4096 ~/.ssh/id_rsa
  scp  ~/.ssh/id_rsa.pub fivethreeo@ssh.pythonanywhere.com:~/
  ssh fivethreeo@ssh.pythonanywhere.com 'cat ~/id_rsa.pub >> ~/.ssh/authorized_keys'
  eval `ssh-agent`
  ssh-add ~/.ssh/id_rsa


.. _nodejs: https://nodejs.org/
.. _io.js: https://iojs.org/
.. _Python: https://www.python.org/downloads/release/python-2710/
