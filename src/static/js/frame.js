function setupFrameHandling(socket) {
	socket.on('videoStarted', function(data) {
		var address = 'http://' + socket.socket.options.host + ':' + CONFIG.video_port + '/?action=stream';
	   	$('#video').attr('src', address);
	});
}