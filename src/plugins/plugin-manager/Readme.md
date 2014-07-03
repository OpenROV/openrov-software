Plugin Manager readme
===

The plugin manager is currently only active on the client side.

How to register a plugin for management
---

The plugin manager scans the available plugins to see if the expose a property 
``canBeDisabled``, if they do, they are listed in the settings with enable/disable buttons.
The plugins need to expose ``name``, ``viewName`` properties for the preferences and UI and
``enable()`` and ``disable()`` functions that perform the enable/disable functionality.


    (function (window, $, undefined) {
      'use strict';
      var Example;
      Example = function Example(cockpit) {
        console.log('Loading example plugin in the browser.');
        
        // for plugin management:
        this.name = "example" // for the settings
        this.viewName = "Example plugin"; // for the UI
        this.canBeDisabled = true;
        this.enable = function() { alert('example enabled'); };
        this.disable = function() { alert('example disabled'); };
    
      };
      window.Cockpit.plugins.push(Example);
    }(window, jQuery));