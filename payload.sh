#!/bin/bash
set -e

echo 'nameserver 208.67.222.222' > /etc/resolv.conf
echo 'nameserver 208.67.220.220' >> /etc/resolv.conf

# install node.js
apt-get update -qq
apt-get install -y curl
curl -sL https://deb.nodesource.com/setup | bash -
apt-get install -y nodejs

npm rebuild
