(function (window, document, undefined) {
  'use strict';
  var headings = [
      'N',
      'E',
      'S',
      'W'
    ], Compass;
  Compass = function (cockpit) {
    console.log('Adding Compass to Artificial Horizon.');
    // Instance variables
    this.cockpit = cockpit;
    // Add required UI elements
    $('#video-container').append('<div id="compass" class="hud"></div>');
    var div = $('#compass').get(0);
    // Listen to navdata updates
    var compass = this;
    this.cockpit.socket.on('navdata', function (data) {
      if (!jQuery.isEmptyObject(data)) {
        requestAnimationFrame(function () {
          compass.moveTo(data.hdgd);
        });
      }
    });
    // Setup compass canvas
    var divRect = div.getBoundingClientRect(), ctx, x, i, needle;
    div.style.position = 'absolute';
    // div.style.bottom = '0px';
    div.style.backgroundImage = '-webkit-radial-gradient(50% 50%, circle cover, rgb(68, 68, 68) 0%, black 100%)';
    this.visibleWidth = divRect.width * (720 / 120);
    // divRect.width;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.visibleWidth * 2;
    this.canvas.height = divRect.height;
    this.canvas.style.position = 'absolute';
    this.canvas.className = 'hud';
    div.style.overflow = 'hidden';
    ctx = this.canvas.getContext('2d');
    x = 0;
    ctx.textAlign = 'center';
    for (i = 0; i < 360 * 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      if (i % 90 === 0) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold';
        ctx.fillText(headings[i / 90 % 4], x, 24);
        ctx.strokeStyle = 'white';
        ctx.lineTo(x, 10);
        ctx.lineWidth = 2;
      } else if (i % 10 === 0) {
        ctx.fillStyle = '#CCC';
        ctx.font = 'normal';
        ctx.fillText(i % 360, x, 24);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.lineTo(x, 7);
      } else {
        ctx.strokeStyle = 'white';
        ctx.lineTo(x, 5);
        ctx.lineWidth = 0.5;
      }
      ctx.stroke();
      x += this.visibleWidth / 720;
    }
    div.appendChild(this.canvas);
    needle = document.createElement('canvas');
    needle.id = "needle";
    needle.width = 15;
    needle.height = 15;
    needle.style.top = 0;
    needle.style.left = Math.floor(this.visibleWidth / 2 * (120 / 720) - needle.width / 2) + 'px';
    needle.style.position = 'absolute';
    ctx = needle.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.ceil(needle.width / 2), needle.height);
    ctx.lineTo(needle.width, 0);
    ctx.lineTo(0, 0);
    ctx.fill();
    div.appendChild(needle);
    this.moveTo(0);

    var self = this;
    // Bind on window events to resize
    $(window).resize(function (event) {

      //Bandaid. The entire compass should be moved in to a draw function that gets cleared and redrawn on resize.
      var div = $('#compass').get(0);
      var needle = document.getElementById('needle');
      var divRect = div.getBoundingClientRect(), ctx, x, i, needle;
      var visibleWidth = divRect.width * (720 / 120);
      needle.style.left = Math.floor(visibleWidth / 2 * (120 / 720) - needle.width / 2) + 'px';
    });
  };
  Compass.prototype.moveTo = function (angle) {
    var offset, compass = this;
    while (angle > 180) {
      angle -= 360;
    }
    while (angle < -180) {
      angle += 360;
    }
    offset = -angle * (this.visibleWidth / 720);
    offset -= this.visibleWidth / 2;
    // '-webkit-transform'
    window.requestAnimationFrame(function () {
      // compass.canvas.getContext('2d').scale((10),1);
      compass.canvas.style.webkitTransform = 'scale(,1)' + offset + 'px)';
      compass.canvas.style.webkitTransform = 'translateX(' + offset + 'px)';
    });
  };
  window.Cockpit.plugins.push(Compass);
}(window, document, undefined));
