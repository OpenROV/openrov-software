function OpenRovViewModel(){
	var self = this;

	self.unitMeasurement = ko.observable("metric");
	self.unitTemperature = ko.observable("celsius");

	self.currentTemperature = ko.observable(0);
	self.currentDepth = ko.observable(0);
	self.currentHeading = ko.observable(115);
	self.currentRunTime = ko.observable(0);
    self.lastPing = ko.observable();
    self.isArduinoConnected = ko.observable(0);
    self.currentVoltage = ko.observable(0);

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
	
	self.updateStatus = function(data) {
		self.currentDepth(data.depth);
		self.currentTemperature(data.temp);
		self.currentRunTime(data.time);
		self.currentVoltage(data.vout);
        self.lastPing(new Date());
	}

    setInterval(self.updateConnectionStatus, 1000);
}
