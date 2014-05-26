var PhotoCapture;
var fs = require('fs'), path = require('path');
PhotoCapture = function PhotoCapture(name, deps) {
  if (!(this instanceof PhotoCapture))
    return new PhotoCapture(name, deps);
  console.log('This is where photocapture code would execute in the node process.');
  this.listen(deps);
  deps.globalEventLoop.on('photo-added', function (filename) {
    deps.io.sockets.emit('photo-added', filename);
    console.log('sending photo to web client');
  });
};
PhotoCapture.prototype.listen = function listen(deps) {
  var photoc = this;
  var dep = deps;
  deps.io.sockets.on('connection', function (socket) {
    console.log('PhotoCapure:connection');
    var self = this;
    var targetsocket = socket;
    photoc.enumeratePhotos(dep, function (photos) {
      targetsocket.emit('photos-updated', photos);
      console.log('emitting updated photots to clients');
    });
    socket.on('snapshot', function () {
      console.log('PhotoCapure:snapshot found');
      var self = this;
      dep.rov.camera.snapshot(function (filename) {
        console.log('Photo taken: ' + filename);
        dep.io.sockets.emit('photo-added', '/photos/' + path.basename(filename));
      });
    });
  });
};
PhotoCapture.prototype.enumeratePhotos = function (deps, callback) {
  fs.readdir(deps.config.preferences.get('photoDirectory'), function (err, files) {
    if (err)
      throw err;
    var myfiles = [];
    files.forEach(function (file) {
      myfiles.push('/photos/' + path.basename(file));
    });
    callback(myfiles);  //deps.globalEventLoop.emit('photos-updated',myfiles); // trigger files_ready event
  });
};
module.exports = PhotoCapture;