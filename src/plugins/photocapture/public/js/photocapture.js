(function (window, $, undefined) {
    'use strict';

    var Photocapture;

    Photocapture = function Photocapture(cockpit) {
        console.log("Loading Photocapture plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;

        // Add required UI elements
	$("#diagnostic").after(
	'<!-- photos --> \
        <div class="drop-in-right" id="photos"> \
            <div class="back-button"></div><h3>Photos</h3> \
	      <div class="settings-block" style="position: relative; overflow: auto; height: 100%"> \
		<ul class="thumbnails" data-bind="foreach: snapshots"> \
		  <li class=""> \
		    <a target="_blank" data-bind="attr: { href: $data}" class="thumbnail"> \
		      <img data-bind="attr: { src: $data}"  width="260" height="180" alt=""> \
		    </a> \
		  </li> \
		</ul> \
	       </div> \
            </div> \
        </div>');
	
	$("#menuitems").append('<li><a href="#" id="show-photos">Photos</a></li>');
	
	$("#servoTilt").before('<div class="btn-group"><button id="capture-photo" class="btn">Capture</button></div>');	 
	
		    socket.on('settings', function (data){
	      console.log('got settings')
	      viewmodel.updateSettings(data);
	    })
	    socket.on('photos-updated', function(data) {
	      console.log('got new photos');
	      viewmodel.updatePhotos(data);
	    })
	    
	    	    $("#capture-photo").click(function(){
	      socket.emit('snapshot');
	    });
		    
		      $("#show-photos").click(function() {
		$("#photos").show('fold');
		viewmodel.sendUpdateEnabled(false);
		Mousetrap.bind('esc', hidePhotos);
	      });
	      
              function hidePhotos() {
                  $("#photos").hide('fold');
                  viewmodel.sendUpdateEnabled(true);
                  Mousetrap.unbind('esc');
              }
	      
              $("#photos .back-button").click(function() {
                  hidePhotos();
              });  	    
		    
	
        // Register the various event handlers
        this.listen();
        
    };
    
    //This pattern will hook events in the cockpit and pull them all back
    //so that the reference to this instance is available for further processing
    Photocapture.prototype.listen = function listen() {
        var photoc = this;

    };
    



    window.Cockpit.plugins.push(Photocapture);

}(window, jQuery));
