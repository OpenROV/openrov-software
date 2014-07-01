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
