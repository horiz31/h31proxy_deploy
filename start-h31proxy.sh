#!/bin/bash
# script to start the LOS video streaming service
# 
#
# This starts h31proxy
# Assumption is that two udev rules exist, /dev/camera1 is a xraw source and /dev/stream1 is a h.264 source, should should be done during provisioning, typically make install

SUDO=$(test ${EUID} -ne 0 && which sudo)
LOCAL=/usr/local
CONFIG_DIR=/etc/systemd
echo "Starting H31Proxy.net"

cd ${LOCAL}/src/h31proxy/ && ./h31proxy.net ${CONFIG_DIR}/h31proxy.conf ${CONFIG_DIR}/mavnet.conf ${CONFIG_DIR}/video.conf