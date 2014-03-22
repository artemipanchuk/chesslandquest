(function() {

  this.define('Battle/Units', function(exports) {
    var CanvasObjects, ScenesTileset, n, units;
    CanvasObjects = this.require('Canvas/Objects');
    ScenesTileset = this.require('Scenes/Tileset');
    units = {
      opponent: {},
      own: {}
    };
    n = 0;
    exports.register = function(_arg) {
      var cell, key, point, rank, side;
      side = _arg.side, cell = _arg.cell, point = _arg.point, rank = _arg.rank, key = _arg.key;
      if (!key) {
        key = n + 1;
        ++n;
      }
      units[side][key] = {
        key: key,
        rank: rank,
        cell: cell,
        point: point
      };
      CanvasObjects.register({
        type: 'figure/unit',
        data: {
          point: point,
          key: key
        }
      });
      return key;
    };
    exports.update = function(_arg) {
      var cell, key, old, origin, path, point, side;
      side = _arg.side, key = _arg.key, point = _arg.point, cell = _arg.cell;
      origin = units[side][key];
      old = origin.point;
      path = ScenesTileset.createPath(old, point);
      CanvasObjects.move({
        type: 'figure/unit',
        key: key,
        path: path
      });
      origin.cell = cell;
      return origin.point = point;
    };
    exports.drop = function(_arg) {
      var key, side;
      side = _arg.side, key = _arg.key;
      delete units[side][key];
      return CanvasObjects.drop({
        type: 'figure/unit',
        key: key
      });
    };
    return exports.get = function(side, key, property) {
      switch (void 0) {
        case key:
          return units[side];
        case property:
          return units[side][key];
        default:
          return units[side][key][property];
      }
    };
  });

}).call(this);
