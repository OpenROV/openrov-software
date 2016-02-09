
The OpenROV suite of software is intended for hacking, extending, and modification by everyone.  This guide is intended to get you started on making those changes.  This is a work in progress, feel fee to update this guide and submit pull requests back through github!

The ROV images comes fully loaded with an integrated development envionment for making code changes baked in.  

Were going to get started with creating a new image from scratch that we can use on the beaglebone.  

Build your own image: The detailed instructions can be found here: https://github.com/OpenROV/openrov-image/blob/master/build-dev-image.md

We provide pre-built images that have the current snapshots of our github repos.  You can find those by looking for the dev image announcements in our forum: https://forum.openrov.com/tags/release-notice.

So now you have an image with the latest version of both our customizations for the linux rootfs image as well as for the OpenROV software that comes with it.


###Local development front-end/middleware without a beaglebone 

You can also develop without any external hardware.  Such development requires mocking out the actual hardware interfaces.

Pre-requistis:
[node.js](https://nodejs.org)

Begin by forking the [cockpit](https://github.com/openrov/openrov-cockpit) project to your own account on github.

Clone your forked repository to your local computer

From the local folder, install the npm and browser depenencies (2nd call to npm install)

```
npm install
```

Start the node process in debug mode.  You can debug the node.js code running in the middleware several different ways. From the root openrov-cockpit\src folder (modify the settings as needed to change ports or folder locations):

using [node-inspector](https://github.com/node-inspector/node-inspector) which uses the debug ide built in to chrome/opera.  It has the nice feature of [live editing of running code](https://github.com/node-inspector/node-inspector/wiki/LiveEdit) that are reflected almost instantly in the running applicaiton:
Install node-inspector: `npm install -g node-inspector`

```
USE_MOCK=true video_port=8092 photoDirectory="/tmp" video_url="http://localhost:8092/?action=stream" node-debug --web-port 3080 cockpit.js
```
The system will attempt to open your browser to the debug url. It also displays the url in your console so that you can connect manually.  You can then open a second browser instant to localhost:8080 to connect to the cockpit web server.  


Using a command-line debugger: https://nodejs.org/api/debugger.html
You place a debug `debugger;` statement in your code and the console will break at that point and give you control

```
USE_MOCK=true video_port=8092 photoDirectory=/tmp node cockpit.js --debug
```

Another way to debug is to have the system watch for changes to files and to automatically restat the node.js process.

You need to install forever ahead of time `npm install -g forever`

You can then combine node-inspector and forever this way:  (use --debug-brk instead of --debug is you want it to pause and wait for the node-inspector to connect up before starting).

Open a terminal and start node-inspector on a an alternate port
```
node-inspector --web-port 3080
```

And then in another terminal start the node process
```
USE_MOCK=true video_port=8092 photoDirectory="/tmp" video_url="http://localhost:8092/?action=stream" forever -w -c 'node --debug' cockpit.js
```
#### Overriding settings
All of the settings as saved to the rovconfig.json settings file can be overridden from the command line:

Set environmental variables such as:
plugins__video__forward_camera_url="http://localhost:8092/?action=stream" plugins__ui_manager__selectedUI="theme_r2"

if the variable name has a '-' in it, on linux, you can use the env command to set the value, env 'plugins__ui-manager__selectedUI=theme_r2'

### System-D Tips (https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs)
By default the BBB logs in UTC time.  You can see the list of available timezones using:

`timedatectl list-timezones`

See the current timezone: `timedatectl status`

Change the timezone:  `timedatectl set-timezone America/Los_Angeles`

Use journalctl to view the logs

To view the logs of a particular process: `journalctl -u orov-cockpit.service`



