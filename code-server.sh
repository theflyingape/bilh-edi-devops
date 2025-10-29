#!/bin/bash
#
# launch an instance of Microsoft Visual Studio Code for the web
# expects environment variables: IDLE, HOME, USER, PASSWORD
#
# originally authored by Robert Hurst <rhurst@bilh.org> on 6-Mar-2025
#
sudo -v || exit
[ -n "$IDLE" ] || IDLE=3600
let idle=$IDLE
pname=/usr/lib/code-server/lib/node

# if PREPARE requested but a session is already running ... 
if pgrep -c -f $pname -U $USER &> /dev/null ; then
	PORT=`pgrep -a sudo | grep 'code-server' | grep " ${USER} " | awk -FPORT= '{ print $2 }' | awk '{ print $1 }'`
	[ -n "$PORT" ] && sudo pkill -f $pname -U $USER && sleep 2
	PORT=
fi

for pool in `seq 4 -1 1`; do
	let port=( 6500+pool )
	let count=`ss -Hl src :$port | wc -l`
	(( count == 0 )) && PORT=$port
done
[ -n "$PORT" ] || exit 1
echo "PORT=$PORT"

CS=${HOME}/.local/share/code-server
HB=${CS}/heartbeat
DEVOPS=${CS}/User/Workspaces/${USER}-devops.code-workspace

# redirect this new developer session to shared space
if [ ! -d "/files/.code-server${CS}" ]; then
    sudo su - $USER -c "mkdir -p /files/.code-server${CS}"
    ln -sf "/files/.code-server${CS}" "${CS}"
fi

if [ ! -f "${DEVOPS}" ]; then
	sudo su - $USER -c "mkdir -p ${CS}/User/Workspaces"
	sudo su - $USER -c "cp '/files/.code-server/BILH HCIE DevOps.code-workspace' ${DEVOPS}"
	sudo su - $USER -c "cp '/files/.code-server/settings.json' ${CS}/User/"
fi

sudo su - $USER -c "PASSWORD=$PASSWORD PORT=$PORT code-server	\
	-an 'EDI DevOps' --i18n /files/.code-server/custom.json		\
	--auth password --disable-telemetry --disable-update-check	\
	--extensions-dir /files/.code-server/extensions" &

echo "`date`  Launched ... "
sleep 3
sudo pgrep -c -f $pname -U $USER &> /dev/null || exit
echo -n "... and waiting until it goes idle after $idle-seconds"
touch "${HB}"

while (( alive < idle )); do
	now=$( date +%s )
	pulse=$( sudo date +%s -r "${HB}" )
	let alive=( now-pulse )
	echo -n "."
	sleep $(( ( idle-alive ) ))
done

echo 
echo -n "`date`  Shutting down ... "
sudo pkill -f $pname -U $USER && echo "success" || echo "failure!"
reset &> /dev/null
