#!/bin/bash
set -e

cat /etc/hosts
ifconfig
echo 'nameserver 8.8.4.4' > /etc/resolv.conf
echo 'nameserver 208.67.222.222' >> /etc/resolv.conf
echo 'nameserver 208.67.220.220' >> /etc/resolv.conf

# install node.js
apt-get update -qq
apt-get install -y curl
curl -sL https://deb.nodesource.com/setup | bash -
apt-get install -y nodejs

npm install --loglevel silly --local-address 127.0.0.2

cd src/static
npm install --loglevel error
npm run bower
cd ../..
