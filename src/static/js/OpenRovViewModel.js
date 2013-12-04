
// These constants map to the arduino device.h file's constants for capabilities of the ROV
const  LIGHTS_CAPABLE = 1;
const  CALIBRATION_LASERS_CAPABLE = 2;
const  CAMERA_MOUNT_1_AXIS_CAPABLE = 3;
const  COMPASS_CAPABLE = 4;
const  ORIENTATION_CAPABLE = 5;
const  DEAPTH_CAPABLE = 6;

function OpenRovViewModel(){
    var self = this;
    self.telemetry = new Object();
    self.unitMeasurement = ko.observable("metric");
    self.unitTemperature = ko.observable("celsius");

    self.currentTemperature = ko.observable(0);
    self.currentDepth = ko.observable(0);
    self.currentHeading = ko.observable(115);
    self.currentRunTime = ko.observable(0);
    self.lastPing = ko.observable();
    self.isArduinoConnected = ko.observable("false");
    self.currentVoltage = ko.observable(0);
    self.currentCurrent = ko.observable(0);
    self.currentRawCpuUsage = ko.observable(0);
    self.currentTiltPosition = ko.observable(0);
    self.currentBrightness = ko.observable(0);
    self.currentTime = ko.observable(new Date());
    self.sendUpdateEnabled = ko.observable(true);
    self.rawTelemetry = ko.observableArray([]);
    self.setting = {};
    self.smoothingIncriment = ko.observable(10);
    self.deadzone_pos = ko.observable(0);
    self.deadzone_neg = ko.observable(0);
    self.snapshots = ko.observableArray([]);
    self.googleTalkROVid = ko.observable("");
    self.googleTalkROVpassword = ko.observable("");
    self.googleTalkPilotId = ko.observable("");
    self.reversePortThruster = ko.observable();
    self.reverseStarbordThruster = ko.observable();
    self.reverseLiftThruster = ko.observable();
    self.capabilities = ko.observable(0);
    self.savedBrightness = 0;
    
    
    self.currentCpuUsage = ko.computed(function(){ return (self.currentRawCpuUsage()*100).toFixed(0);});

	self.convertedDepth = ko.computed(function(){
		switch(self.unitMeasurement()){
			case "metric":
				return self.currentDepth()/100+"m";
				break;
			case "imperial":
				return (self.currentDepth()/30.48).toFixed(2)+"ft";
				break;
			default: return "--";
		}
	});

	self.convertedTemperature = ko.computed(function(){
		switch(self.unitTemperature()){
			case "celsius":
				return self.currentTemperature().toFixed(2)+"&deg;C";
				break;
			case "farenheit":
				return ((9/5)*self.currentTemperature()+32).toFixed(2)+"&deg;F";
				break;
			default: return "--";
		}
	});

    self.servoTiltStyle = ko.computed(function(){
        var angle = self.currentTiltPosition()*-45;
        return "-webkit-transform: rotate("+angle+"deg); -moz-transform: rotate("+angle+"deg);transform: rotate("+angle+"deg)";
    });

    self.brightnessClass = ko.computed(function(){
        var brightness = self.currentBrightness();
        return "center level"+brightness;
    });

    self.batteryLevel = ko.computed(function(){
        var voltage = self.currentVoltage();
        if(voltage < 9)
            return "level1";
        if(voltage < 10)
            return "level2";
        if(voltage < 10.5)
            return "level3";
        if(voltage < 11.5)
            return "level4";
        return "level5";
    });


    self.updateConnectionStatus = function(){
        var now = new Date();
        var delay = now - self.lastPing();
        if(delay>3000)
            self.isArduinoConnected(false);
        else
            self.isArduinoConnected(true);
    };

    self.formattedRunTime = ko.computed(function(){
            return msToTime(self.currentRunTime());
        });

	self.arduinoFirmwareVM = new ArduinoFirmwareViewModel();
	
	self.updateSettings = function(settings){
	    if ('deadzone_pos' in settings) self.deadzone_pos(settings.deadzone_pos);
	    if ('deadzone_neg' in settings) self.deadzone_neg(settings.deadzone_neg);
	    if ('smoothingIncriment' in settings) self.smoothingIncriment(settings.smoothingIncriment);
	    if ('reverse_port_thruster' in settings ) self.reversePortThruster(settings.reverse_port_thruster);
	    if ('reverse_starbord_thruster' in settings ) self.reverseStarbordThruster(settings.reverse_starbord_thruster);
	    if ('reverse_lift_thruster' in settings ) self.reverseLiftThruster(settings.reverse_lift_thruster);
	    if ('googletalk_rovid' in settings) self.googleTalkROVid(settings.googletalk_rovid);
	    if ('googletalk_rovpassword' in settings) self.googleTalkROVpassword(settings.googletalk_rovpassword);
	    if ('googletalk_rov_pilotid' in settings) self.googleTalkPilotId(settings.googletalk_rov_pilotid);
	}
	
	self.updateRovsys = function(data){
	    console.log('got RovSys update from Arduino');
	    if ('capabilities' in data) {
		self.capabilities(data.capabilities);
	    }
	}
	
	self.updateStatus = function(data) {
		if ('depth' in data) self.currentDepth(data.depth);
		if ('temp' in data) self.currentTemperature(data.temp);
		if ('time' in data) self.currentRunTime(data.time);
		if ('vout' in data) self.currentVoltage(data.vout);
		if ('iout' in data) self.currentCurrent(data.iout);
		if ('cpuUsage' in data) self.currentRawCpuUsage(data.cpuUsage);
        	self.lastPing(new Date());
		for (i in data){
		  self.telemetry[i] = data[i];
		}
		self.rawTelemetry([]);
		for (var item in self.telemetry){
		  if (self.telemetry.hasOwnProperty(item)) {
		    self.rawTelemetry().push({ key: item, value: self.telemetry[item] });
		  }
		};
		self.rawTelemetry.valueHasMutated();
		
	}
	
	self.updatePhotos = function(data) {
	    self.snapshots(data);
	}

	self.toggleBrightness = function() {
		var current = self.currentBrightness();

		if (current == 0 && self.savedBrightness == 0) {
			self.currentBrightness(10);
		}
		else if (current == 0 && self.savedBrightness != 0) {
			self.currentBrightness(self.savedBrightness);
		}
		else if (current != 0) {
			self.savedBrightness = current;
			self.currentBrightness(0);
			return;
		}

		self.savedBrightness = self.currentBrightness();
	}

    self.updateBrightness = function(value) {
    	if (value == 0) { // value 0 is used to toggle the lights
    		self.toggleBrightness();
    		return;
    	}
    	var newVal = self.currentBrightness();
        newVal += value;
        if(newVal<0 || newVal >10) return;
        self.currentBrightness(newVal);
    }
    
    ko.bindingHandlers.slider = {
	init: function (element, valueAccessor, allBindingsAccessor) {
	    var options = allBindingsAccessor().sliderOptions || {};
	    var sliderValues = ko.utils.unwrapObservable(valueAccessor());

	    if(sliderValues.min !== undefined) {
		options.range = true;
		options.values = [0,0];
	    }        
	    
	    options.slide = function(e, ui) {
		if(sliderValues.min) {
		    sliderValues.min(ui.values[0]);
		    sliderValues.max(ui.values[1]);                                 
		} else {
		    valueAccessor()(ui.value);
		}
	    };
	    
	    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
		$(element).slider("destroy");
	    });
	    
	    $(element).slider(options);
	},
	update: function (element, valueAccessor) {
	    var sliderValues = ko.toJS(valueAccessor());
	    if(sliderValues.min !== undefined) {
		$(element).slider("values", [sliderValues.min, sliderValues.max]);
	    } else {
		$(element).slider("value", sliderValues);
	    }
	    
    
	}
    };    
    

    

    setInterval(self.updateConnectionStatus, 1000);
    setInterval(function () {self.currentTime(new Date())}, 1000);
}
