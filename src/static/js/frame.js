var socket = io.connect();

var lastVideo = Date.now();
// =====================================================
// Handle video input
socket.on('frame', function(data) {
  lastVideo = Date.now();
  document.getElementById('video').src = 'data:image/jpeg;base64,' + data;
});

setInterval(function() {
  if(Date.now() - lastVideo > 5000) document.getElementById('video').src = '/img/no_camera.jpg';
}, 1000);