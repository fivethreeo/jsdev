
To build css/javascript
=======================

Install `nodejs`_ or `io.js`_.

Install node modules: ::

  npm install
  npm install -g gulp
  npm install -g bower

Install bower assets: ::

  bower install

Pasteable commands: ::

  npm install
  npm install -g gulp
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

  env/bin/python django/manage.py migrate

Pasteable commands (linux): ::

  pip install virtualenv

  virtualenv env
  env/bin/pip install -r requirements-dev.txt
  env/bin/python django/manage.py migrate
  gulp serve

Pasteable commands (win): ::

  npm install
  npm install -g bower
  npm install -g gulp
  pip install virtualenv

  virtualenv env --system-site-packages
  env\Scripts\pip.exe install -r django\requirements.txt
  env\Scripts\python.exe django\manage.py migrate
  gulp serve
  
  
To run project on pythonanywhere
================================

Use ansible: ::

  eval `ssh-agent`
  homedir=`cygpath -H`/$USER  
  ssh-add $homedir/.ssh/id_rsa
  cd ansible
  ansible-playbook -i hosts --ask-vault-pass site.yml

or 

Clone repo: ::
  
  project=myproject
  git clone this_repo $project
  cd $project

Create virtualenv: ::

  mkvirtualenv ${project} --python=python3.5
  workon ${project}

Install python modules: ::

  pip install -r django/requirements.txt

Sync django database: ::

  python django/manage.py migrate

Pasteable commands: ::

  project=myproject
  git clone this_repo $project
  cd $project
  mkvirtualenv ${project} --python=python3.5
  workon ${project}
  pip install -r requirements.txt
  python django/manage.py migrate

  mkdir -p /var/www/${project}/media                                                                                            
  mkdir -p /var/www/${project}/static
  
  python django/manage.py collectstatic

Custom wsgi: ::

  import sys

  path = '/home/fivethreeo/mainapp/django/'
  if path not in sys.path:
      sys.path.append(path)

  from mainapp.wsgi import application

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

  homedir=`cygpath -H`/$USER
  
  ssh-keygen -t rsa -b 4096 -f $homedir/.ssh/id_rsa
  scp  $homedir/.ssh/id_rsa.pub fivethreeo@ssh.pythonanywhere.com:~/
  ssh fivethreeo@ssh.pythonanywhere.com 'cat ~/id_rsa.pub >> ~/.ssh/authorized_keys'
  eval `ssh-agent`
  ssh-add $homedir/.ssh/id_rsa

pxe booting with virtualbox (does not work): ::

  cd ~/.VirtualBox/
  mkdir TFTP
  cd TFTP
  
  curl http://ftp.no.debian.org/debian/dists/Debian8.6/main/installer-amd64/current/images/netboot/netboot.tar.gz| tar zx --strip-components 1

  rm pxelinux.0
  cp debian-installer/amd64/pxelinux.0 .
  rm pxelinux.cfg
  cp -R debian-installer/amd64/pxelinux.cfg .

iPXE booting with VirtualBox:

Create pxe image (if wget fails below) at https://rom-o-matic.eu/ using: ::

  #!ipxe
  dhcp
  chain tftp://10.0.2.4/ipxe
  
Set up vms for PXE booting: ::

  vb="vboxmanage"
  cygpath="echo"
  homedir="~"
  if [[ $(uname) == CYGWIN* ]]
  then
    vb="`find /cygdrive/c/Program\ Files | grep -i vboxmanage.exe`"
    cygpath="cygpath -w"
    homedir=`cygpath -H`/$USER
  fi

  preseed="`pwd`/ansible/preseed.cfg"

  mkdir -p "$homedir/.VirtualBox"
  pushd "$homedir/.VirtualBox"
  mkdir TFTP
  cd TFTP
  # Can be slow, be patient
  wget --no-check-certificate -O undionly.kpxe 'https://rom-o-matic.eu/build.fcgi?BINARY=undionly.kpxe&BINDIR=bin&REVISION=master&DEBUG=&EMBED.00script.ipxe=%23%21ipxe%0Adhcp%0Achain%20tftp%3A//10.0.2.4/ipxe%0A&'

  mkdir installer
  cd installer
  curl http://archive.ubuntu.com/ubuntu/dists/yakkety/main/installer-amd64/current/images/netboot/netboot.tar.gz | tar zx --strip-components 1
  cd ..
  cp installer/ubuntu-installer/amd64/linux .
  cp installer/ubuntu-installer/amd64/initrd.gz .

  (cat <<EOF
  #!ipxe

  kernel tftp://10.0.2.4/linux
  initrd tftp://10.0.2.4/initrd.gz
  initrd tftp://10.0.2.4/preseed.cfg preseed.cfg
  imgargs linux auto=true preseed=file:///preseed.cfg hostname=unassigned-hostname domain=unassigned-domain priority=critical
  boot
  EOF
  ) > ipxe
  cp "$preseed" .

  popd

  # Configure vms with nat and intel pxe network boot

  mkdir vdis
  vdidir=`pwd`/vdis

  array=( one two )
  for i in "${array[@]}"
  do
     vdi=`$cygpath "$vdidir/node_$i.vdi"`
     "$vb" createmedium disk --filename "$vdi" --size 6000
     "$vb" createvm --name "node_$i" --register
     "$vb" modifyvm "node_$i" --memory 1024 --vram 128
     "$vb" modifyvm "node_$i"  --rtcuseutc on
     "$vb" storagectl "node_$i" --name "SATA Controller" --add sata
     "$vb" storageattach "node_$i" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium "$vdi"
     "$vb" modifyvm "node_$i" --nic1 nat --nattftpfile1 /undionly.kpxe --nictype1 82540EM --cableconnected1 on
     "$vb" modifyvm "node_$i" --boot1 disk
     "$vb" modifyvm "node_$i" --boot2 net
     "$vb" modifyvm "node_$i" --boot3 none
     "$vb" modifyvm "node_$i" --boot4 none
  done
  # newline

.. _nodejs: https://nodejs.org/
.. _io.js: https://iojs.org/
.. _Python: https://www.python.org/downloads/release/python-2710/
