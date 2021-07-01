#!/bin/bash
# usage:
#   ensure-dotnet.sh
#
# This script ensures that dotnet 5.0 is installed on the target environment

DRY_RUN=false
LOCAL=/usr/local
DOTNET_DOWNLOAD=https://download.visualstudio.microsoft.com/download/pr/d0a22fa3-b916-49ce-8284-97131b424cb3/cb884163ad34b83f1ae1dbd33e09d77a/aspnetcore-runtime-5.0.7-linux-arm64.tar.gz
DOTNET_RUNTIME=${LOCAL}/bin/dotnet/shared
DOTNET_INSTALL=${LOCAL}/bin/dotnet
H31=https://github.com/horiz31
SUDO=$(test ${EUID} -ne 0 && which sudo)

# set -e stops execution of the script if an error is encountered
set -e

# if the folder does not exist, create, clone and make. If it does, then just pull and make
if ! [ -d "${DOTNET_RUNTIME}" ] ; then
	echo "Downloading dotnet..."
	wget $DOTNET_DOWNLOAD -P /tmp
	$SUDO mkdir -p ${DOTNET_INSTALL} && $SUDO chmod a+w $(dirname ${DOTNET_INSTALL})
	echo "Uncompressing dotnet..."
    $SUDO tar zxf /tmp/aspnetcore-runtime-5.0.7-linux-arm64.tar.gz -C ${DOTNET_INSTALL}

	# see if lines already added
	x=$(cat ~/.bashrc | grep 'DOTNET_ROOT' | head -1)
	if [ -z "$x" ] ; then 
		echo "Adding paths to .bashrc..."
		$SUDO echo "export DOTNET_ROOT=/usr/local/bin/dotnet" >> ~/.bashrc 
		$SUDO echo "export PATH=$PATH:/usr/local/bin/dotnet" >> ~/.bashrc
		$SUD source ~/.bashrc
	fi	
else
	echo "dotnet appears to already be installed"
fi




