var SerialPort = require('serialport').SerialPort;
var fs = require('fs');

var Avrdude = function(){
  var controller = {};
  pageBytes = 128;



  controller.avrUploader = function(bytes, tty, cb) {
    var done, next, offset, reply, serial, state, states, timer;
  
    serial = new SerialPort(tty, {
      baudrate: 115200
    });
    done = function(err) {
      return serial.close(function() {
        return cb(err);
      });
    };
    timer = null;
    state = offset = 0;
    reply = '';
    states = [
      function() {
        return ['0 '];
      }, function() {
        var buf;
  
        buf = new Buffer(20);
        buf.fill(0);
        buf.writeInt16BE(pageBytes, 12);
        return ['B', buf, ' '];
      }, function() {
        return ['P '];
      }, function() {
        var buf;
  
        if (offset >= bytes.length) {
          state += 1;
        }
        buf = new Buffer(2);
        buf.writeInt16LE(offset >> 1, 0);
        return ['U', buf, ' '];
      }, function() {
        var buf, count, pos;
  
        state -= 2;
        count = Math.min(bytes.length - offset, pageBytes);
        buf = new Buffer(2);
        buf.writeInt16BE(count, 0);
        pos = offset;
        offset += count;
        return ['d', buf, 'F', bytes.slice(pos, offset), ' '];
      }, function() {
        return ['Q '];
      }
    ];
    next = function() {
      var x, _i, _len, _ref;
  
      if (state < states.length) {
        _ref = states[state++]();
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          serial.write(x);
        }
        serial.flush();
        reply = '';
        return timer = setTimeout((function() {
          return done(state);
        }), 300);
      } else {
        return done();
      }
    };
    serial.on('open', next);
    serial.on('error', done);
    return serial.on('data', function(data) {
      reply += data;
      if (reply.slice(-2) === '\x14\x10') {
        clearTimeout(timer);
        return next();
      }
    });
  };

  controller.firmwareuploader= function(firmwarefile){
    var hex, hexToBin;
    var device = '/dev/ttyO1';

    
    
    hex = fs.readFileSync(firmwarefile, 'ascii');
    
    hexToBin = function(code) {
      var count, data, line, _i, _len, _ref;
    
      data = '';
      _ref = code.split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        count = parseInt(line.slice(1, 3), 16);
        if (count && line.slice(7, 9) === '00') {
          data += line.slice(9, 9 + 2 * count);
        }
      }
      return new Buffer(data, 'hex');
    };
    
    this.avrUploader(hexToBin(hex), device, function(err) {
      if (err) {
        console.error('err', err);
      }
      return console.log(hexToBin(hex).length);
    });
  };
  return controller;
};
module.exports = Avrdude;