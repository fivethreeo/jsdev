
To build css/javascript
=======================

Install `nodejs`_.

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

Install `nodejs`_ and `Python`_.

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
  pip install -r django/requirements.txt
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

iPXE booting with VirtualBox: ::

  vb="vboxmanage"
  cygpath="echo"
  homedir="~"
  if [[ $(uname) == CYGWIN* ]]
  then
    vb="`find /cygdrive/c/Program\ Files | grep -i vboxmanage.exe`"
    cygpath="cygpath -w"
    homedir=`cygpath -H`/$USER
  fi

  ssh-keygen -t rsa -b 4096 -f $homedir/.ssh/id_rsa

  preseed="`pwd`/ansible/preseed.cfg"

  # Can be slow, be patient
  wget --no-check-certificate -O ipxe.iso 'http://boot.ipxe.org/ipxe.iso'

  mkdir -p "$homedir/.VirtualBox"
  pushd "$homedir/.VirtualBox"
  mkdir TFTP
  cd TFTP

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
  cp $homedir/.ssh/id_rsa.pub authorized_keys

  popd

  # Configure vms with nat and intel pxe network boot

  ipxe="`pwd`/ipxe.iso"
  mkdir vdis
  vdidir=`pwd`/vdis

  array=( maas_master fourth )
  for i in "${array[@]}"
  do
     vdi=`$cygpath "$vdidir/node_$i.vdi"`
     ipxe=`$cygpath "$ipxe"`
     "$vb" createmedium disk --filename "$vdi" --size 6000
     "$vb" createvm --name "node_$i" --register
     "$vb" modifyvm "node_$i" --memory 1024 --vram 128 --rtcuseutc on --ioapic on
     "$vb" storagectl "node_$i" --name "SATA Controller" --add sata
     "$vb" storageattach "node_$i" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium "$vdi"
     if [[ $i == *_master ]]
     then
       "$vb" storageattach "node_$i" --storagectl "SATA Controller" \
         --port 1 --device 0 --type dvddrive --medium "$ipxe"
       "$vb" modifyvm "node_$i" --nic1 nat --nattftpfile1 /ipxe --nictype1 82540EM --cableconnected1 on
       "$vb" modifyvm "node_$i" --natpf1 "ssh,tcp,127.0.0.1,2222,10.0.2.15,22"
       "$vb" modifyvm "node_$i" --natpf1 "http,tcp,127.0.0.1,8080,10.0.2.15,80"
       "$vb" modifyvm "node_$i" --nic2 intnet --intnet2 "cluster" --nictype2 82540EM \
         --nicpromisc2 allow-vms --cableconnected2 on
       "$vb" modifyvm "node_$i" --boot1 disk
       "$vb" modifyvm "node_$i" --boot2 dvd
     else
       "$vb" modifyvm "node_$i" --nic1 intnet --intnet1 "cluster" --nictype1 82540EM \
         --nicpromisc1 allow-vms --cableconnected1 on
       "$vb" modifyvm "node_$i" --boot1 net
       "$vb" modifyvm "node_$i" --boot2 none
     fi
  done
  # newline

  eval `ssh-agent`
  ssh-add $homedir/.ssh/id_rsa

  proxy="-o ProxyJump=ansible@localhost:2222"
  ansible_cfg=$"[ssh_connection]\nssh_args="
  ansible_proxy=$"[group:vars]\nansible_ssh_common_args=$proxy"
  echo -e $ansible_cfg
  echo -e $ansible_proxy
  ssh ansible@localhost -p 2222
  ssh $proxy ansible@a_intnet_host
  ansible $ansible_proxy_arg -i hosts -m ping all

.. _nodejs: https://nodejs.org/
.. _Python: https://www.python.org/downloads/release/python-2710/
