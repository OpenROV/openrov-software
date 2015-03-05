(function(){
  var EventEmitter2 = require('eventemitter2').EventEmitter2;

  var CockpitMessaging = function(io, opts) {
    var listeners = [];
    var sockets = [];

    this.volatile = {
      emit: function(event, data1, data2, data3, data4, data5) {
        sockets.forEach(function(socket) {
          socket.volatile.emit(event, data1, data2, data3, data4, data5);
        });
      }
    };

    this.onAny(function(data1, data2, data3, data4, data5) {
      var event = this.event;
      if (event !== 'newListener') {
        sockets.forEach(function(socket) {
          socket.emit(event, data1, data2, data3, data4, data5);
        });
      }
    });

    this.on('newListener', function(aType, aListener) {
      if (aType !== 'newListener') {
        listeners.push({type: aType, fn: aListener});
      }
    });

    io.on('connection', function(socket) {
      sockets.push(socket);
      listeners.forEach(function(listener) {
        socket.on(listener.type, listener.fn);
      });
      socket.on('disconnect', function() {
        var i = sockets.indexOf(socket);
        delete sockets[i];
      });

    });

  };
  CockpitMessaging.prototype = new EventEmitter2({wildcard:true, newListener: true });
  CockpitMessaging.prototype.constructor = CockpitMessaging;

  module.exports = CockpitMessaging;
})();