(function() {
  var Scenes, Units, create, exports, npcs, rand;

  module.paths = module.parent.paths;

  Scenes = require('game_scenes');

  Units = require('game_units');

  npcs = {};

  rand = function(n) {
    return Math.round(Math.random() * n);
  };

  create = {
    first: function(_arg, callback) {
      var army, character, exact, from, name, point, to, x, y;
      name = _arg.name, from = _arg.from, to = _arg.to, x = _arg.x, y = _arg.y;
      exact = from + rand(to - from);
      point = {
        x: x,
        y: y
      };
      army = [];
      exact.times(function(i) {
        return army.push('private');
      });
      character = {
        name: name,
        army: army,
        point: point
      };
      npcs[name] = {
        character: character,
        creational: arguments[0]
      };
      return callback(character);
    }
  };

  exports = {
    generate: function(callback) {
      var location, locations, _i, _len, _results;
      locations = Scenes.getLocationsList();
      _results = [];
      for (_i = 0, _len = locations.length; _i < _len; _i++) {
        location = locations[_i];
        _results.push((function() {
          return Scenes.getGlobalScene(location, function(_arg) {
            var internal, npc, _j, _len1, _ref, _results1;
            internal = _arg.internal;
            _ref = internal.npcs;
            _results1 = [];
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              npc = _ref[_j];
              _results1.push((function() {
                return create[npc.rank](npc, function(created) {
                  created.location = location;
                  return callback(created);
                });
              })());
            }
            return _results1;
          });
        })());
      }
      return _results;
    },
    kill: function(name, callback) {
      return create(npcs[name].creational, function(created) {
        return callback(created);
      });
    },
    get: function(name, property) {
      var _ref;
      if (property) {
        return ((_ref = npcs[name].character) != null ? _ref[property] : void 0) || null;
      } else {
        return npcs[name].character || null;
      }
    }
  };

  module.exports = exports;

}).call(this);
