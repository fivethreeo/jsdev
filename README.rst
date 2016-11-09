
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

  env/bin/pip install -r requirements.txt

Sync django database: ::

  env/bin/python django/manage.py migrate

Pasteable commands (linux): ::

  pip install virtualenv

  virtualenv env
  env/bin/pip install -r requirements.txt
  env/bin/python manage.py migrate
  gulp serve

Pasteable commands (win): ::

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

  pip install -r requirements.txt

Sync django database: ::

  python manage.py migrate

Pasteable commands: ::

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

Custom wsgi: ::

  import sys

  path = '/home/fivethreeo/mainapp/'
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

  tftp_dir="$homedir/.VirtualBox/TFTP"
  mkdir -p "$tftp_dir"

  # Create ansible key and copy pubkey to tftp dir
  ssh_key="$homedir/.ssh/id_rsa"
  ssh-keygen -t rsa -b 4096 -f $ssh_key -q -N ""
  cp "${ssh_key}.pub" "${tftp_dir}/authorized_keys"

  # Copy preseed config to tftp dir
  cp utils/preseed.cfg "$tftp_dir"

  # Create ipxe chainboot, is set as tftp boot image in virtualbox
  (cat <<EOF
  #!ipxe

  kernel tftp://10.0.2.4/linux
  initrd tftp://10.0.2.4/initrd.gz
  initrd tftp://10.0.2.4/preseed.cfg preseed.cfg
  initrd tftp://10.0.2.4/authorized_keys authorized_keys
  imgargs linux auto=true preseed=file:///preseed.cfg hostname=maas-bastion priority=critical
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
  array=( bastion first second third fourth )
  for i in "${array[@]}"
  do
     name="${i}_host"
     vdi=`$cygpath "$vdidir/$name.vdi"`
     ipxe=`$cygpath "$ipxe"`
     "$vb" createmedium disk --filename "$vdi" --size 6000
     "$vb" createvm --name "$name" --register
     "$vb" modifyvm "$name" --memory 1024 --vram 128 --rtcuseutc on --ioapic on
     "$vb" storagectl "$name" --name "SATA Controller" --add sata
     "$vb" storageattach "$name" --storagectl "SATA Controller" --port 0 --device 0 --type hdd --medium "$vdi"
     if [[ $i == bastion ]]
     then
       "$vb" storageattach "$name" --storagectl "SATA Controller" \
         --port 1 --device 0 --type dvddrive --medium "$ipxe"
       # ipxe trick here
       "$vb" modifyvm "$name" --nic1 nat --nattftpfile1 /ipxe_chainboot --nictype1 82540EM --cableconnected1 on
       "$vb" modifyvm "$name" --natpf1 "ssh,tcp,127.0.0.1,2222,10.0.2.15,22"
       "$vb" modifyvm "$name" --natpf1 "http,tcp,127.0.0.1,8080,10.0.2.15,80"
       "$vb" modifyvm "$name" --nic2 intnet --intnet2 "cluster" --nictype2 82540EM \
         --nicpromisc2 allow-vms --cableconnected2 on
       "$vb" modifyvm "$name" --boot1 disk
       "$vb" modifyvm "$name" --boot2 dvd
     else
       "$vb" modifyvm "$name" --nic1 intnet --intnet1 "cluster" --nictype1 82540EM \
         --nicpromisc1 allow-vms --cableconnected1 on
       "$vb" modifyvm "$name" --boot1 net
       "$vb" modifyvm "$name" --boot2 none
     fi
  done

  # Start bastion
  "$vb" startvm bastion_host

  # Wait for deployment to finish
  eval `ssh-agent`
  ssh-add $homedir/.ssh/id_rsa

  # ssh to bastion
  ssh ansible@localhost -p 2222
  # set up maas
  (cat <<EOF
  auto enp0s8
  iface enp0s8 inet static
  address 10.0.0.1
  netmask 255.255.255.0
  EOF
  ) | sudo tee /etc/network/interfaces.d/enp0s8
  sudo apt-get -y install maas
  sudo sed -i -e 's/\({{endif}}\)/\1\n  package_install: ["curtin", "in-target", "--", "apt-get", "-y", "install", "python"]/' /etc/maas/preseeds/curtin_userdata
  sudo sed -i -r -e 's/#?(prepend domain-name-servers).*/\1 127.0.0.1;/' /etc/dhcp/dhclient.conf
  sudo maas createadmin --username maas --password password --email your@email.com
  sudo reboot
  # done setting up bastion

  # http://127.0.0.1:8080/MAAS/
  # Add key in settings
  cat $homedir/.ssh/id_rsa.pub
  # Add dhcp to VLAN in fabric-1

  # Start other vms
  "$vb" startvm first_host

  # Commission and deploy in maas admin

  # Set up proxied ssh connection through bastion for ansible
  proxy="-o ProxyJump=ansible@localhost:2222"
  ansible_cfg="[ssh_connection]\nssh_args="
  ansible_proxy="[group:vars]\nansible_ssh_common_args=$proxy"
  # echo -e $ansible_cfg > ansible.cfg
  # echo -e $ansible_proxy > hosts

  echo $proxy
  echo -e $ansible_cfg
  echo -e $ansible_proxy

  ssh $proxy ubuntu@a_intnet_host
  # Pass -f 1 to accept hosts one by one
  ansible -i hosts -m ping local --ask-vault-pass -f 1

  SUBLIME="$(cygpath 'C:\Program Files\Sublime Text 3\subl.exe')"
  export EDITOR="$(pwd)/utils/cygrun.sh \"$SUBLIME\" -w"
  echo $EDITOR


.. _nodejs: https://nodejs.org/
.. _Python: https://www.python.org/downloads/release/python-2710/
