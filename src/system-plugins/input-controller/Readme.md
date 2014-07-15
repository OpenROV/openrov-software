## How to register controls
Registration of controls is done through a emitted event: 

    this.cockpit.emit('inputController.register',
      {
        name: "example.keyBoardMapping",
        description: "Example for keymapping.",
        defaults: { keyboard: 'alt+0', gamepad: 'X' },
        down: function() { console.log('0 down'); },
        up: function() { console.log('0 up'); }
      });

This registers a mapping for the keyboard (keycombination alt+0) and a gamepad mapping button X.

__The 'register' function can accept a single object or a object array!__

For more examples, see the RovPilot.js file.

## Unregistering
For the Tankcontrol we needed a way to override and unregister (aka reapply old bindings) commands.

To override a given command, simply register a new command.
To unregister use:
     
      rov.cockpit.emit('inputController.unregister', ['example.keyBoardMapping', 'example.keyBoardMapping2']);
 
__The 'unregister' function can accept a single string or a string array!__

After the unregistration, the InputController will reapply all other bindings automatically.
