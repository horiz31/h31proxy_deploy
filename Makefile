# Automation boilerplate

SHELL := /bin/bash
SN := $(shell hostname)
SUDO := $(shell test $${EUID} -ne 0 && echo "sudo")
.EXPORT_ALL_VARIABLES:

SERIAL ?= $(shell python3 serial_number.py)
LOCAL=/usr/local
LOCAL_SCRIPTS=start-h31proxy.sh
CONFIG ?= /var/local
LIBSYSTEMD=/lib/systemd/system
PKGDEPS ?= 
SERVICES=h31proxy.service
SYSCFG=/etc/systemd
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
	@echo "Starting config wizard:"	
	@./provision.sh $@

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

install: dependencies
	@./ensure-dotnet.sh	
	@[ -d $(LOCAL)/src/h31proxy ] || mkdir $(LOCAL)/src/h31proxy
	@$(SUDO) cp -a bin/. $(LOCAL)/src/h31proxy/
	@for s in $(LOCAL_SCRIPTS) ; do $(SUDO) install -Dm755 $${s} $(LOCAL)/bin/$${s} ; done
	@$(MAKE) --no-print-directory -B $(SYSCFG)/h31proxy.conf
	@$(MAKE) --no-print-directory enable

provision:
	@$(MAKE) --no-print-directory -B $(SYSCFG)/h31proxy.conf
	$(SUDO) systemctl restart h31proxy

see:
	$(SUDO) cat $(SYSCFG)/h31proxy.conf

uninstall:
	@$(MAKE) --no-print-directory disable
	@( for s in $(SERVICES) ; do $(SUDO) rm $(LIBSYSTEMD)/$${s%.*}.service ; done ; true )
	@if [ ! -z "$(SERVICES)" ] ; then $(SUDO) systemctl daemon-reload ; fi
	$(SUDO) rm -f $(SYSCFG)/h31proxy.conf


