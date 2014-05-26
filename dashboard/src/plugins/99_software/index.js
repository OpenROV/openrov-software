var dpkg = new require('../../lib/dpkg')(), Sync = require('sync'), express = require('express'), upload = require('jquery-file-upload-middleware');
function software(name, deps) {
  var packages = {};
  function packageJoin(callback) {
    packages.join(function (items) {
      callback(null, items);
    });
  }
  var uploadDir = '/opt/openrov/softwarepackages';
  // configure upload middleware
  upload.configure({
    uploadDir: uploadDir,
    uploadUrl: '/software/upload'
  });
  upload.on('begin', function (fileInfo) {
    // we don't want safe names - override existing files!
    if (fileInfo.name != fileInfo.originalName) {
      fileInfo.name = fileInfo.originalName;
    }
  });
  upload.on('end', function (fileInfo) {
    dpkg.install(uploadDir + '/' + fileInfo.name);
  });
  dpkg.on('software-install-status', function (status) {
    deps.socket.emit('software-install-status', status);
  });
  deps.app.configure(function () {
    deps.app.use('/software/upload', upload.fileHandler());
    deps.app.use(express.bodyParser());
  });
  deps.app.get('/software/packages', function (req, res) {
    packages = dpkg.packages();
    res.send(packageJoin.sync(null));
    return true;
  }.asyncMiddleware());
}
module.exports = software;