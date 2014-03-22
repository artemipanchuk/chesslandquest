(function() {
  var strong, weak,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  weak = ['g'];

  strong = ['e', 'r', 'l', 'd'];

  this.define('Scenes/Tileset', function(exports) {
    var CanvasScenes, Pathfinder, Point, getPotentialCorners, getPotentialSides, height, processObject, processStrong, processWeak, width;
    CanvasScenes = this.require('Canvas/Scenes');
    Pathfinder = this.require('Scenes/Pathfinder');
    Point = this.require('LibCanvas/Point');
    height = null;
    width = null;
    getPotentialSides = function(tile, x, y, matrix) {
      var potential, _ref, _ref1, _ref2, _ref3;
      potential = {};
      if (y > 0 && (_ref = matrix[y - 1][x], __indexOf.call(strong, _ref) < 0)) {
        potential[1] = {
          x: x,
          y: y - 1
        };
      }
      if (x < width - 1 && (_ref1 = matrix[y][x + 1], __indexOf.call(strong, _ref1) < 0)) {
        potential[2] = {
          x: x + 1,
          y: y
        };
      }
      if (y < height - 1 && (_ref2 = matrix[y + 1][x], __indexOf.call(strong, _ref2) < 0)) {
        potential[3] = {
          x: x,
          y: y + 1
        };
      }
      if (x > 0 && (_ref3 = matrix[y][x - 1], __indexOf.call(strong, _ref3) < 0)) {
        potential[4] = {
          x: x - 1,
          y: y
        };
      }
      return potential;
    };
    getPotentialCorners = function(tile, x, y, sides, matrix) {
      var occupied, position, potential, _i, _len, _ref, _ref1, _ref2, _ref3;
      potential = {};
      if (y > 0 && x < width - 1 && (_ref = matrix[y - 1][x + 1], __indexOf.call(strong, _ref) < 0)) {
        potential[1] = {
          x: x + 1,
          y: y - 1
        };
      }
      if (x < width - 1 && y < height - 1 && (_ref1 = matrix[y + 1][x + 1], __indexOf.call(strong, _ref1) < 0)) {
        potential[2] = {
          x: x + 1,
          y: y + 1
        };
      }
      if (x > 0 && y < height - 1 && (_ref2 = matrix[y + 1][x - 1], __indexOf.call(strong, _ref2) < 0)) {
        potential[3] = {
          x: x - 1,
          y: y + 1
        };
      }
      if (y > 0 && x > 0 && (_ref3 = matrix[y - 1][x - 1], __indexOf.call(strong, _ref3) < 0)) {
        potential[4] = {
          x: x - 1,
          y: y - 1
        };
      }
      occupied = [1, 2, 3, 4].filter(function(c) {
        return !sides[c];
      });
      for (_i = 0, _len = occupied.length; _i < _len; _i++) {
        position = occupied[_i];
        if (position === 1) {
          delete potential[1];
          delete potential[4];
        } else {
          delete potential[position];
          delete potential[position - 1];
        }
      }
      return potential;
    };
    processStrong = function(tile, x, y, matrix) {
      var angle, cell, corners, index, position, sides, transitions, type, _i, _len, _ref, _results;
      CanvasScenes.projectTile({
        tile: tile,
        x: x,
        y: y
      });
      sides = getPotentialSides(tile, x, y, matrix);
      corners = getPotentialCorners(tile, x, y, sides, matrix);
      _ref = [sides, corners];
      _results = [];
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        transitions = _ref[index];
        _results.push((function() {
          var _results1;
          _results1 = [];
          for (position in transitions) {
            cell = transitions[position];
            angle = (function() {
              switch (position) {
                case '1':
                  return π;
                case '2':
                  return -π / 2;
                case '3':
                  return 0;
                case '4':
                  return π / 2;
              }
            })();
            type = (function() {
              switch (index) {
                case 0:
                  return 's';
                case 1:
                  return 'c';
              }
            })();
            _results1.push(CanvasScenes.projectTransition({
              texture: "" + tile + type,
              angle: angle,
              x: cell.x,
              y: cell.y
            }));
          }
          return _results1;
        })());
      }
      return _results;
    };
    processWeak = function(tile, x, y) {
      return CanvasScenes.projectTile({
        tile: tile,
        x: x,
        y: y
      });
    };
    processObject = function(settings) {
      var x, xₒ, y, yₒ, _i, _j, _ref, _ref1;
      width = settings.width, height = settings.height, x = settings.x, y = settings.y;
      if (width && height) {
        for (xₒ = _i = x, _ref = x + width; x <= _ref ? _i <= _ref : _i >= _ref; xₒ = x <= _ref ? ++_i : --_i) {
          for (yₒ = _j = y, _ref1 = y + height; y <= _ref1 ? _j <= _ref1 : _j >= _ref1; yₒ = y <= _ref1 ? ++_j : --_j) {
            Pathfinder.close(xₒ, yₒ);
          }
        }
      } else {
        Pathfinder.close(x, y);
      }
      return CanvasScenes.projectObject(settings);
    };
    exports.createPath = function(from, to) {
      var exactX, exactY, path, size, _ref, _ref1;
      size = CanvasScenes.size;
      exactX = to.x % size;
      exactY = to.y % size;
      from = (_ref = CanvasScenes.getCellByPoint(new Point(from))) != null ? _ref.point : void 0;
      to = (_ref1 = CanvasScenes.getCellByPoint(new Point(to))) != null ? _ref1.point : void 0;
      if (!(from && to)) {
        return;
      }
      path = Pathfinder.find(from, to);
      if (!path.length) {
        return false;
      }
      path = path.map(function(step) {
        return CanvasScenes.getCellOf(step);
      });
      path.last.first += exactX - 25;
      path.last.last += exactY - 25;
      path = path.slice(1);
      return path;
    };
    return exports.process = function(scene, clean) {
      var matrix, object, row, tile, value, x, y, _i, _j, _k, _len, _len1, _len2, _ref;
      matrix = scene.matrix;
      if (!clean) {
        CanvasScenes.clean();
      }
      height = matrix.length;
      width = matrix.first.length;
      Pathfinder.update(matrix, width, height);
      for (y = _i = 0, _len = matrix.length; _i < _len; y = ++_i) {
        row = matrix[y];
        for (x = _j = 0, _len1 = row.length; _j < _len1; x = ++_j) {
          value = row[x];
          if (!(value !== 'i')) {
            continue;
          }
          tile = (function() {
            switch (value) {
              case 'g':
                return 'grass';
              case 'e':
                return 'earth';
              case 'r':
                return 'road';
              case 'l':
                return 'light';
              case 'd':
                return 'dark';
            }
          })();
          if (__indexOf.call(strong, value) >= 0) {
            processStrong(tile, x, y, matrix);
          } else {
            processWeak(tile, x, y);
          }
        }
      }
      _ref = scene.objects;
      for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
        object = _ref[_k];
        processObject(object);
      }
      CanvasScenes.complete();
      return {
        width: width,
        height: height
      };
    };
  });

}).call(this);
