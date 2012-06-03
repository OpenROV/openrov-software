
var serialPort = require('serialport').SerialPort
var command = process.argv[2] + ',' + process.argv[3] + ',' + process.argv[4] + ';';
console.log(command);
var serial;
if(process.env.NODE_ENV == 'production') {
  serial = new serialPort('/dev/ttyUSB0', { baud: 9600 }) // Arduino Duemilanove
  serial.write(command);
}

var stdin = process.openStdin();
stdin.on('keypress', function (chunk, key) {
  // process.stdout.write('Get Chunk: ' + chunk + '\n');
  if (key && key.ctrl && key.name == 'c') process.exit();
});
