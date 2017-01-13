
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

Install node modules needed: 

.. code-block:: bash

  npm install

Install virtualenv:

.. code-block:: bash

  pip install virtualenv

Create virtualenv:

.. code-block:: bash

  virtualenv env

Install python modules:

.. code-block:: bash

  env/bin/pip install -r requirements.txt

Sync django database:

.. code-block:: bash

  env/bin/python django/manage.py migrate

Pasteable commands (linux): 

.. code-block:: bash

  pip install virtualenv

  virtualenv env
  env/bin/pip install -r requirements.txt
  env/bin/python manage.py migrate
  gulp serve

Pasteable commands (win): 

.. code-block:: batch

  npm install
  npm install -g bower
  npm install -g gulp
  pip install virtualenv

  virtualenv env --system-site-packages
  env\Scripts\pip.exe install -r requirements.txt
  env\Scripts\python.exe manage.py migrate
  gulp serve
  
  
To run project on pythonanywhere
================================

Use ansible:

.. code-block:: bash

  eval `ssh-agent`
  homedir=`cygpath -H`/$USER  
  ssh-add $homedir/.ssh/id_rsa
  cd ansible
  ansible-playbook -i hosts --ask-vault-pass site.yml

or 

Clone repo:

.. code-block:: bash

  project=myproject
  git clone this_repo $project
  cd $project

Create virtualenv: 

.. code-block:: bash


  mkvirtualenv ${project} --python=python3.5
  workon ${project}

Install python modules: 

.. code-block:: bash


  pip install -r requirements.txt

Sync django database: 

.. code-block:: bash


  python manage.py migrate

Pasteable commands: 

.. code-block:: bash

  project=myproject
  git clone this_repo $project
  cd $project
  mkvirtualenv ${project} --python=python3.5
  workon ${project}
  pip install -r requirements.txt
  python manage.py migrate

  mkdir -p /var/www/${project}/media                                                                                            
  mkdir -p /var/www/${project}/static
  
  python manage.py collectstatic

Custom wsgi:

.. code-block:: python


  import sys

  path = '/home/fivethreeo/mainapp/'
  if path not in sys.path:
      sys.path.append(path)

  from mainapp.wsgi import application

Install ansible on cygwin with lynx: 

.. code-block:: bash

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

iPXE booting with VirtualBox: 

.. code-block:: bash

  # Unindent code block before pasting heredocs!

  vb="vboxmanage"
  cygpath="echo"
  homedir="~"
  if [[ $(uname) == CYGWIN* ]]
  then
    vb="`find /cygdrive/c/Program\ Files | grep -i vboxmanage.exe`"
    cygpath="cygpath -w"
    homedir=`cygpath -H`/$USER
  fi

  tftp_dir="$homedir/.VirtualBox/TFTP"
  mkdir -p "$tftp_dir"

  # Create ansible key if not existing key is found and copy pubkey to tftp dir
  ssh_key="$homedir/.ssh/id_rsa"
  if [ ! -f $ssh_key ]; then ssh-keygen -t rsa -b 4096 -f $ssh_key -q -N ""; fi
  cp "${ssh_key}.pub" "${tftp_dir}/authorized_keys"

  eval `ssh-agent`
  ssh-add $ssh_key

  # Copy preseed config to tftp dir
  cp utils/preseed.cfg "$tftp_dir"

  # Create ipxe chainboot, is set as tftp boot image in virtualbox
  (cat <<EOF
  #!ipxe

  kernel tftp://10.0.2.4/linux
  initrd tftp://10.0.2.4/initrd.gz
  initrd tftp://10.0.2.4/preseed.cfg preseed.cfg
  initrd tftp://10.0.2.4/authorized_keys authorized_keys
  imgargs linux auto=true preseed=file:///preseed.cfg hostname=jsdev priority=critical
  boot
  EOF
  ) > "$tftp_dir/ipxe_chainboot"

  # Copy ubuntu net installer to tftp dir
  mkdir installer
  pushd installer
  curl http://archive.ubuntu.com/ubuntu/dists/yakkety/main/installer-amd64/current/images/netboot/netboot.tar.gz | tar zx --strip-components 1
  cp ubuntu-installer/amd64/linux $tftp_dir
  cp ubuntu-installer/amd64/initrd.gz $tftp_dir
  popd
  rm -rf installer

  # Copy ipxe.iso, we will boot from this
  # and get ipxe_chainboot location from virtualbox dhcp
  wget --no-check-certificate -O ipxe.iso 'http://boot.ipxe.org/ipxe.iso'

  ipxe="`pwd`/ipxe.iso"
  mkdir vdis
  vdidir=`pwd`/vdis

  # Configure vms with nat and intel pxe network boot
  array=( jsdev )
  for i in "${array[@]}"
  do
     name="${i}-host"
     vdi=`$cygpath "$vdidir/$name.vdi"`
     ipxe=`$cygpath "$ipxe"`
     "$vb" createmedium disk --filename "$vdi" --size 6000
     "$vb" createvm --name "$name" --register
     "$vb" modifyvm "$name" --memory 1024 --vram 128 --rtcuseutc on --ioapic on
     "$vb" storagectl "$name" --name "SATA Controller" --add sata
     "$vb" storageattach "$name" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium "$vdi"

     "$vb" storageattach "$name" --storagectl "SATA Controller" \
       --port 1 --device 0 --type dvddrive --medium "$ipxe"
     # ipxe trick here
     "$vb" modifyvm "$name" --nic1 nat --nattftpfile1 /ipxe_chainboot --nictype1 82540EM --cableconnected1 on
     "$vb" modifyvm "$name" --natpf1 "ssh,tcp,127.0.0.1,2222,10.0.2.15,22"
     "$vb" modifyvm "$name" --natpf1 "http,tcp,127.0.0.1,8080,10.0.2.15,80"
     "$vb" modifyvm "$name" --boot1 disk
     "$vb" modifyvm "$name" --boot2 dvd

  done

  mkdir -p sharedfolder
  pwd=`pwd`
  "$vb" sharedfolder add jsdev-host --name sharedfolder --hostpath `$cygpath "$pwd/sharedfolder"` --automount

  # Wait for deployment to finish

  ssh ansible@127.0.0.1 -p 2222
  # all lines above are pasteable into bash

  vbox_ver=5.1.8
  wget http://download.virtualbox.org/virtualbox/$vbox_ver/VBoxGuestAdditions_$vbox_ver.iso -P /tmp
  sudo mount -o loop /tmp/VBoxGuestAdditions_$vbox_ver.iso /mnt
  sudo sh /mnt/VBoxLinuxAdditions.run
  sudo umonut /mnt/
  sudo rm /tmp/VBoxGuestAdditions_$vbox_ver.iso
  sudo touch /media/sf_sharedfolder/sharing

  sudo reboot

  ansible-playbook site.yml --limit=local -i hosts --ask-vault-pass
  
  SUBLIME="$(cygpath 'C:\Program Files\Sublime Text 3\subl.exe')"
  export EDITOR="$(pwd)/utils/cygrun.sh \"$SUBLIME\" -w"
  echo $EDITOR


.. _nodejs: https://nodejs.org/
.. _Python: https://www.python.org/downloads/release/python-2710/
