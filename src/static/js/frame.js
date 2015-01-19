var videoChecker;
function setupFrameHandling(socket) {

  // The next session draws the video img to a canvas which is then managed by the GPU
// and is much faster than the browser painting the img tag.
  var canvas = document.getElementById('video-canvas');
  var srcImg = document.getElementById('video');
  var videocontainer = $('#video-container');
  var newCanvas, newImg;
  setInterval(function () {
    var width = videocontainer.innerWidth();
    var height = videocontainer.innerHeight();
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var proportionalHeight = width * srcImg.height / srcImg.width;
    try {
      ctx.drawImage(srcImg, 0, (canvas.height - proportionalHeight) / 2, width, proportionalHeight);
    }
    catch(e) { }
  }, 64);  //only need to redraw at the framerate of source video


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
