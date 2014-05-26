var http = require('http'), fs = require('fs'), path = require('path'), CONFIG = require('../lib/config');
var options = { delay: 33 };
var response;
var mockImages = [];
var lastImageIndex = 0;
var formats = [
    'jpg',
    'jpeg'
  ];
var imagePath = path.join(__dirname, '..', 'static', 'mock-images');
var boundary = 'thereMayBeSharks';
function isImage(element, index, array) {
  var ext = element.split('.').pop().toLowerCase();
  return formats.contains(ext);
}
function writeFrame(res, data) {
  // typeof data is Buffer
  res.write('Content-Type: image/jpeg\nContent-Length: ' + data.length + '\n\n');
  res.write(data);
  res.write('\n--' + boundary + '\n');
}
console.log('starting mjpg-streamer compatible video streamer on port: ' + CONFIG.video_port);
http.createServer(function (req, res) {
  if (req.url === '/?action=stream') {
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace;boundary="' + boundary + '"',
      'Connection': 'keep-alive',
      'Expires': 'Fri, 01 Jan 1990 00:00:00 GMT',
      'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      'Pragma': 'no-cache'
    });
    res.write('--' + boundary + '\n');
    res.write('--' + boundary + '\n');
    // after this, start writing the video frames with writeFrame()
    capture(res);
  } else if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<html><body><img src=\'/?action=stream\'></body></html>');
    res.end();
  } else {
    res.writeHead(404);
    res.end();
  }
}).listen(CONFIG.video_port);
function grab() {
  var nextImageIndex = lastImageIndex + 1;
  if (nextImageIndex >= mockImages.length) {
    nextImageIndex = 0;
  }
  var file = path.join(imagePath, mockImages[nextImageIndex]);
  fs.readFile(file, function (err, image) {
    if (err)
      return console.error('error reading file', file, err);
    writeFrame(response, image);
  });
  lastImageIndex = nextImageIndex;
}
function capture(res) {
  var fullpath = imagePath;
  if (!fs.existsSync(fullpath)) {
    console.error('Could not find path: ' + fullpath);
    return;
  }
  mockImages = fs.readdirSync(fullpath);
  if (mockImages) {
    mockImages = mockImages.filter(isImage).sort();
  }
  if (mockImages.length === 0) {
    console.error('Cound\'t find any mock images in path: ' + imagePath);
    return;
  }
  response = res;
  // loop based on delay in milliseconds
  setInterval(grab, options.delay);
}
Array.prototype.contains = function (obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
};
