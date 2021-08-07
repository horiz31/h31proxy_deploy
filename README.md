# H31 Proxy Deployment


## Dependencies

will be installed automatically by during a `make install` assuming you have an internet connection  


## Installation

To perform an initial install, establish an internet connection and clone the repository.
You will issue the following commands:
```
cd $HOME
git clone https://github.com/horiz31/h31proxy_deploy.git
```

provide your credentials, then continue:
```
make -C $HOME/h31proxy_deploy install
```

This will pull in the necessary dependencies, provision the system and start the h31proxy service  

To make future changes in the provisioning:
```
make -C $HOME/h31proxy_deploy provision
```

This will enter into an interactive session to help you create the necessary config files


## Supported Platforms
These platforms are supported/tested:


 * Raspberry PI
   - [x] [Raspbian GNU/Linux 10 (buster)](https://www.raspberrypi.org/downloads/raspbian/)
 * Jetson Nano
   - [x] [Jetpack 4.5.2]

