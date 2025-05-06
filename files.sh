#!/bin/bash
# 
# invoked by server/routes/files
#
cd "`dirname $0`"
SSLKEY="${PWD}/.ssh/id_rsa"
cd public/files

[ -n "$1" ] && cmd="$1" || exit 1
[ -n "$2" ] && user="$2" || exit 2
[ -n "$3" ] && host="$3" || exit 3
[ -n "$4" ] && artifact="$4" || exit 4
folder=$( dirname ${artifact} )
file=$( basename ${artifact} )

[ "$cmd" = "download" -o "$cmd" = "upload" ] || exit 5

ssh-copy-id -i "${SSLKEY}.pub" ${user}@${host} 2>/dev/null || exit 6

if [ "$cmd" == "download" ]; then
    scp -i "${SSLKEY}" ${user}@${host}:"${artifact}" . || exit 7
fi

if [ "$cmd" == "upload" ]; then
    scp -i "${SSLKEY}" "${file}" ${user}@${host}:"${artifact}" || exit 8
    rm -fv "${file}"
fi

exit
