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
	}
	
	self.updateStatus = function(data) {
		self.currentDepth(data.depth);
		self.currentTemperature(data.temp);
		self.currentRunTime(data.time);
		self.currentVoltage(data.vout);
		self.currentCurrent(data.iout);
		self.currentRawCpuUsage(data.cpuUsage);
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

    self.updateBrightness = function(value) {
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
