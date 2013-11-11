(function (window, $, undefined) {
    'use strict';

    var Arduinofirmwareupload;

    Arduinofirmwareupload = function Arduinofirmwareupload(cockpit) {
        console.log("Loading Arduinofirmwareupload plugin in the browser.");

        // Instance variables
        this.cockpit = cockpit;

        // Add required UI elements
	$("#settings H4:contains('Runtime Settings:')").append(
          '<div class="settings-block"> \
            <h4>Upload firmware</h4> \
            <div class="control-group"> \
              Arduino firmware: \
              <label> \
                <!--input id="arduinoFirmware" type="file"--> \
              </label> \
              <div class="alert alert-error" id="arduinoFirmware-error" data-bind="css: { hide: arduinoFirmwareVM.selectedFileName() === "" || arduinoFirmwareVM.isValidFirmwareFile() }"> \
                <button type="button" class="close" data-dismiss="alert">x</button> \
                <strong>Oh snap!</strong> Only <i>.zip</i>, <i>.tar.gz</i> and <i>.ino</i> files are supported! \
              </div> \
              <div class="alert alert-error" id="file-upload-notsupported" data-bind="css: { hide: ! arduinoFirmwareVM.browserDoesSupportFileApi() }"> \
                <button type="button" class="close" data-dismiss="alert">x</button> \
                <strong>Oh snap!</strong> Your browser doesn\'t support the file upload API! \
              </div> \
\
              <button href="#firmware-upload-dialog" class="btn btn-small" type="button" id="arduinoFirmware-upload" data-bind="css: { \'btn-success\': arduinoFirmwareVM.isValidFirmwareFile() == false,  \'btn-success\': arduinoFirmwareVM.isValidFirmwareFile() }" data-toggle="modal"> \
	      <i class="icon-upload icon-white"></i> Upload firmware from SD card to Arduino</button> \
            </div>');
	
	$("#diagnostic").append(
	'        <!-- Firmware upload --> \
        <div class="modal fade" id="firmware-upload-dialog"> \
          <div class="modal-header"> \
            <h3>Upload Arduino Firmware</h3> \
          </div> \
          <div class="modal-body"> \
            <strong>Filename: </strong><span data-bind="text: arduinoFirmwareVM.selectedFileName"></span> \
            <br> \
            <hr> \
            <div class="progress-step"> \
              <p>Overall progress:</p> \
              <div class="progress progress-striped progress-success active"> \
                <div class="bar" style="width: 0%;" data-bind="style: { width: arduinoFirmwareVM.overallPercentage() + '%' }"></div> \
              </div> \
            </div> \
            <div class="progress-step"> \
              <p>File upload:</p> \
              <div class="progress progress-striped active"> \
                <div class="bar" style="width: 0%;" data-bind="style: { width: arduinoFirmwareVM.uploadPercentage() + '%' }"></div> \
              </div> \
              <ul class="unstyled"> \
                <li data-bind="css: { muted: ! arduinoFirmwareVM.unpacking() }">Unpacking <i class="icon-fire" data-bind="visible: arduinoFirmwareVM.unpacking() && ! arduinoFirmwareVM.unpacked() "></i><i class="icon-ok" data-bind="visible: arduinoFirmwareVM.unpacked"></i> \
	<i class="icon-warning-sign" data-bind="visible: arduinoFirmwareVM.unpacking() && ! arduinoFirmwareVM.unpacked() && arduinoFirmwareVM.failed()"></i></li> \
                <li data-bind="css: { muted: ! arduinoFirmwareVM.compiling() }">Compiling <i class="icon-fire" data-bind="visible: arduinoFirmwareVM.compiling() && ! arduinoFirmwareVM.compiled()"></i><i class="icon-ok" data-bind="visible: arduinoFirmwareVM.compiled"></i> \
		<i class="icon-warning-sign" data-bind="visible: arduinoFirmwareVM.compiling() && ! arduinoFirmwareVM.compiled() && arduinoFirmwareVM.failed()"></i></li> \
                <li data-bind="css: { muted: ! arduinoFirmwareVM.arduinoUploading() }">Upload to Arduino <i class="icon-fire" data-bind="visible: arduinoFirmwareVM.arduinoUploading() && ! arduinoFirmwareVM.arduinoUploaded()"></i> \
		<i class="icon-ok" data-bind="visible: arduinoFirmwareVM.arduinoUploaded"></i><i class="icon-warning-sign" data-bind="visible: arduinoFirmwareVM.arduinoUploading() && ! arduinoFirmwareVM.arduinoUploaded() && arduinoFirmwareVM.failed()"></i></li>              </ul> \
            </div> \
            <div class="progress-step"> \
              <a href="#" class="btn" id="arduinoFirmware-showdetails" data-bind="css: { disabled: ! arduinoFirmwareVM.inProgress() }">Show details</a> \
              <div class="collapse" data-bind="css: { collapse: !arduinoFirmwareVM.detailsVisible() }"> \
                <textarea id="arduiniFirmware-details" readonly="readonly" data-bind="text: arduinoFirmwareVM.details"></textarea> \
              </div> \
            </div> \
          </div> \
          <div class="modal-footer"> \
            <a href="#" class="btn" data-toggle="modal" data-target="#firmware-upload-dialog" data-bind="css: { disabled: arduinoFirmwareVM.inProgress() }, visible: ! arduinoFirmwareVM.arduinoUploaded()">Cancel</a> \
            <a href="#" class="btn btn-primary" id="arduinoFirmware-startupload" data-bind="visible: ! arduinoFirmwareVM.arduinoUploaded()">Apply new firmware</a> \
            <a href="#" class="btn btn-primary" id="arduinoFirmware-closeupload" data-toggle="modal" data-target="#firmware-upload-dialog" data-bind="visible: arduinoFirmwareVM.arduinoUploaded() || arduinoFirmwareVM.failed()">Close</a> \
          </div> \
        </div>');

            /* ------------------------------------------
               firmware upload 
            */
            var selectedFile;
            var fileReader = new FileReader();
            $('#arduinoFirmware').live('change', function(evnt){ 
              selectedFile = evnt.target.files[0];
              viewmodel.arduinoFirmwareVM.selectedFile(selectedFile);
            });
            $("#arduinoFirmware-startupload").click(function() {
              fileReader.onload = function(evnt) {
                console.log("Upload event: " + selectedFile.name)
                socket.emit('arduinofirmware-upload', { 'filename' : selectedFile.name, data : evnt.target.result });                
              }
              if (!selectedFile) {
                selectedFile = new Object(); 
                selectedFile.name = 'fromSource';
                socket.emit('arduinofirmware-uploadfromsource');
              }
              console.log("Starting upload: " + selectedFile.name)
              socket.emit('arduinofirmware-startupload', { 'filename' : selectedFile.name, 'size' : selectedFile.size });
	      selectedFile = null;
            });
            $('#arduinoFirmware-closeupload').click(function() {
              viewmodel.arduinoFirmwareVM.reset();
              //$('#firmware-upload-dialog').modal('hide');
            });
            $('#arduinoFirmware-showdetails').click(function() {
              viewmodel.arduinoFirmwareVM.toggleDetails();
            });

            viewmodel.arduinoFirmwareVM.details.subscribe(function(data) { 
              $('#arduiniFirmware-details').scrollTop($('#arduiniFirmware-details')[0].scrollHeight);
            });
	    
	    socket.on('arduinofirmware-requestmoredata', function (data){
               viewmodel.arduinoFirmwareVM.uploadPercentage(data['Percent']);
               var Place = data['Place'] * 524288; //The Next Blocks Starting Position
               var NewFile; //The Variable that will hold the new Block of Data
	       if (selectedFile.slice != undefined)
	       {
                 NewFile = selectedFile.slice(Place, Place + Math.min(524288, (selectedFile.size-Place)));
               }
	       else if (selectedFile.webkitSlice != undefined)
 	       {
                 NewFile = selectedFile.webkitSlice(Place, Place + Math.min(524288, (selectedFile.size-Place)));
               }



               fileReader.readAsBinaryString(NewFile);
            });

            socket.on('arduinofirmware-uploaddone', function(data){
              viewmodel.arduinoFirmwareVM.uploaded(true);
              viewmodel.arduinoFirmwareVM.uploadPercentage(100);
            });

            socket.on('arduinoFirmware-status', function(data){
              viewmodel.arduinoFirmwareVM.updateStatus(data);
            });

            socket.on('arduinoFirmware-output', function(data){
              viewmodel.arduinoFirmwareVM.logOutput(data);
            });
	
        // Register the various event handlers
        this.listen();
        
    };
    
    //This pattern will hook events in the cockpit and pull them all back
    //so that the reference to this instance is available for further processing
    Arduinofirmwareupload.prototype.listen = function listen() {
        var arduinofirmware = this;
        $("#diagnostic .back-button").click(function (){
            arduinofirmware.SaveSettings();
        });
        this.cockpit.socket.on('settings', function(data) {
            arduinofirmware.LoadSettings(data);
        });

    };
    

    
    Arduinofirmwareupload.prototype.LoadSettings = function LoadSettings(settings){
    };
    
    Arduinofirmwareupload.prototype.SaveSettings = function SaveSettings(){	  
    };

    window.Cockpit.plugins.push(Arduinofirmwareupload);

}(window, jQuery));
