(function(jQuery) {
  var MessageManager = function(socket, cockpit) {
    this.socket = socket;
    this.cockpit = cockpit;
    var self = this;

    this.generateSocketEmitCallback = function(config) {
      var arguments = config.signature.join();
      return 'function clbk(' + arguments + ') { ' +
        'self.socket.emit("' + config.name + '"' + (config.signature.length > 0 ? ',' + arguments : '') + ');' +
        '}';
    };

    this.generateCockpitEmitCallback = function(config) {
      var arguments = config.signature.join();
      return 'function clbk(' + arguments + ') { ' +
        'self.cockpit.emit("' + config.name + '"' + (config.signature.length > 0 ? ',' + arguments : '') + ');' +
        '}';
    };

    return this;
  };

  MessageManager.prototype.register = function(parameters) {
    var self = this;
    if (!parameters) { return; }
    if (parameters.toSocket) {
      if (! jQuery.isArray(parameters.toSocket)) {
        throw new Error('Can\'t handle toSocket argument of type: ' + jQuery.type(parameters.toSocket));
      }

      var toSocket = [];
      parameters.toSocket.forEach(function(toSocketArg) {
        if (jQuery.type(toSocketArg)) {
          toSocket.push({name: toSocketArg, signature: []});
        }
        else if(jQuery.isPlainObject(toSocketArg)) {
          toSocket.push({name: toSocketArg.name, signature: toSocketArg.signature}); // we don't just copy object to makre sure it has the right layout
        }
        else {
          throw new Error('Can\'t handle toSocket argument of type: ' + jQuery.type(toSocketArg));
        }
      });
      toSocket.forEach(function(socketConfig) {
        eval(
          'cockpit.on("' +
            socketConfig.name + '",' +
            self.generateSocketEmitCallback(socketConfig) +
            ');');
      });

      var fromSocket = [];
      parameters.fromSocket.forEach(function(fromSocketArg) {
        if (jQuery.type(fromSocketArg)) {
          fromSocket.push({name: fromSocketArg, signature: []});
        }
        else if(jQuery.isPlainObject(fromSocketArg)) {
          fromSocket.push({name: fromSocketArg.name, signature: fromSocketArg.signature}); // we don't just copy object to makre sure it has the right layout
        }
        else {
          throw new Error('Can\'t handle fromSocket argument of type: ' + jQuery.type(fromSocketArg));
        }
      });
      fromSocket.forEach(function(socketConfig) {
        eval(
          'cockpit.socket.on("' +
            socketConfig.name + '",' +
            self.generateCockpitEmitCallback(socketConfig) +
            ');');
      });
    }
  };

  window.MessageManager = MessageManager;
})(jQuery);
