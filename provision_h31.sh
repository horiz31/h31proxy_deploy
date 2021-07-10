#!/bin/bash

SUDO=$(test ${EUID} -ne 0 && which sudo)
SYSCFG=/etc/systemd
UDEV_RULESD=/etc/udev/rules.d

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
	local result=$($SUDO grep $1 $CONF 2>/dev/null | cut -f2 -d=)
	if [ -z "$result" ] ; then result=$2 ; fi
	echo $result
}

# pull default provisioning items from the network.conf (generate it first)
function value_from_network {
	local result=$($SUDO grep $1 $(dirname $CONF)/network.conf 2>/dev/null | cut -f2 -d=)
	if [ -z "$result" ] ; then result=$2 ; fi
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
	h31proxy.conf)	
		LOS_HOST=$(value_of LOS_HOST 224.10.10.10)	
		LOS_PORT=$(value_of LOS_PORT 14550)
		LOS_IFACE=$(value_of LOS_IFACE eth0)
		BACKUP_HOST=$(value_of BACKUP_HOST 225.10.10.10)
		BACKUP_PORT=$(value_of BACKUP_PORT 14560)
		BACKUP_IFACE=$(value_of BACKUP_IFACE edge0)
		FMU_SERIAL=$(value_of FMU_SERIAL /dev/ttyTHS1)
		FMU_BAUDRATE=$(value_of FMU_BAUDRATE 500000)
		ATAK_HOST=$(value_of ATAK_HOST 239.2.3.1)
		ATAK_PORT=$(value_of ATAK_PORT 6969)
		FMU_SYSID=$(value_of FMU_SYSID 1)
		if ! $DEFAULTS ; then
			FMU_SERIAL=$(interactive "$FMU_SERIAL" "FMU_SERIAL, serial port connected to the FMU (e.g. /dev/ttyTHS1)")	
			FMU_BAUDRATE=$(interactive "$FMU_BAUDRATE" "FMU_BAUDRATE, Baud rate for comms from the FMU")	
			FMU_SYSID=$(interactive "$FMU_SYSID" "FMU_SYSID, System ID of the FMU")			
			LOS_HOST=$(interactive "$LOS_HOST" "LOS_HOST, Primary host IP address")	
			LOS_PORT=$(interactive "$LOS_PORT" "LOS_PORT, Primary host port")	
			LOS_IFACE=$(interactive "$LOS_IFACE" "LOS_IFACE, Interface to use for the primary comms")	
			BACKUP_HOST=$(interactive "$BACKUP_HOST" "BACKUP_HOST, Secondary host IP address")	
			BACKUP_PORT=$(interactive "$BACKUP_PORT" "BACKUP_PORT, Secondary host port")	
			BACKUP_IFACE=$(interactive "$BACKUP_IFACE" "BACKUP_IFACE, Interface to use for the secondary comms")				
			ATAK_HOST=$(interactive "$ATAK_HOST" "ATAK_HOST, Multicast address for ATAK CoT messages")	
			ATAK_PORT=$(interactive "$ATAK_PORT" "ATAK_PORT, Port for where to send the ATAK CoT messages")					
		fi	
		echo "[Service]" > /tmp/$$.env && \
		echo "FMU_SERIAL=${FMU_SERIAL}" >> /tmp/$$.env && \
		echo "FMU_BAUDRATE=${FMU_BAUDRATE}" >> /tmp/$$.env && \
		echo "FMU_SYSID=${FMU_SYSID}" >> /tmp/$$.env && \
		echo "LOS_HOST=${LOS_HOST}" >> /tmp/$$.env && \
		echo "LOS_PORT=${LOS_PORT}" >> /tmp/$$.env && \
		echo "LOS_IFACE=${LOS_IFACE}" >> /tmp/$$.env && \
		echo "BACKUP_HOST=${BACKUP_HOST}" >> /tmp/$$.env && \
		echo "BACKUP_PORT=${BACKUP_PORT}" >> /tmp/$$.env && \
		echo "BACKUP_IFACE=${BACKUP_IFACE}" >> /tmp/$$.env && \
		echo "ATAK_HOST=${ATAK_HOST}" >> /tmp/$$.env && \
		echo "ATAK_PORT=${ATAK_PORT}" >> /tmp/$$.env		
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


