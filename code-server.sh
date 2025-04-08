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
pgrep -c -f $pname -U $USER && exit

for pool in `seq 4 -1 1`; do
	let port=( 6500+pool )
	let count=`ss -Hl src :$port | wc -l`
	(( count == 0 )) && PORT=$port
done
[ -n "$PORT" ] || exit 1
echo "PORT=$PORT"

HB=${HOME}/.local/share/code-server/heartbeat
WS=${HOME}/.local/share/code-server/User/Workspaces
DEVOPS=${WS}/${USER}-devops.code-workspace

if [ ! -f "${DEVOPS}" ]; then
	sudo su - $USER -c "mkdir -p ${HOME}/.local/share/code-server/User/Workspaces"
	sudo su - $USER -c "cp '/files/.code-server/BILH HCIE DevOps.code-workspace' ${DEVOPS}"
fi

sudo su - $USER -c "PASSWORD=$PASSWORD PORT=$PORT code-server	\
	--auth password --disable-telemetry --disable-update-check	\
	--extensions-dir /files/.code-server/extensions" &

echo "`date`  Launched ... "
sleep 3
sudo pgrep -c -f $pname -U $USER &> /dev/null || exit
echo -n "... and waiting until it goes idle after $idle-seconds"
sudo touch "${HB}"

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
