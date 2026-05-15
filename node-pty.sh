#!/bin/bash
# 
# invoked by server/routes/node-pty
#
LAST="${@:$#}"
[[ $LAST =~ ^[0-9]+$ ]] || LAST=22
let -n PORT=$(( $LAST + 0 ))
[ $PORT -lt 22 ] && PORT=22

cd "`dirname $0`"
ssh-copy-id -i .ssh/id_rsa.pub -p $PORT $1@$2 2>/dev/null

[ "$3" = "tmux" ]  \
    && ssh -i .ssh/id_rsa -p $PORT $1@$2 -t -C "/bin/sh -l -c 'tmux -2 attach || tmux -2 new'"  \
    || ssh -i .ssh/id_rsa -p $PORT $1@$2

exit
