(function() {

  this.define('Characters/FPPC', function(exports) {
    var CanvasControls, CanvasObjects, ScenesTileset, Socket, move, orders, self, _ref;
    _ref = this.require('Canvas/Controls', 'Canvas/Objects'), CanvasControls = _ref[0], CanvasObjects = _ref[1];
    ScenesTileset = this.require('Scenes/Tileset');
    Socket = this.require('Transport/Socket');
    orders = ['fppc::register', 'fppc::drop', 'fppc::move'];
    self = null;
    move = function(to) {
      var from, path;
      from = self.point;
      path = ScenesTileset.createPath(from, to);
      if (!path) {
        return;
      }
      Socket.send('fppc::move', to);
      return CanvasObjects.move({
        type: 'figure/fppc',
        link: self,
        key: self.name,
        path: path
      });
    };
    exports.listen = function() {
      return CanvasControls.addMouseAction('click', move);
    };
    exports.enable = function() {
      return CanvasControls.addMouseAction('click', move);
    };
    exports.disable = function() {
      return CanvasControls.removeMouseAction('click', move);
    };
    exports.register = function(character) {
      var name, object, point;
      self = character;
      name = self.name, point = self.point;
      object = CanvasObjects.register({
        type: 'figure/fppc',
        data: {
          key: name,
          point: point
        }
      });
      CanvasControls.subscribe(object);
      CanvasControls.addDialog(object, 'character::fppc', self);
      return wait(1, function() {
        return CanvasControls.observe(object.point);
      });
    };
    exports.calculate = function() {
      var radius, ways;
      radius = self.rank;
      ways = [];
      radius.times(function(i) {
        ++i;
        return ways.push.apply(ways, [[0, i], [i, 0], [i, i], [-i, -i], [0, -i], [-i, 0], [-i, i], [i, -i]]);
      });
      return ways;
    };
    exports.get = function(what) {
      if (what != null) {
        return self[what];
      } else {
        return self;
      }
    };
    return exports.update = function(field, value) {
      return self[field] = value;
    };
  });

}).call(this);
