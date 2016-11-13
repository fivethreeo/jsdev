#!/usr/bin/python

import sys, os, subprocess, time, StringIO, ConfigParser

def touch(fname, times=None):
    fhandle = open(fname, 'a')
    try:
        os.utime(fname, times)
    finally:
        fhandle.close()

VirtualBox = '/cygdrive/c/Program Files/Oracle/VirtualBox/VBoxManage.exe'
def main(argv):
  try:
    while True:
      
      stdoutdata = subprocess.check_output([VirtualBox, 'list', 'vms'])
      vms = []
      for line in stdoutdata.decode('ascii', 'ignore').split('\n'):
        parts=line.split('"')
        if len(parts)>1:
          vms.append(parts[1])

      stdoutdata = subprocess.check_output([VirtualBox, 'list', 'runningvms'])
      runningvms = []
      for line in stdoutdata.decode('ascii', 'ignore').split('\n'):
        parts=line.split('"')
        if len(parts)>1:
          runningvms.append(parts[1])

      vms_off = set(vms).difference(set(runningvms))
      vms_on = set(vms).intersection(set(runningvms))
      nodes = {'on':[], 'off':[]}
      for node in vms:
        on = False
        node_turnoff = node + '_turnoff'
        node_turnon = node + '_turnon'
        node_ison = node + '_on'
        if node in vms_on:
          on = True
          nodes['on'].append(node)
          touch(node_ison)
          if os.path.exists(node_turnoff):
             os.remove(node_turnoff)
             subprocess.call([VirtualBox, "controlvm", node, "poweroff"]) 
        if node in vms_off:
          nodes['off'].append(node)
          if os.path.exists(node_ison):
            os.remove(node_ison)
          if os.path.exists(node_turnon):
            os.remove(node_turnon)
            subprocess.call([VirtualBox, "startvm", node])

      for status in ['on', 'off']:
        print ("\nNodes with power status: " + status)
        for node in nodes[status]:
          stdoutdata = subprocess.check_output([VirtualBox, 'showvminfo', node, '--machinereadable'])
          ini_str = '[root]\n' + stdoutdata
          ini_fp = StringIO.StringIO(ini_str)
          config = ConfigParser.RawConfigParser()
          config.readfp(ini_fp)
          mac = config.get('root', 'macaddress1')[1:-1]
          cmac = ':'.join(s.encode('hex').upper() for s in mac.decode('hex'))

          print(node + ' ' + cmac)

      print('----')

      time.sleep(15)

  except KeyboardInterrupt:
    pass
  
if __name__ == "__main__":
   main(sys.argv[1:])