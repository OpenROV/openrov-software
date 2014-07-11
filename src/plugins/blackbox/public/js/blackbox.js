(function (window, document) {
  'use strict';
  /*
         * Constructuor
         */
  var telemetry = [];
  var server;
  var idb;
  var exportData = function (e) {
    //block click before ready
    if (!idb)
      return;
    e.preventDefault();
    var link = $('#exportLink');
    //Ok, so we begin by creating the root object:
    var data = {};
    var promises = [];
    for (var i = 0; i < idb.objectStoreNames.length; i++) {
      //thanks to http://msdn.microsoft.com/en-us/magazine/gg723713.aspx
      promises.push($.Deferred(function (defer) {
        var objectstore = idb.objectStoreNames[i];
        console.log(objectstore);
        var transaction = idb.transaction([objectstore], 'readonly');
        var content = [];
        transaction.oncomplete = function (event) {
          console.log('trans oncomplete for ' + objectstore + ' with ' + content.length + ' items');
          defer.resolve({
            name: objectstore,
            data: content
          });
        };
        transaction.onerror = function (event) {
          // Don't forget to handle errors!
          console.dir(event);
        };
        var handleResult = function (event) {
          var cursor = event.target.result;
          if (cursor) {
            //content.push({key:cursor.key,value:cursor.value});
            content.push(cursor.value);
            //the key is in the object so flatten the array out
            cursor.continue();
          }
        };
        var objectStore = transaction.objectStore(objectstore);
        objectStore.openCursor().onsuccess = handleResult;
      }).promise());
    }
    $.when.apply(null, promises).then(function (result) {
      //arguments is an array of structs where name=objectstorename and data=array of crap
      //make a copy cuz I just don't like calling it argument
      var dataToStore = arguments;
      //serialize it
      var serializedData = JSON.stringify(dataToStore);
      //The Christian Cantrell solution
      //document.location = 'data:Application/octet-stream,' + encodeURIComponent(serializedData);
      var blob = new Blob([serializedData], { 'type': 'application/octet-stream' });
      link.attr('href', window.URL.createObjectURL(blob));
      //link.attr("href",'data:Application/octet-stream,'+encodeURIComponent(serializedData));
      //link.trigger("click");
      fakeClick(link[0]);
    });
  };
  function fakeClick(anchorObj) {
    if (anchorObj.click) {
      anchorObj.click();
    } else if (document.createEvent) {
      if (event.target !== anchorObj) {
        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var allowDefault = anchorObj.dispatchEvent(evt);  // you can check allowDefault for false to see if
                                                          // any handler called evt.preventDefault().
                                                          // Firefox will *not* redirect to anchorObj.href
                                                          // for you. However every other browser will.
      }
    }
  }
  var Blackbox = function Blackbox(cockpit) {
    console.log('Loading Blackbox plugin.');
    this.cockpit = cockpit;
    this.recording = false;
    var blackbox = this;
    // add required UI elements
    $('#buttonPanel').append('<span id="blackboxstatus" class="false pull-right"></span>');
    $('#buttonPanel').append('<button id="exportButton" class="btn pull-right disabled">Download Data</button><a id="exportLink" download="data.json"></a>');
    $('#keyboardInstructions').append('<p><i>r</i> to toggle recording of telemetry</p>');
    $('#exportButton').click(exportData);
    this.cockpit.socket.on('navdata', function (data) {
      if (!jQuery.isEmptyObject(data)) {
        blackbox.logNavData(data);
      }
    });
    this.cockpit.socket.on('status', function (data) {
      if (!jQuery.isEmptyObject(data)) {
        blackbox.logStatusData(data);
      }
    });
  };
  /*
         * Register keyboard event listener
         */
  Blackbox.prototype.listen = function listen() {
    var self = this;

    self.cockpit.emit('inputController.register',
      {
        name: "blackbox.record",
        description: "Start recording telemetry data.",
        defaults: { keyboard: 'r' },
        down: function() { self.keyDown();  }
      });
    };

  var refreshintervalID;
  //	var server;
  //	var telemetry = [];
  Blackbox.prototype.toggleRecording = function toggleRecording() {
    console.log('Recording = ' + this.recording);
    if (!this.recording) {
      console.log('Recording Telemetry');
      $('#blackboxstatus').toggleClass('false true');
      $('#exportButton').toggleClass('disabled enabled');
      var blackbox = this;
      refreshintervalID = self.setInterval(blackbox.logTelemetryData, 1000);
    } else {
      console.log('Stopping Telemetry');
      $('#blackboxstatus').toggleClass('true false');
      $('#exportButton').toggleClass('enabled disabled');
      clearInterval(refreshintervalID);
    }
    this.recording = !this.recording;
  };
  Blackbox.prototype.test = function () {
    console.log('tteesstt');
    blackbox.logTelemetryData();
  };
  /*
         * Process onkeydown.
         */
  Blackbox.prototype.keyDown = function keyDown(ev) {
    if (!this.recording) {
      this.openDB(this.toggleRecording());
    } else {
      this.closeDB(this.toggleRecording());
    }
  };
  Blackbox.prototype.logNavData = function logNavData(navdata) {
    if (!this.recording) {
      return;
    }
    navdata.timestamp = new Date().getTime();
    server.navdata.add(navdata).done(function (item) {
      console.log('saved');
    });
  };
  Blackbox.prototype.logTelemetryData = function logTelemetryData() {
    var clone = {};
    for (var i in telemetry) {
      clone[i] = telemetry[i];
    }
    clone.timestamp = new Date().getTime();
    server.telemetry.add(clone).done(function (item) {
      console.log('saved telemetry');
    }).fail(function (a, x) {
      console.log(x);
    });
  };
  Blackbox.prototype.logStatusData = function logStatusData(data) {
    if (!this.recording) {
      return;
    }
    for (var i in data) {
      telemetry[i] = data[i];
    }
  };
  Blackbox.prototype.openDB = function openDB(callback) {
    db.open({
      server: 'openrov-blackbox',
      version: 1,
      schema: {
        navdata: {
          key: {
            keyPath: 'timestamp',
            autoIncrement: false
          },
          indexes: {}
        },
        telemetry: {
          key: {
            keyPath: 'timestamp',
            autoIncrement: false
          }
        }
      }
    }).done(function (s) {
      server = s;
      idb = server.db();
      callback();
    });
  };
  Blackbox.prototype.closeDB = function closeDB(callback) {
    server.close();
    callback();
  };
  window.Cockpit.plugins.push(Blackbox);
}(window, document));
