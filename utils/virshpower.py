
import os

def touch(fname, times=None):
    fhandle = open(fname, 'a')
    try:
        os.utime(fname, times)
    finally:
        fhandle.close()

class VirshPowerDriver(PowerDriver):

    name = 'virsh'
    description = "Virsh Power Driver."
    settings = []

    def detect_missing_packages(self):
        return list()

    def power_on(self, system_id, context):
        """Power on Virsh node."""
        touch('/media/sf_fakevirsh/'+context.get('power_id')+'_turnon')

    def power_off(self, system_id, context):
        """Power off Virsh node."""
        touch('/media/sf_fakevirsh/'+context.get('power_id')+'_turnoff')

    def power_query(self, system_id, context):
        """Power query Virsh node."""
        return os.path.exists('/media/sf_fakevirsh/'+context.get('power_id')+'_on') and 'on' or 'off'
