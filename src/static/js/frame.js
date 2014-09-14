var videoChecker;
function setupFrameHandling(socket) {
  socket.on('videoStarted', function (data) {
    var address = 'http://' + socket.io.engine.hostname + ':' + CONFIG.video_port + '/?action=stream';
    //$('#video').attr('poster', address);
    $('#video').attr('src', address);
    console.log('video enabled');
  });
  socket.on('VideoStopped', function (data) {
    console.log('video stopped');
  });
}