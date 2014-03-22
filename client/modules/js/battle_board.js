(function() {

  this.define('Battle/Board', function(exports) {
    var Controls, Point, Projection, Scenes, Units, UnitsMaster, cellSize, divide, home, matrix, mode, pick, place, size, _ref;
    Point = this.require('LibCanvas/Point');
    _ref = this.require('Canvas/Projection', 'Canvas/Controls', 'Canvas/Scenes'), Projection = _ref[0], Controls = _ref[1], Scenes = _ref[2];
    UnitsMaster = this.require('Units/Master');
    Units = this.require('Battle/Units');
    size = null;
    mode = null;
    cellSize = null;
    matrix = [];
    home = [];
    divide = function(point) {
      var cell, floor;
      floor = Math.floor;
      cell = {
        x: floor(point.x / cellSize) - 1,
        y: floor(point.y / cellSize) - 1
      };
      return cell;
    };
    place = {
      arranger: function(x, y, rank, callback) {
        var key, point;
        if (!home.some(function(point) {
          return point.x === x && point.y === y;
        })) {
          return;
        }
        point = new Point([(x + 1.5) * cellSize, (y + 1.5) * cellSize]);
        if (key = matrix[y][x]) {
          callback(Units.get('own', key, 'rank'));
        } else {
          callback();
        }
        return matrix[y][x] = Units.register({
          side: 'own',
          cell: {
            x: x,
            y: y
          },
          point: point,
          rank: rank
        });
      },
      fight: function(x, y, key, callback) {
        var target, unit;
        target = matrix[y][x];
        switch (true) {
          case Units.get('opponent', target) != null:
            return callback('attack', {
              x: x,
              y: y
            }, function(old) {
              var point;
              matrix[old.y][old.x] = null;
              matrix[y][x] = key;
              Units.drop({
                side: 'opponent',
                key: target
              });
              point = new Point([(x + 1.5) * cellSize, (y + 1.5) * cellSize]);
              return Units.update({
                side: 'own',
                key: key,
                point: point,
                cell: {
                  x: x,
                  y: y
                }
              });
            });
          case unit = Units.get('own', target):
            return callback('change', unit);
          default:
            return callback('move', {
              x: x,
              y: y
            }, function(old) {
              var point;
              matrix[old.y][old.x] = null;
              matrix[y][x] = key;
              point = new Point([(x + 1.5) * cellSize, (y + 1.5) * cellSize]);
              return Units.update({
                side: 'own',
                key: key,
                point: point,
                cell: {
                  x: x,
                  y: y
                }
              });
            });
        }
      }
    };
    pick = {
      arranger: function(x, y, key, callback) {
        var rank;
        rank = Units.get('own', key, 'rank');
        matrix[y][x] = null;
        Units.drop({
          side: 'own',
          key: key
        });
        return callback(rank);
      },
      fight: function(x, y, key, callback) {
        var unit;
        if (unit = Units.get('own', key)) {
          return callback(unit);
        }
      }
    };
    exports.configure = function(settings) {
      var x, y, _i, _len, _ref1;
      size = settings.size;
      cellSize = Scenes.size;
      mode = 'arranger';
      size.times(function(y) {
        matrix[y] = [];
        return size.times(function(x) {
          return matrix[y][x] = null;
        });
      });
      size.times(function(y) {
        return (size / 4).times(function(x) {
          return home.push({
            x: x,
            y: y
          });
        });
      });
      for (_i = 0, _len = home.length; _i < _len; _i++) {
        _ref1 = home[_i], x = _ref1.x, y = _ref1.y;
        Scenes.effect({
          point: {
            x: x + 1,
            y: y + 1
          },
          name: 'white'
        });
      }
      return wait(1, function() {
        var a;
        return Controls.observe(Projection.translatePoint([a = (size + 1) * cellSize / 2, a]));
      });
    };
    exports.place = function(key, point, callback) {
      var x, y, _ref1;
      _ref1 = divide(point), x = _ref1.x, y = _ref1.y;
      if ((0 <= x && x < size) && (0 <= y && y < size)) {
        return place[mode](x, y, key, callback);
      }
    };
    exports.pick = function(point, callback) {
      var key, x, y, _ref1, _ref2;
      _ref1 = divide(point), x = _ref1.x, y = _ref1.y;
      if (key = (_ref2 = matrix[y]) != null ? _ref2[x] : void 0) {
        return pick[mode](x, y, key, callback);
      }
    };
    exports.make = function(_arg) {
      var cell, key, point, turn, x, y, _ref1;
      key = _arg.key, turn = _arg.turn;
      if (key > 0) {
        turn.x = -turn.x;
        key = -key;
      }
      _ref1 = Units.get('opponent', key), cell = _ref1.cell, point = _ref1.point;
      x = cell.x + turn.x;
      y = cell.y + turn.y;
      matrix[cell.y][cell.x] = null;
      if (matrix[y][x] != null) {
        Units.drop({
          side: 'own',
          key: matrix[y][x]
        });
      }
      matrix[y][x] = key;
      point = new Point([(x + 1.5) * cellSize, (y + 1.5) * cellSize]);
      return Units.update({
        side: 'opponent',
        key: key,
        point: point,
        cell: {
          x: x,
          y: y
        }
      });
    };
    return exports.accept = function(set) {
      var cell, key, point, rank, x, y, _ref1, _results;
      Scenes.cleanEffects();
      mode = 'fight';
      _results = [];
      for (key in set) {
        _ref1 = set[key], cell = _ref1.cell, rank = _ref1.rank;
        if (key > 0) {
          cell.x = size - cell.x - 1;
          key = -key;
        }
        x = cellSize * (cell.x + 1.5);
        y = cellSize * (cell.y + 1.5);
        point = new Point([x, y]);
        _results.push(matrix[cell.y][cell.x] = Units.register({
          point: point,
          side: 'opponent',
          cell: cell,
          rank: rank,
          key: key
        }));
      }
      return _results;
    };
  });

}).call(this);
