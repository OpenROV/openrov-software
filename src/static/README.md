Getting started with the static HUD.
=================

## Installing

* `$ npm install`
* `$ npm run-script bower-install`


## Running

You need to run Google like this to make this test page work:
OSX: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --allow-file-access-from-files

Then open `testview.html` in chrome.


## Simulating socket.io messages

In the javascript console execute

`window.frames[0].window.simevents.status.forEach(function(x){x({targetHeading: 120})})`

`window.frames[0].window.simevents.status.forEach(function(x){x({vout: 2.00})})`

`window.frames[0].window.simevents.status.forEach(function(x){x({hdgd: "0.00", deap: "0.00", pitc: "0.00", roll: "0.00", yaw: "0.00", AVCC: "4892" ,
BRDI: "0.25",
BRDT: "28.81",
BRDV: "11.63",
BT1I: "0.00",
BT2I: "0.00",
CAPA: "14",
LIGP: "0.00",
LIGT: "0",
SC1I: "0.00",
SC2I: "0.00",
SC3I: "0.00",
alps: "3937",
atmp: "0.00",
cmd: "rmtrmod()",
cmpd: "Jul 28 2014, 01",
cpuUsage: 0.17000000000000004,
deap: "0.00",
dlms: "0|316321|307462|311223|254734|551015|369616|4900",
elevons: "1502,1502",
elevtarg: "1500.00,1500.00",
fmem: "5777.00",
fthr: "0.00",
hdgd: "0.00",
iout: 0.24,
log: "No I2C devices found↵",
motorAttached: "1",
motors: "1500,1500",
mtarg: "1500,1500",
mtrmod: "1.00,0,1.00,2.00,0,2.00",
pitc: "0.00",
pres: "0.00",
roll: "0.00",
servo: "1500",
starg: "1500",
temp: "0.00",
time: "37752936.00",
ver: "9134722125e2061624ab09f7f096e0421e3ecd08  -",
vout: 11.63,
yaw: "0.00"})})`

Where 0 is the index of the listener you want to make go
