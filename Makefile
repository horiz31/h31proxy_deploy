# Automation boilerplate

SHELL := /bin/bash
SN := $(shell hostname)
SUDO := $(shell test $${EUID} -ne 0 && echo "sudo")
.EXPORT_ALL_VARIABLES:

SERIAL ?= $(shell python3 serial_number.py)
LOCAL=/usr/local
LOCAL_SCRIPTS=scripts/start-h31proxy.sh scripts/cockpitScript.sh
CONFIG ?= /var/local
LIBSYSTEMD=/lib/systemd/system
PKGDEPS ?= cockpit 
SERVICES=h31proxy.service
#SYSCFG=/etc/systemd
SYSCFG=/usr/local/h31/conf
DRY_RUN=false
PLATFORM ?= $(shell python serial_number.py | cut -c1-4)

.PHONY = clean dependencies enable install provision see uninstall 

default:
	@echo "Please choose an action:"
	@echo ""
	@echo "  dependencies: ensure all needed software is installed (requires internet)"
	@echo "  install: update programs and system scripts"
	@echo "  provision: interactively define the needed configurations (all of them)"
	@echo ""
	@echo "The above are issued in the order shown above.  dependencies is only done once."
	@echo ""

$(SYSCFG)/h31proxy.conf:
	@echo "Starting config wizard for h31proxy:"	
	@./scripts/provision_h31.sh $@

$(SYSCFG)/mavnet.conf:	
	@./scripts/provision_mavnet.sh $@

clean:
	@if [ -d src ] ; then cd src && make clean ; fi

dependencies:	
	@if [ ! -z "$(PKGDEPS)" ] ; then $(SUDO) apt-get install -y $(PKGDEPS) ; fi

disable:
	@( for c in stop disable ; do $(SUDO) systemctl $${c} $(SERVICES) ; done ; true )

enable:
	@( for c in stop disable ; do $(SUDO) systemctl $${c} $(SERVICES) ; done ; true )
	@( for s in $(SERVICES) ; do $(SUDO) install -Dm644 $${s%.*}.service $(LIBSYSTEMD)/$${s%.*}.service ; done ; true )
	@if [ ! -z "$(SERVICES)" ] ; then $(SUDO) systemctl daemon-reload ; fi
	@( for s in $(SERVICES) ; do $(SUDO) systemctl enable $${s%.*} ; done ; true )
	@echo ""
	@echo "Service is installed. To run now use sudo systemctl start h31proxy"
	@echo "Inspect output with sudo journalctl -fu h31proxy"
	@echo ""

install: dependencies	
	@$(SUDO) rm -rf /usr/share/cockpit/mavnet/ /usr/share/cockpit/mavnet-server/ /usr/share/cockpit/video/ /usr/share/cockpit/cellular
	@$(SUDO) mkdir /usr/share/cockpit/mavnet/
	@$(SUDO) cp -rf ui/mavnet/* /usr/share/cockpit/mavnet/
	@$(SUDO) mkdir /usr/share/cockpit/mavnet-server/
	@$(SUDO) cp -rf ui/mavnet-server/* /usr/share/cockpit/mavnet-server/
	@$(SUDO) mkdir /usr/share/cockpit/video/
	@$(SUDO) cp -rf ui/video/* /usr/share/cockpit/video/
	@$(SUDO) mkdir /usr/share/cockpit/cellular
	@$(SUDO) cp -rf ui/cellular/* /usr/share/cockpit/cellular/
	@$(SUDO) cp -rf ui/branding-ubuntu/* /usr/share/cockpit/branding/ubuntu/
	@$(SUDO) cp -rf ui/static/* /usr/share/cockpit/static/	
	@$(SUDO) cp -rf ui/base1/* /usr/share/cockpit/base1/
	@$(SUDO) apt install nano
	@$(SUDO) apt install nload
	@$(SUDO) apt install htop
	@[ -d $(LOCAL)/h31 ] || $(SUDO) mkdir $(LOCAL)/h31
	@for s in $(RULES) ; do $(SUDO) install -Dm644 $${s%.*}.rules $(UDEVRULES)/$${s%.*}.rules ; done
	@if [ ! -z "$(RULES)" ] ; then $(SUDO) udevadm control --reload-rules && udevadm trigger ; fi
	@for s in $(LOCAL_SCRIPTS) ; do $(SUDO) install -Dm755 $${s} $(LOCAL)/h31/$${s} ; done
	@for c in stop disable ; do $(SUDO) systemctl $${c} $(SERVICES) ; done ; true
	@[ -d $(LOCAL)/h31/h31proxy ] || $(SUDO) mkdir $(LOCAL)/h31/h31proxy
	@$(SUDO) cp -a bin/. $(LOCAL)/h31/h31proxy/
	@$(SUDO) chmod +x $(LOCAL)/h31/h31proxy/h31proxy.net
	@for s in $(SERVICES) ; do $(SUDO) install -Dm644 $${s%.*}.service $(LIBSYSTEMD)/$${s%.*}.service ; done
	@if [ ! -z "$(SERVICES)" ] ; then $(SUDO) systemctl daemon-reload ; fi
	@for s in $(SERVICES) ; do $(SUDO) systemctl enable $${s%.*} ; done
	@$(SUDO) chown -R h31 /usr/local/h31
	@$(SUDO) sed -i 's/9090/443/g' /lib/systemd/system/cockpit.socket
	@$(SUDO) systemctl daemon-reload
	@$(SUDO) systemctl restart cockpit.socket
	@$(MAKE) --no-print-directory provision

provision:
	@$(MAKE) --no-print-directory -B $(SYSCFG)/h31proxy.conf
	@$(MAKE) --no-print-directory -B $(SYSCFG)/mavnet.conf
	$(SUDO) systemctl restart h31proxy

see:
	$(SUDO) cat $(SYSCFG)/h31proxy.conf
	$(SUDO) cat $(SYSCFG)/mavnet.conf

uninstall:
	@$(MAKE) --no-print-directory disable
	@( for s in $(SERVICES) ; do $(SUDO) rm $(LIBSYSTEMD)/$${s%.*}.service ; done ; true )
	@if [ ! -z "$(SERVICES)" ] ; then $(SUDO) systemctl daemon-reload ; fi
	$(SUDO) rm -f $(SYSCFG)/h31proxy.conf


