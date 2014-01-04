var SerialMonitor;

SerialMonitor = function SerialMonitor(name, deps) {
    if (!(this instanceof SerialMonitor))
        return new SerialMonitor(name,deps)
    
    console.log("This is where serail-monitor code would execute in the node process.");

    this.listen(deps);
}

SerialMonitor.prototype.listen = function listen(deps){
    var seralM = this;
    var dep = deps;
    
    deps.globalEventLoop.on('serial-recieved',function(data){
        deps.io.sockets.emit('serial-recieved',data);
    });    
}

module.exports = SerialMonitor;
