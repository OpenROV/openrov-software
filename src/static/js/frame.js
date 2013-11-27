var videoChecker;
function setupFrameHandling(socket) {
	socket.on('videoStarted', function(data) {
		var address = 'http://' + socket.socket.options.host + ':' + CONFIG.video_port + '/?action=stream';
	   	$('#video-container').attr('background-image', address);
		console.log('video enabled');
		
	/*videoChecker = self.setInterval(function(){
		if($('#video').width()<100){
			//Houston we have a problem
			$('#video').attr('src', "");
			$('#video').attr('src', address);
			console.log('video restarted');
			}
		},1000);	*/
	});
	/*
	socket.on('VideoStopped', function(data) {
		clearInterval(videoChecker);
		console.log('video stopped');
		$('#video').attr('src', 'themes/OpenROV/img/no_camera.jpg');
	});*/
}
