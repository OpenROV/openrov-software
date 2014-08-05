var fs = require('fs')
  , path = require('path');

var PluginLoader = function() {
  var self = this;

  function getFilter(ext) {
    return function (filename) {
      return filename.match(new RegExp('\\.' + ext + '$', 'i'));
    };
  }

  self.loadPlugins = function(dir, shareDir, deps, callback) {
    var result = {
      assets: [],
      scripts: [],
      styles: [],
      plugins: []
    };
    fs.readdir(dir, function (err, files) {
      if (err) {
        throw err;
      }
      files.filter(function (file) {
        return fs.statSync(path.join(dir, file)).isDirectory();
      }).forEach(function (plugin) {
        console.log('Loading ' + plugin + ' plugin.');
        // Load the backend code
        var pluginInstance = require(path.join(dir, plugin))(plugin, deps);
        result.plugins.push(pluginInstance);

        // Add the public assets to a static route
        if (fs.existsSync(assets = path.join(dir, plugin, 'public'))) {
          result.assets.push({ path: shareDir + '/' + plugin, assets: assets});
        }
        // Add the js to the view
        if (fs.existsSync(js = path.join(assets, 'js'))) {
          fs.readdirSync(js).filter(getFilter('js')).forEach(function (script) {
            result.scripts.push(shareDir + '/' + plugin + '/js/' + script);
          });
        }
        // Add the css to the view
        if (fs.existsSync(css = path.join(assets, 'css'))) {
          fs.readdirSync(css).filter(getFilter('css')).forEach(function (style) {
            result.styles.push(shareDir + '/' + plugin + '/css/' + style);
          });
        }
      });
      callback(result);
    });
  };

  return self;
};
module.exports = PluginLoader;