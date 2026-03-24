AD groups
grp-os-shell-access (optional)
privileged accounts@lahey.org (sysadm)

Linux groups
irisdev - essential /files g+rw and basic DevOps Health Connect access
irisadm - elevated Health Connect and elevated Linux command access
wheel   - %Manager role for Health Connect and full Linux command access

ZAUTHENTICATE
=============
^AD(id)="last cached copy of AD/Linux groups"
^AD(id,"auth")=$lb([roles])
^AD(id,"ns")="starting namespace"
^AD(id,"ns",[production])=Guest|Dev|Ops|Admin

Security - Applications
=======================
/csp/healthshare/[production]
/csp/sys/op
/csp/sys/exp
/csp/sys/sec

Productions
===========
BILHHOSPITALS
BILHPN
BILHSFTP
BILHWORKDAY
DFCI
HSCUSTOM
LAHEYHEALTH
TRAINING

$ROLES
======
%EnsRole_Administrator

%EnsRole_Developer

%Manager

%Operator

%SQL
