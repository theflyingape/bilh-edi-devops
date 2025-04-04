#!/bin/bash
# 
# invoked by server/routes/node-pty
#
ssh-copy-id -i .ssh/id_rsa.pub $1@$2 2>/dev/null
ssh $1@$2
exit
