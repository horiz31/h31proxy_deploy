#!/bin/bash
# script to start the LOS video streaming service
# 
#
# This starts h31proxy
# Assumption is that two udev rules exist, /dev/camera1 is a xraw source and /dev/stream1 is a h.264 source, should should be done during provisioning, typically make install

SUDO=$(test ${EUID} -ne 0 && which sudo)
LOCAL=/usr/local
CONFIG_DIR=/etc/systemd
ELP_H264_UVC=${LOCAL}/src/ELP_H264_UVC
#PLATFORM=$(python3 serial_number.py | cut -c1-4) #PLATFORM is now stored in the video.conf file

echo "Starting H31Proxy.net"

function ifup {    
    local output=$(ip link show "$1" up 2>/dev/null)
    if [[ -n "$output" ]] ; then return 0        
    else return 1
    fi
}

dotnet ${LOCAL}/src/h31proxy/h31proxy.net.dll ${CONFIG_DIR}/h31proxy.conf ${CONFIG_DIR}/video.conf