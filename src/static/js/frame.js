function setupFrameHandling(socket) {
	socket.on('videoStarted', function(data) {
		var address = 'http://' + socket.socket.options.host + ':' + CONFIG.video_port + '/?action=stream';
	   	$('#video').attr('src', address);
		console.log('video enabled');
		
	self.setInterval(function(){
		if($('#video').width()<100){
			//Houston we have a problem
			$('#video').attr('src', "");
			$('#video').attr('src', address);
			console.log('video restarted');
			}
		},1000);	
	});
}