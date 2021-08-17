#!/bin/bash

# Only used by cockpit to get some information from the filesystem

while [[ $# -gt 0 ]]; do 
    key="$1"

    case $key in
        -d)
            ls /dev/ | grep video
            exit 0
            ;;
        -s)
            ls /dev/ | grep ttyTH
            exit 0
            ;;
        -i)
            basename -a /sys/class/net/*
            exit 0
            ;;
    esac
done