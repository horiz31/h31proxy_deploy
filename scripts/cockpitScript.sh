#!/bin/bash

# Only used by cockpit to get some information from the filesystem

function ApnChange
{
    echo "Removing existing network manager profile for attcell..."
    nmcli con delete 'attcell'
    echo "Adding network manager profile for attcell..."
    nmcli connection add type gsm ifname cdc-wdm0 con-name "attcell" apn "$1" connection.autoconnect yes	
}

while [[ $# -gt 0 ]]; do 
    key="$1"
    shift
    shift

    case $key in
        -a)
            ApnChange $1
            ;;
        -d)
            ls /dev/ | grep video
            ;;
        -s)
            ls /dev/ | grep ttyTH
            ;;
        -i)
            basename -a /sys/class/net/*
            ;;
    esac
    exit 0
done
