/*
 * Created for OpenROV:  www.openrov.com
 * Author:  Simon Murtha-Smith, Bran Sorem
 * Date: 06/03/12
 *
 * Description:
 * This file contains the controller for uplading new arduino firmware
 *
 * License
 * This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send a
 * letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
 */

var CONFIG = require('./config')
  , FirmwareInstaller = require('../' + CONFIG.FirmwareInstaller)
  , logger = require('./logger').create(CONFIG.debug)
  , path = require('path')
  , fs = require('fs');



var OpenROVArduinoFirmwareController = function() {
  
  var tempDirectory = "temp/";
  var controller = { socket: null };
  controller.files = {};
  controller.installer = new FirmwareInstaller();

  controller.initializeSocket = function(socket) {

    controller.socket = socket;

    if (!path.existsSync(tempDirectory)) fs.mkdirSync(tempDirectory, 0755);

    socket.on('arduinofirmware-startupload', function (data) { //data contains the variables that we passed through in the html file
      
          var Name = data['filename'];
          console.log("Received 'arduinofirmware-startupload' for file: " + Name)
          controller.files[Name] = {  //Create a new Entry in The Files Variable
             FileSize : data['size'],
             Data   : "",
             Downloaded : 0
          }
          console.log("file: " + controller.files[Name].name)
          var Place = 0;
          try{
             var Stat = fs.statSync(tempDirectory +  Name);
             if(Stat.isFile())
             {
                controller.files[Name]['Downloaded'] = Stat.size;
                Place = Stat.size / 524288;
             }
          }
          catch(er){} //It's a New File
          fs.open(tempDirectory + Name, "a", 0755, function(err, fd){
             if(err)
             {
                console.log(err);
             }
             else
             {
                controller.files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
                socket.emit('arduinofirmware-requestmoredata', { 'Place' : Place, Percent : 0 });
             }
          });
    });

  socket.on('arduinofirmware-upload', function (data){
        var Name = data['filename'];
        controller.files[Name]['Downloaded'] += data['data'].length;
        controller.files[Name]['Data'] += data['data'];
        if(controller.files[Name]['Downloaded'] == controller.files[Name]['FileSize']) //If File is Fully Uploaded
        {
           fs.write(controller.files[Name]['Handler'], controller.files[Name]['Data'], null, 'Binary', function(err, Writen){
              socket.emit('arduinofirmware-uploaddone', { });
              controller.handleUploadedFile(socket, Name);
           });
        }
        else if(controller.files[Name]['Data'].length > 10485760){ //If the Data Buffer reaches 10MB
           fs.write(controller.files[Name]['Handler'], controller.files[Name]['Data'], null, 'Binary', function(err, Writen){
              controller.files[Name]['Data'] = ""; //Reset The Buffer
              var Place = controller.files[Name]['Downloaded'] / 524288;
              var Percent = (controller.files[Name]['Downloaded'] / controller.files[Name]['FileSize']) * 100;
              socket.emit('arduinofirmware-requestmoredata', { 'Place' : Place, 'Percent' :  Percent});
              console.log("Sent 'arduinofirmware-requestmoredata' Percent: " + Percent);
           });
        }
        else
        {
           var Place = controller.files[Name]['Downloaded'] / 524288;
           var Percent = (controller.files[Name]['Downloaded'] / controller.files[Name]['FileSize']) * 100;
           socket.emit('arduinofirmware-requestmoredata', { 'Place' : Place, 'Percent' :  Percent});
           console.log("Sent 'arduinofirmware-requestmoredata' Percent: " + Percent);
        }
     });

  }

  controller.installer.on('firmwareinstaller-unpacking',
    function()  {
      controller.socket.emit("arduinoFirmware-status", { key : "unpacking", value : "true" });
    });

  controller.installer.on('firmwareinstaller-unpacked',
    function(directory) {
      logger.log('Unpacked firmware file into ' + directory);
      controller.socket.emit("arduinoFirmware-status", { key : "unpacked", value : "true" });
      controller.socket.emit("arduinoFirmware-status", { key : "compiling", value : "true" });
      //controller.installer.compile(directory);
    });

  controller.installer.on('firmwareinstaller-compilled',
    function(directory) {
      logger.log('Compiled firmware in directory ' + directory);
      controller.socket.emit("arduinoFirmware-status", { key : "compiled", value : "true" });
      controller.socket.emit("arduinoFirmware-status", { key : "arduinoUploading", value : "true" });
      //controller.installer.upload(directory);
    });

  controller.installer.on('firmwareinstaller-uploaded', 
    function(directory) {
      logger.log('Uploaded firmware to arduino!' + directory);
      controller.socket.emit("arduinoFirmware-status", { key : "compiled", value : "true" });
      controller.socket.emit("arduinoFirmware-status", { key : "arduinoUploaded", value : "true" });
    });

  controller.handleUploadedFile = function(socket, filename) {
    logger.log("going to install the uploaded file: " + filename);
    // controller.installer.unpack(filename);
    controller.installer.install(file);
  }

  return controller;
}

module.exports = OpenROVArduinoFirmwareController;
