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

`simevents.status[0]({time: 134123111})`

Where 0 is the index of the listener you want to make go
