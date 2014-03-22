(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.define('Transport/Master', function(exports) {
    var Socket, ajax, gameResources, htmlResources, requestGameResource, requestHTMLResource, requestVersion, versions;
    Socket = this.require('Transport/Socket');
    ajax = atom.ajax;
    if (localStorage.versions != null) {
      versions = JSON.parse(localStorage.versions);
    } else {
      versions = {};
    }
    gameResources = ['scene'];
    htmlResources = ['template'];
    requestVersion = function(key, callback) {
      return ajax({
        'method': 'POST',
        'data': "" + key,
        'url': "/version",
        'onLoad': function(actual) {
          return callback(actual);
        }
      });
    };
    requestHTMLResource = function(_arg, callback) {
      var key, name, type;
      key = _arg.key, type = _arg.type, name = _arg.name;
      return ajax({
        'method': 'POST',
        'cache': 'false',
        'data': "" + name,
        'url': "/" + type,
        'onLoad': function(data) {
          localStorage[key] = data;
          return callback(data);
        }
      });
    };
    requestGameResource = function(_arg, callback) {
      var key, name, type;
      key = _arg.key, type = _arg.type, name = _arg.name;
      Socket.listen("" + type, function(data) {
        localStorage[key] = JSON.stringify(data);
        return callback(data);
      });
      return Socket.send("" + type, "" + name);
    };
    return exports.request = function(_arg, callback) {
      var key, name, type;
      type = _arg.type, name = _arg.name;
      key = "" + type + "/" + name;
      return requestVersion(key, function(actual) {
        if (versions[key] !== actual) {
          versions[key] = actual;
          localStorage.versions = JSON.stringify(versions);
          if (__indexOf.call(gameResources, type) >= 0) {
            return requestGameResource({
              key: key,
              type: type,
              name: name
            }, callback);
          } else if (__indexOf.call(htmlResources, type) >= 0) {
            return requestHTMLResource({
              key: key,
              type: type,
              name: name
            }, callback);
          } else {
            return warn('Transport/Master: invalid resource type');
          }
        } else {
          if (__indexOf.call(gameResources, type) >= 0) {
            return callback(JSON.parse(localStorage[key]));
          } else {
            return callback(localStorage[key]);
          }
        }
      });
    };
  });

}).call(this);
