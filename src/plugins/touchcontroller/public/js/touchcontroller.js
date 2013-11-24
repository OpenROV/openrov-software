(function (window, $, undefined) {
    'use strict';

    var Touchcontroller;
    
    var is_touch_device = 'ontouchstart' in document.documentElement;

    Touchcontroller = function Touchcontroller(cockpit) {
        console.log("Loading Touchcontroller plugin in the browser.");
        //if (!is_touch_device) return;
        // Instance variables
        this.cockpit = cockpit;
        
        GameController.init( { 
            left: {
                type: 'joystick', 
                position: { left: '50%', bottom: '50%' },
                touchMove: function( details ) {
                    console.log( details.dx );
                    console.log( details.dy );
                    console.log( details.max );
                    console.log( details.normalizedX );
                    console.log( details.normalizedY );
                }
            }, 
            right: { 
                type: 'joystick', 
                position: { right: '15%', bottom: '15%' } ,
                touchMove: function( details ) {
                    // Do something...
                }
            }
        });        

        // Add required UI elements
        //$("#menu").prepend('<div id="example" >[GameController]</div>');
    };

    window.Cockpit.plugins.push(Touchcontroller);

}(window, jQuery));
