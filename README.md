# Cellular Service for H31


## Dependencies

* `libqmi-utils` 
* `udhcpc`    
These will be installed automatically by during a `make install` assuming you have an internet connection  


## Installation

To perform an initial install, establish an internet connection and clone the repository.
You will issue the following commands:
```
cd $HOME
git clone https://github.com/horiz31/cellular.git
```

provide your credentials, then continue:
```
make -C $HOME/cellular install
```

This will pull in the necessary dependencies, provision the system and start the cellular service  

To make future changes in the provisioning:
```
make -C $HOME/cellular provision
```

This will enter into an interactive session to help you setup your APN



## Files

 * `Makefile` - installation automation
 * `README.md` - this file
 * `provision.sh` - script to support creating and changing the config file
 * `cellular.service` - service file
 * `cellular-start.sh` - script ran by the service to start the cellular


## Supported Platforms
These platforms are supported/tested:


 * Raspberry PI
   - [x] [Raspbian GNU/Linux 10 (buster)](https://www.raspberrypi.org/downloads/raspbian/)

