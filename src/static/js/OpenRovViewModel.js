
function ArduinoFirmwareViewModel(){
	var self = this;
	var numberOfSteps = 6;

	self.stepsDone = ko.observable(0);

	self.selectedFile = ko.observable();
		
	self.uploadPercentage = ko.observable(0);
	
	self.uploaded = ko.observable(false);
	self.unpacking = ko.observable(false);
	self.unpacked = ko.observable(false);
	self.compiling = ko.observable(false);
	self.compiled = ko.observable(false);
	self.arduinoUploading = ko.observable(false);
	self.arduinoUploaded = ko.observable(false);

	self.reset = function() {
		self.stepsDone(0);
		self.selectedFile('');
		self.uploadPercentage(0);
		self.uploaded(false);
		self.unpacked(false)
		self.unpacking(false);
		self.compiling(false);
		self.compiled(false);
		self.arduinoUploading(false);
		self.arduinoUploaded(false);

	};

    self.selectedFileName = ko.computed(function() {
    	if (self.selectedFile()){
    		return self.selectedFile().name;
    	}
    	return "";
    });

	self.isValidFirmwareFile = ko.computed(function() {
		var fileName = self.selectedFileName();
	    var ext = fileName.split('.').pop().toLowerCase();
	     return ($.inArray(ext, ['zip', 'ino']) != -1);
    });

    self.browserDoesSupportFileApi = ko.computed(function() {
    	return !(window.File && window.FileReader);
    });

	self.overallPercentage = ko.computed(function() {
		var percentage =  (100/numberOfSteps) * self.stepsDone();
		console.log("percentage: " + numberOfSteps + " done: " + self.stepsDone());
		return percentage;
	});

    self.inProgress = ko.computed(function() {
    	return self.stepsDone() != 0;
    });

    self.updateStatus = function(data){
    	if (data.errorMessage){ 
    		//handle error
    		return;
    	}
    	if (self[self.lastStatus]) { 
    		self[self.lastStatus](false);
    	}
    	self[data.key](true);
    	self.stepsDone(self.stepsDone() + 1);
    };

}

function OpenRovViewModel(){
	var self = this;

	self.unitMeasurement = ko.observable("metric");
	self.unitTemperature = ko.observable("celsius");

	self.currentTemperature = ko.observable(0);
	self.currentDepth = ko.observable(0);
	self.currentHeading = ko.observable(115);

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

	self.arduinoFirmwareVM = new ArduinoFirmwareViewModel();
	
	self.updateStatus = function(data) {
		self.currentDepth(data.depth);
		self.currentTemperature(data.temp);
	}
}
