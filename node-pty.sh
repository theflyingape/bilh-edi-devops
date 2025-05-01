#!/bin/bash
# 
# invoked by server/routes/node-pty
#
cd "`dirname $0`"
ssh-copy-id -i .ssh/id_rsa.pub $1@$2 2>/dev/null

[ "$3" = "tmux" ]  \
    && ssh -i .ssh/id_rsa $1@$2 -t -C "/bin/sh -l -c 'tmux attach || tmux new'"  \
    || ssh -i .ssh/id_rsa $1@$2

exit
