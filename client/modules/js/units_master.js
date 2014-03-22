(function() {

  this.define('Units/Master', function(exports) {
    var FPPC, Socket, delta, have, units;
    Socket = this.require('Transport/Socket');
    FPPC = this.require('Characters/FPPC');
    units = {};
    delta = function(i, direction) {
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
    have = function(argument) {
      return Array.isArray(argument);
    };
    exports.initialize = function() {
      Socket.send('units', null);
      return Socket.listen('units', function(data) {
        return units = data;
      });
    };
    exports.provide = function() {
      return {
        units: units
      };
    };
    exports.evaluate = function(rank) {
      return units[rank].stats.points;
    };
    return exports.validate = function(rank, action, _arg) {
      var x, xₐ, y, yₐ, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      x = _arg.x, y = _arg.y;
      if (rank === 'general') {
        _ref = FPPC.calculate(action);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref1 = _ref[_i], xₐ = _ref1[0], yₐ = _ref1[1];
          if (xₐ === x && yₐ === y) {
            return true;
          }
        }
      } else {
        _ref2 = units[rank][action];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          _ref3 = _ref2[_j], xₐ = _ref3[0], yₐ = _ref3[1];
          if (xₐ === x && yₐ === y) {
            return true;
          }
        }
      }
      return false;
    };
  });

}).call(this);
