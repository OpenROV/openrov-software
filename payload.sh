#!/bin/bash

echo 'nameserver 208.67.222.222' > /etc/resolv.conf
echo 'nameserver 208.67.220.220' >> /etc/resolv.conf

npm install --arch=armhf || onerror

cd src/static
npm install
npm run bower
