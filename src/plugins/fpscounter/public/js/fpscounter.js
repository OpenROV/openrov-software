(function (window, $, undefined) {
  'use strict';
  var FPSCounter;
  FPSCounter = function FPSCounter(cockpit) {
    console.log('Loading FPSCounter plugin in the browser.');
    // Instance variables
    this.cockpit = cockpit;
    this.meter = null;
    this.beagletoBrowserMeter = null;
    var _socket = this.cockpit.socket;
    var self = this;
    $.getScript('bower_components/fpsmeter/dist/fpsmeter.js', function () {
      $('#menu').append('<span id=\'fpsmeter\'></span>');
      self.meter = new FPSMeter($('#video-container')[0], {
        interval: 100,
        smoothing: 10,
        show: 'fps',
        toggleOn: 'click',
        decimals: 1,
        maxFps: 30,
        threshold: 100,
        position: 'absolute',
        zIndex: 10,
        left: '5px',
        top: '5px',
        right: 'auto',
        bottom: 'auto',
        margin: '0 0 0 0',
        theme: 'colorful',
        heat: 1,
        graph: 1,
        history: 20
      });
      self.meter.hide();
      $('#footercontent').append('<span class=\'pull-left\' id=\'fpsmeter2\'></span>');
      self.beagletoBrowserMeter = new FPSMeter($('#fpsmeter2')[0], {
        interval: 1000,
        smoothing: 20,
        show: 'ms',
        toggleOn: 'click',
        decimals: 1,
        maxFps: 2,
        threshold: 1000,
        position: 'absolute',
        zIndex: 10,
        left: '0px',
        top: '30px',
        right: 'auto',
        bottom: 'auto',
        margin: '0 0 0 0',
        theme: 'colorful',
        heat: 1,
        graph: 1,
        history: 20
      });
      /*
            setInterval(function() {
                var bmeter = beagletoBrowserMeter;
                bmeter.tickStart();
                var _starttime = new Date();
                FPSCounter.ping('192.168.1.27',function(target,port,status){
                    bmeter.tick();
                    var _endtime = new Date();
                }, 8080, 300)
            },500);
            */
      var _self = self;
      var mysocket = _socket;
      setInterval(function () {
        _self.meter.tick();
      }, 32);
      //This is now also used for the deadman switch.
      setInterval(function () {
        var _starttime = new Date();
        _self.beagletoBrowserMeter.tickStart();
        mysocket.emit('ping', _starttime);
      }, 500);
      _socket.on('pong', function (id) {
        _self.beagletoBrowserMeter.tick();
      });
    });
  };
  FPSCounter.prototype.listen = function listen() {
    var _fpscounter = this;

    // Toggle FPS counter
    _fpscounter.cockpit.emit('inputController.register',
      {
        name: "fpsCounter.toggleFpsCounter",
        description: "Shows/hides the FPS counter for the video steam.",
        defaults: { keyboard: 'f' },
        down: function() { _fpscounter.toggleDisplay(); }
      });
  };
  FPSCounter.prototype.toggleDisplay = function toggleDisplay() {
    //This has been working so not going to refactor to make jshint happy just yet
    this.meter.isPaused ? this.meter.show() : this.meter.hide();//  jshint ignore:line
  };
  FPSCounter.ping = function ping(target, callback, port, timeout) {
    timeout = timeout === null ? 100 : timeout;
    port = port || 80;
    var img = new Image();
    img.onerror = function () {
      if (!img)
        return;
      img = undefined;
      callback(target, port, 'open');
    };
    img.onload = img.onerror;
    img.src = 'http://' + target + ':' + port + '/ping.png/?cachebreaker=' + new Date().getTime();
    setTimeout(function () {
      if (!img)
        return;
      img = undefined;
      callback(target, port, 'closed');
    }, timeout);
  };
  window.Cockpit.plugins.push(FPSCounter);
}(window, jQuery));
