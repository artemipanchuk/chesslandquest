(function() {
  var FS, ScenesManager, UT, byLine, bySection, bySpace, cached, locations, parse;

  module.paths = module.parent.paths;

  FS = require('fs');

  UT = require('utility');

  locations = ['field'];

  cached = {};

  byLine = /\n/g;

  bySection = /#.*\n/g;

  bySpace = /\s+/g;

  parse = function(content) {
    var line, markers, matrix, npcs, objects, sections, y, _fn, _fn1, _fn2, _fn3, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    sections = content.split(bySection).filter(function(section) {
      return section.length !== 0;
    });
    matrix = [];
    objects = [];
    markers = {};
    npcs = [];
    _ref = sections[0].split(byLine);
    _fn = function() {
      if (!line.length) {
        return;
      }
      return matrix[y] = line.split('');
    };
    for (y = _i = 0, _len = _ref.length; _i < _len; y = ++_i) {
      line = _ref[y];
      _fn();
    }
    _ref1 = sections[1].split(byLine);
    _fn1 = function() {
      var height, name, object, width, x, _ref2;
      if (!line.length) {
        return;
      }
      _ref2 = line.split(bySpace), name = _ref2[0], x = _ref2[1], y = _ref2[2], width = _ref2[3], height = _ref2[4];
      object = {
        name: name,
        x: parseInt(x),
        y: parseInt(y)
      };
      if (width && height) {
        object.width = parseInt(width);
        object.height = parseInt(height);
      }
      return objects.push(object);
    };
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      line = _ref1[_j];
      _fn1();
    }
    _ref2 = sections[2].split(byLine);
    _fn2 = function() {
      var marker, type, x, _ref3;
      if (!line.length) {
        return;
      }
      _ref3 = line.split(bySpace), type = _ref3[0], x = _ref3[1], y = _ref3[2];
      marker = {
        x: (parseInt(x)) * 50,
        y: (parseInt(y)) * 50
      };
      return markers[type] = marker;
    };
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      line = _ref2[_k];
      _fn2();
    }
    _ref3 = sections[3].split(byLine);
    _fn3 = function() {
      var from, name, rank, to, x, _ref4;
      if (!line.length) {
        return;
      }
      _ref4 = line.split(bySpace), rank = _ref4[0], name = _ref4[1], from = _ref4[2], to = _ref4[3], x = _ref4[4], y = _ref4[5];
      return npcs.push({
        rank: rank,
        name: name,
        from: parseInt(from),
        to: parseInt(to),
        x: (parseInt(x)) * 50,
        y: (parseInt(y)) * 50
      });
    };
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      line = _ref3[_l];
      _fn3();
    }
    return {
      'public': {
        matrix: matrix,
        objects: objects,
        markers: markers
      },
      'private': {
        npcs: npcs
      }
    };
  };

  ScenesManager = {
    getLocationsList: function() {
      return locations;
    },
    getGlobalScene: function(name, callback) {
      var path;
      path = "server/data/scenes/global/" + name;
      return UT.version(path, function(version) {
        var location;
        if ((!(location = cached[name])) || location.version !== version) {
          return FS.readFile(path, 'utf8', function(error, content) {
            var data;
            data = parse(content);
            location = cached[name] = {
              internal: data["private"],
              exports: data["public"],
              version: version
            };
            return callback(location);
          });
        } else {
          return callback(location);
        }
      });
    },
    getBattleScene: function(_arg, callback) {
      var matrix, objects, size;
      size = _arg.size;
      objects = [];
      matrix = [];
      size += 2;
      size.times(function(x) {
        var _ref;
        if ((_ref = matrix[x]) == null) {
          matrix[x] = [];
        }
        return size.times(function(y) {
          if (y < 1 || x < 1 || y > size - 2 || x > size - 2) {
            return matrix[x][y] = 'i';
          } else {
            return matrix[x][y] = (x + y) % 2 === 0 ? 'd' : 'l';
          }
        });
      });
      return callback({
        matrix: matrix,
        objects: objects
      });
    },
    getVersion: function(name, callback) {
      var path;
      path = "server/data/scenes/global/" + name;
      return UT.version(path, function(actual) {
        return callback(actual);
      });
    }
  };

  module.exports = ScenesManager;

}).call(this);
