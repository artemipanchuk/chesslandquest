(function() {
  var Colors, Crypto, Fs, Utility, responseFile;

  module.paths = module.parent.paths;

  Crypto = require('crypto');

  Fs = require('fs');

  Colors = require('colors');

  Colors.setTheme({
    'positive': 'green',
    'ordinary': 'yellow',
    'critical': 'red'
  });

  global.log = function(message, code, error) {
    var actualTime, f, space;
    f = function(value) {
      return value < 10 && ("0" + value) || ("" + value);
    };
    actualTime = function(d) {
      var date, time;
      if (d == null) {
        d = new Date;
      }
      date = "" + (f(d.getMonth() + 1)) + "/" + (f(d.getDate())) + "/" + (d.getFullYear());
      time = "" + (f(d.getHours())) + ":" + (f(d.getMinutes())) + ":" + (f(d.getSeconds()));
      return "" + date + " " + time;
    };
    space = function() {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(function() {
        return ' ';
      }).join('');
    };
    if (typeof code !== 'undefined') {
      console.log("|" + (actualTime()[code]) + "| " + message[code]);
      if (error) {
        return console.log("|" + (space()) + "| " + (error.toString()[code]));
      }
    } else {
      return console.log("|" + (actualTime()) + "| " + message);
    }
  };

  global.rlog = function(data) {
    return console.log(data);
  };

  Number.prototype.times = function(iterator) {
    var i, _i, _results;
    _results = [];
    for (i = _i = 0; 0 <= this ? _i < this : _i > this; i = 0 <= this ? ++_i : --_i) {
      _results.push(iterator(i));
    }
    return _results;
  };

  global.clone = function(x) {
    return JSON.parse(JSON.stringify(x));
  };

  global.summary = function(object) {
    return Object.keys(object).length;
  };

  Function.prototype.get = function(property, callback) {
    return this.prototype.__defineGetter__(property, callback);
  };

  Function.prototype.set = function(property, callback) {
    return this.prototype.__defineSetter__(property, callback);
  };

  responseFile = function(path, response) {
    return Fs.readFile(path, function(error, data) {
      if (error) {
        log("Error reading file: " + path, 'ordinary');
        return;
      }
      return response.end(data);
    });
  };

  Utility = {
    responseFile: function(path, response) {
      return responseFile(path, response);
    },
    responseText: function(text, response) {
      return response.end(text);
    },
    responseResource: function(path, request, response) {
      return Fs.stat(path, function(error, stats) {
        var clientTime, modified;
        if (error) {
          response.writeHead(302, {
            'location': '/404'
          });
          response.end();
          log("HTTP: Unknown resource — " + path, 'ordinary');
          return;
        }
        modified = true;
        try {
          clientTime = new Date(request.headers['if-modified-since']);
          response.setHeader('last-modified', stats.mtime);
          if (clientTime >= stats.mtime) {
            modified = false;
          }
        } catch (exception) {
          log(exception);
        }
        if (modified) {
          response.statusCode = 200;
          response.setHeader('last-modified', stats.mtime);
          return responseFile(path, response);
        } else {
          response.statusCode = 304;
          return response.end();
        }
      });
    },
    encrypt: function(data) {
      return Crypto.createHash('sha1').update(data).digest('hex');
    },
    generateID: function() {
      return this.encrypt(new Date + Math.random());
    },
    version: function(path, callback) {
      var _this = this;
      return Fs.stat(path, function(error, stats) {
        if (error) {
          callback(false);
          return;
        }
        return callback(_this.encrypt(stats.mtime.toString()));
      });
    },
    hash: function(data, key) {
      return Crypto.createHmac('sha1', key).update(data).digest('hex');
    }
  };

  module.exports = Utility;

}).call(this);
