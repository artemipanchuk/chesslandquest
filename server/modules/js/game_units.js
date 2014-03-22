(function() {
  var FS, PC, UT, UnitsMaster, byLine, bySection, bySpace, cached, calculateDelta, calculateDeltaVector, calculateUnitActions, count, get, have, keys, parse, units;

  module.paths = module.parent.paths;

  PC = require('game_pc');

  FS = require('fs');

  UT = require('utility');

  cached = {};

  keys = {};

  units = ['private', 'corporal', 'sergeant', 'sergeant-major', 'second-lieutenant', 'lieutenant', 'captain', 'major', 'colonel', 'brigadier'];

  count = units.length;

  byLine = /\n/g;

  bySection = /#.*\n/g;

  bySpace = /\s+/g;

  parse = function(content) {
    var attack, direction, limit, line, move, plain, property, sections, stats, value, x, y, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    sections = content.split(bySection).filter(function(section) {
      return section.length !== 0;
    });
    stats = {};
    move = {};
    attack = {};
    plain = [];
    _ref = sections[0].split(byLine);
    for (y = _i = 0, _len = _ref.length; _i < _len; y = ++_i) {
      line = _ref[y];
      if (!line.length) {
        continue;
      }
      _ref1 = line.split(bySpace), property = _ref1[0], value = _ref1[1];
      stats[property] = (parseInt(value)) || value;
    }
    _ref2 = sections[1].split(byLine);
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      line = _ref2[_j];
      if (!line.length) {
        continue;
      }
      _ref3 = line.split(bySpace), direction = _ref3[0], limit = _ref3[1];
      limit = parseInt(limit);
      move[direction] = limit;
    }
    _ref4 = sections[2].split(byLine);
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      line = _ref4[_k];
      if (!line.length) {
        continue;
      }
      _ref5 = line.split(bySpace), direction = _ref5[0], limit = _ref5[1];
      limit = parseInt(limit);
      attack[direction] = limit;
    }
    if (sections[3] != null) {
      _ref6 = sections[3].split(byLine);
      for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
        line = _ref6[_l];
        if (!line.length) {
          continue;
        }
        _ref7 = line.split(bySpace), x = _ref7[0], y = _ref7[1];
        plain.push([parseInt(x), parseInt(y)]);
      }
    }
    return {
      stats: stats,
      move: move,
      attack: attack,
      plain: plain
    };
  };

  get = function(rank, callback) {
    var path;
    path = "server/data/units/" + rank;
    return UT.version(path, function(version) {
      var exports;
      if ((!(exports = cached[rank])) || keys[rank] !== version) {
        return FS.readFile(path, 'utf8', function(error, content) {
          cached[rank] = exports = parse(content);
          calculateUnitActions(rank, exports);
          return callback(rank, exports);
        });
      } else {
        return callback(rank, exports);
      }
    });
  };

  calculateUnitActions = function(rank, imports) {
    var action, direction, i, limit, turnsₐ, _i, _j, _len, _ref, _ref1, _results;
    _ref = ['move', 'attack'];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      action = _ref[_i];
      turnsₐ = [];
      _ref1 = imports[action];
      for (direction in _ref1) {
        limit = _ref1[direction];
        for (i = _j = 1; 1 <= limit ? _j <= limit : _j >= limit; i = 1 <= limit ? ++_j : --_j) {
          turnsₐ.push(calculateDelta(i, direction));
        }
      }
      turnsₐ.push.apply(turnsₐ, imports.plain);
      _results.push(cached[rank][action] = turnsₐ);
    }
    return _results;
  };

  calculateDelta = function(i, direction) {
    switch (direction) {
      case 't':
        return [i, 0];
      case 'r':
        return [0, i];
      case 'b':
        return [-i, 0];
      case 'l':
        return [0, -i];
      case 'tr':
        return [i, i];
      case 'br':
        return [-i, i];
      case 'bl':
        return [-i, -i];
      case 'tl':
        return [i, -i];
    }
  };

  calculateDeltaVector = function(i) {
    return [[0, i], [i, 0], [i, i], [-i, -i], [0, -i], [-i, 0], [-i, i], [i, -i]];
  };

  have = function(argument) {
    return Array.isArray(argument);
  };

  UnitsMaster = {
    request: function(rank, callback) {
      return get(rank, callback);
    },
    requestAll: function(callback) {
      var data, unit, _i, _len, _results;
      data = {};
      _results = [];
      for (_i = 0, _len = units.length; _i < _len; _i++) {
        unit = units[_i];
        _results.push(get(unit, function(rank, exports) {
          data[rank] = exports;
          if ((summary(data)) === count) {
            return callback(data);
          }
        }));
      }
      return _results;
    },
    validateUnitAction: function(rank, action, _arg) {
      var list, x, xₐ, y, yₐ, _i, _len, _ref;
      x = _arg.x, y = _arg.y;
      list = turns[rank][action];
      for (_i = 0, _len = list.length; _i < _len; _i++) {
        _ref = list[_i], xₐ = _ref[0], yₐ = _ref[1];
        if (xₐ === x && yₐ === y) {
          return true;
        }
      }
      return false;
    },
    validateGeneralAction: function(name, _arg) {
      var PCMaster, i, radius, x, xₐ, y, yₐ, _i, _j, _len, _ref, _ref1;
      x = _arg.x, y = _arg.y;
      PCMaster = require('game_pc');
      radius = PCMaster.getCharacterByName(name).rank;
      for (i = _i = 1; 1 <= radius ? _i <= radius : _i >= radius; i = 1 <= radius ? ++_i : --_i) {
        _ref = calculateDeltaVector(i);
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          _ref1 = _ref[_j], xₐ = _ref1[0], yₐ = _ref1[1];
          if (xₐ === x && yₐ === y) {
            return true;
          }
        }
      }
      return false;
    },
    getUnitActions: function(rank, action) {
      if (action) {
        return cached[rank][action];
      } else {
        return cached[rank];
      }
    },
    getGeneralActions: function(name) {
      var actions, i, radius, turn, _i, _j, _len, _ref;
      radius = PC.getCharacterByName(name).rank;
      actions = {
        move: [],
        attack: []
      };
      for (i = _i = 1; 1 <= radius ? _i <= radius : _i >= radius; i = 1 <= radius ? ++_i : --_i) {
        _ref = calculateDeltaVector(i);
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          turn = _ref[_j];
          actions.move.push(turn);
        }
      }
      actions.attack = actions.move;
      return actions;
    },
    evaluateUnit: function(rank) {
      return cached[rank].stats.points;
    },
    evaluateGeneral: function(name) {
      var n;
      n = PC.getCharacterByName(name).rank;
      return n * 10;
    }
  };

  module.exports = UnitsMaster;

}).call(this);
