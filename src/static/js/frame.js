var socket = io.connect();

// =====================================================
// Handle video input
socket.on('frame', function(data) {
  document.getElementById('video').src = 'data:image/jpeg;base64,' + data;
});