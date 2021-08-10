#!/bin/bash

SUDO=$(test ${EUID} -ne 0 && which sudo)
SYSCFG=/etc/systemd
UDEV_RULESD=/etc/udev/rules.d
HW_SERIAL_NUMBER=$(python serial_number.py | cut -c1-16)

# expect to pass the path to the config file
CONF=$1
shift
DEFAULTS=false
DRY_RUN=false
while (($#)) ; do
	if [ "$1" == "--dry-run" ] && ! $DRY_RUN ; then DRY_RUN=true ; set -x ;
	elif [ "$1" == "--defaults" ] ; then DEFAULTS=true ;
	fi
	shift
done

function address_of {
	local result=$(ip addr show $1 | grep inet | grep -v inet6 | head -1 | sed -e 's/^[[:space:]]*//' | cut -f2 -d' ' | cut -f1 -d/)
	echo $result
}

function value_of {
	local result=$($SUDO grep $1 $CONF 2>/dev/null | cut -f2 -d= | xargs)		
	if [ -z "$result" -o "$result" = " " -o "$result" = ""  ] ; 
	then 
		result=$2 				
	fi
	echo $result
	
}



# pull default provisioning items from the network.conf (generate it first)
function value_from_network {
	local result=$($SUDO grep $1 $(dirname $CONF)/network.conf 2>/dev/null | cut -f2 -d=)
	if [ -z "$result" ] ; 
		then 
			result=$2 
	fi
	echo $result
}

function interactive {
	local result
	read -p "${2}? ($1) " result
	if [ -z "$result" ] ; then result=$1 ; elif [ "$result" == "*" ] ; then result="" ; fi
	echo $result
}

function contains {
	local result=no
	#if [[ " $2 " =~ " $1 " ]] ; then result=yes ; fi
	if [[ $2 == *"$1"* ]] ; then result=yes ; fi
	echo $result
}

case "$(basename $CONF)" in
	mavnet.conf)			
		SERIAL_NUMBER=$(value_of SERIAL_NUMBER $HW_SERIAL_NUMBER)	
		DEVICE_TOKEN=$(value_of DEVICE_TOKEN)
		SERVER_ADDRESS=$(value_of SERVER_ADDRESS https://gcs.horizon31.com)	
		if ! $DEFAULTS ; then
			SERIAL_NUMBER=$(interactive "$SERIAL_NUMBER" "SERIAL_NUMBER, MAVNet serial number")	
			DEVICE_TOKEN=$(interactive "$DEVICE_TOKEN" "DEVICE_TOKEN, Device token, obtained by first provisioning the device on the MAVNet server")	
			SERVER_ADDRESS=$(interactive "$SERVER_ADDRESS" "SERVER_ADDRESS, Server address")									
		fi	
		echo "[Service]" > /tmp/$$.env && \
		echo "SERIAL_NUMBER=${SERIAL_NUMBER}" >> /tmp/$$.env && \
		echo "DEVICE_TOKEN=${DEVICE_TOKEN}" >> /tmp/$$.env && \
		echo "SERVER_ADDRESS=${SERVER_ADDRESS}" >> /tmp/$$.env				
		;;

	
	*)
		# preserve contents or generate a viable empty configuration
		#echo "[Service]" > /tmp/$$.env
		;;
esac

if $DRY_RUN ; then
	set +x
	echo $CONF && cat /tmp/$$.env && echo ""
elif [[ $(basename $CONF) == *.sh ]] ; then
	$SUDO install -Dm755 /tmp/$$.env $CONF
else
	$SUDO install -Dm644 /tmp/$$.env $CONF
fi
rm /tmp/$$.env


