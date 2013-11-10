(function (window, $, undefined) {
    'use strict';

    var Battery;

    Battery = function Battery(cockpit) {
        console.log("Loading Bagttery indicator plugin.");

        // Instance variables
        this.cockpit = cockpit;
        this.level = 100;

        // Add required UI elements
        $(".navbar-inner").prepend('<div id="battery"><canvas class="gauge" width="50px;" height="25px;" /><span class="level">100%</span></div>');
        this.ctx = $('#battery .gauge').get(0).getContext('2d');
        
        // Bind to navdata events on websockets
        var self = this;
            
        this.cockpit.socket.on('status', function(data) {
            if (!jQuery.isEmptyObject(data)) {
                if ('vout' in data){
                    requestAnimationFrame(function() {
                        self.render(data.vout);
                    });
                }   
            }
        });

        // Initial draw
        this.draw();
    };

    Battery.prototype.render = function(data) {
        this.level = ((12-10.4)-(data-10.4))/(12-10.4);
        $("#battery .level").text(this.level + '%');
        this.draw();
    }

    Battery.prototype.draw = function() {
        var cw = this.ctx.canvas.width;
        var ch = this.ctx.canvas.height;

        this.ctx.clearRect(0, 0, cw, ch);
        this.ctx.save();
        this.ctx.strokeStyle = 'grey';
        this.ctx.fillStyle = 'grey';
        this.ctx.lineWidth = 2;
        roundRect(this.ctx, 5, 1, 40, 20);
        this.ctx.fillRect(45, 5, 4, 12);
         
        var width = Math.floor(this.level / 100 * 35);
        this.ctx.fillStyle = this.getColor();
        roundRect(this.ctx, 8, 3, width, 15, 3, true, false);
          
        this.ctx.restore();
    }

    Battery.prototype.getColor = function() {
        if (this.level > 90) {
            return 'lightgreen';
        } else if (this.level > 80) {
            return 'green';
        } else if (this.level > 70) {
            return 'darkgreen';
        } else if (this.level > 60) {
            return 'lightyellow';
        } else if (this.level > 50) {
            return 'yellow';
        } else if (this.level > 40) {
            return 'darkyellow';
        } else if (this.level > 30) {
            return 'lightred';
        } else if (this.level > 20) {
            return 'red';
        } else {
            return 'darkred';
        }
    }

    window.Cockpit.plugins.push(Battery);

}(window, jQuery));
