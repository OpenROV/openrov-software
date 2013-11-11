(function (window, $, undefined) {
    'use strict';

    var Motor_diags;

    Motor_diags = function Motor_diags(cockpit) {
        console.log("Loading Motor_diags plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;

        // Add required UI elements
	$("#diagnostic H3:contains('Diagnostics')").after(
	           ' <div class="settings-block"> \
                <h4>Manually test motors</h4> \
                <div class="control-group invisible-field"> \
                    <label class="control-label" for="portMotorSpeed">Port Motor</label> \
                    <input type="text" id="portMotorSpeedVal"/> \
                    <div class="controls"> \
                        <div id="portMotorSpeed"></div> \
                    </div> \
                </div> \
		<label class="control-label" for="reverse-port-thruster">Reverse Port Thruster</label> \
		<input type="checkbox" id="reversePortThruster" /> \
                <div class="control-group invisible-field"> \
                    <label class="control-label" for="starbordMotorSpeed">Starboard Motor</label> \
                    <input type="text" id="starbordMotorSpeedVal"/> \
                    <div class="controls"> \
                        <div id="starbordMotorSpeed"></div> \
                    </div> \
                </div> \
		<label class="control-label" for="reverse-starbord-thruster">Reverse Starbord Thruster</label> \
		<input type="checkbox" id="reverseStarbordThruster" />		 \
                <div class="control-group invisible-field"> \
                    <label class="control-label" for="verticalMotorSpeedVal">Vertical Motor</label> \
                    <input type="text" id="verticalMotorSpeedVal"/> \
                    <div class="controls"> \
                        <div id="verticalMotorSpeed"></div> \
                    </div> \
                </div> \
		<label class="control-label" for="reverse-lift-thruster">Reverse Verticle Thruster</label> \
		<input type="checkbox" id="reverseLiftThruster" />		\
	        <h4>Runtime Settings:</h4> \
	          <div class="control-group invisible-field"> \
		      <label class="control-label" for="deadzone">DeadZone</label><br>min: \
		      <input type="text" id="deadzone_neg" /><br>max:<input type="text" id="deadzone_pos" /> \
		      <div class="controls" data-bind="slider: { min: deadzone_neg, max: deadzone_pos }, sliderOptions: { min: -1, max: 1, step: .001}"></div> \
		  </div> \
            </div>');
	
	    var md = this;
	    $("#starbordMotorSpeed").slider({
                  min:-1,
                  max:1,
                  value:0,
		  step: .001,
                  slide: function( event, ui ) {
                      $( "#starbordMotorSpeedVal" ).val( ui.value );
		      md.sendTestMotorMessage();
                  }
            });
	    $( "#starbordMotorSpeedVal" ).val( $( "#starbordMotorSpeed" ).slider( "value" ) );
	    
            $("#portMotorSpeed").slider({
                  min:-1,
                  max:1,
                  value:0,
		  step: .001,
                  slide: function( event, ui ) {
                      $( "#portMotorSpeedVal" ).val( ui.value );
                      md.sendTestMotorMessage();
                  }
            });
            $( "#portMotorSpeedVal" ).val( $( "#portMotorSpeed" ).slider( "value" ) );

            $("#verticalMotorSpeed").slider({
                  min:-1,
                  max:1,
                  value:0,
		  step: .001,
                  slide: function( event, ui ) {
                      $( "#verticalMotorSpeedVal" ).val( ui.value );
                      md.sendTestMotorMessage();
                  }
            });
            $( "#verticalMotorSpeedVal" ).val( $( "#verticalMotorSpeed" ).slider( "value" ) );
        // Register the various event handlers
        this.listen();
        
    };
    
    //This pattern will hook events in the cockpit and pull them all back
    //so that the reference to this instance is available for further processing
    Motor_diags.prototype.listen = function listen() {
        var motordiag = this;
        $("#diagnostic .back-button").click(function (){
            motordiag.SaveSettings();
        });
        this.cockpit.socket.on('settings', function(data) {
            motordiag.LoadSettings(data);
        });

    };
    Motor_diags.prototype.sendTestMotorMessage = function sendTestMotorMessage(){
              var portVal = $( "#portMotorSpeedVal" ).val();
              var starbordVal = $( "#starbordMotorSpeedVal" ).val();
              var verticalVal = $( "#verticalMotorSpeedVal" ).val();
              this.cockpit.socket.emit('motor_test', {
                  port: portVal,
                  starbord: starbordVal,
                  vertical: verticalVal
              });	
    };
    

    
    Motor_diags.prototype.LoadSettings = function LoadSettings(settings){
     	    if ('deadzone_pos' in settings) $("#deadzone_pos").val(settings.deadzone_pos);
	    if ('deadzone_neg' in settings) $("#deadzone_neg").val(settings.deadzone_neg);
	    if ('reverse_port_thruster' in settings ) $("#reversePortThruster").val(settings.reverse_port_thruster);
	    if ('reverse_starbord_thruster' in settings ) $("#reverseStarbordThruster").val(settings.reverse_starbord_thruster);
	    if ('reverse_lift_thruster' in settings ) $("#reverseLiftThruster").val(settings.reverse_lift_thruster);
    };
    
    Motor_diags.prototype.SaveSettings = function SaveSettings(){
	  console.log("Need to change text boxes so they save true/false vs on/off");
          this.cockpit.socket.emit('update_settings',{deadzone_pos:$("#deadzone_pos").val()});
          this.cockpit.socket.emit('update_settings',{deadzone_neg:$("#deadzone_neg").val()});
          this.cockpit.socket.emit('update_settings',{reverse_port_thruster:$("#reversePortThruster").val()});
          this.cockpit.socket.emit('update_settings',{reverse_starbord_thruster:$("#reverseStarbordThruster").val()});
	  this.cockpit.socket.emit('update_settings',{reverse_lift_thruster:$("#reverseLiftThruster").val()});
	  
    };

    window.Cockpit.plugins.push(Motor_diags);

}(window, jQuery));
