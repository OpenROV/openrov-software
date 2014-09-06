(function (window, $, undefined) {
    'use strict';
    var TopDownCompass = function(cockpit) {

        var context = this;

        // Event bindings
        setInterval(this.handleResize, 100);

        // Instance variables
        this.cockpit = cockpit;

        this.compassPanel = $("<div></div>").addClass('topdowncompasspanel');
        this.compass = $("<div></div>").addClass("topdowncompass").addClass('pull-left');
        this.compass.append($("<div></div>").addClass("compassNeedle"));

        this.compassPanel.append(this.compass);

        // Add required UI elements
          $('#footercontent').append(this.compass);

        this.cockpit.socket.on('navdata', function (data) {
            if (!jQuery.isEmptyObject(data)) {

                context.setCompassHeading(parseFloat(data.hdgd));

            }
        });

        this.setCompassHeading(0);
      // test
      //  setInterval(this.setCompassHeading(this.heading+10),250);

    };
    /**
     * Set the compass heading
     * @param degrees
     */
    var el, rot;
    TopDownCompass.prototype.setCompassHeading = function(degrees) {

        var aR;
        this.heading = this.heading || 0; // if rot undefined or 0, make 0, else rot
        aR = this.heading % 360;
        if ( aR < 0 ) { aR += 360; }
        if ( aR < 180 && (degrees > (aR + 180)) ) { this.heading -= 360; }
        if ( aR >= 180 && (degrees <= (aR - 180)) ) { this.heading += 360; }
        this.heading  += (degrees - aR);


        var cp = $(".compassNeedle");
          //  lb = $(".compassDegValue");

        //lb.text(Math.round(degrees));

        cp.css({
            "transform" : "rotate(" + (this.heading) + "deg)",
            "-ms-transform" : "rotate(" + (this.heading) + "deg)",
            "-webkit-transform" : "rotate(" + (this.heading) + "deg)"
        })
    };

    /**
     * Resize the UI
     */
    TopDownCompass.prototype.handleResize = function() {
        var wn = $(window),
            w = wn.width(),
            h = wn.height();

        var nd = $(".topdowncompasspanel");
        if (nd.length > 0) {
            var pn = nd[0].parentNode;
            nd.css({
                width: $(pn).width(),
                height: $(pn).height()
            });
        }
    };

    // Add the panel to the plugin list
    window.Cockpit.plugins.push(TopDownCompass);
}(window, jQuery));
