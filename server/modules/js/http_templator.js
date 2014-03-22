(function() {
  var FS, UT, cached;

  module.paths = module.parent.paths;

  FS = require('fs');

  UT = require('utility');

  cached = {};

  module.exports = {
    get: function(name, callback) {
      var path;
      path = "client/templates/" + name;
      return UT.version(path, function(actual) {
        var template;
        if (!actual) {
          callback(false);
          return;
        }
        if ((!(template = cached[name])) || template.version !== actual) {
          return FS.readFile(path, 'utf8', function(error, content) {
            if (error) {
              callback(false);
              return;
            }
            callback(content);
            return cached[name] = {
              version: actual,
              content: content
            };
          });
        } else {
          return callback(template.content);
        }
      });
    },
    getVersion: function(name, callback) {
      var path;
      path = "client/templates/" + name;
      return UT.version(path, function(actual) {
        if (!actual) {
          callback(false);
          return;
        }
        return callback(actual);
      });
    }
  };

}).call(this);
