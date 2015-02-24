(function(jQuery) {
  var MessageManager = function(socket) {
    this.socket = socket;

    this.onAny(function(data1, data2, data3, data4, data5) {
      if (this.event !== 'newListener') {
        socket.emit(this.event, data1, data2, data3, data4, data5);
      }
    });

    this.on('newListener', function(aType, aListener) {
      socket.on(aType, aListener);
    });

    return this;
  };
  MessageManager.prototype = new EventEmitter2({ newListener: true });
  MessageManager.prototype.constructor = MessageManager;

  window.MessageManager = MessageManager;
})(jQuery);
