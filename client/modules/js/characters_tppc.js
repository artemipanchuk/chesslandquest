(function() {

  this.define('Characters/TPPC', function(exports) {
    var CanvasControls, CanvasObjects, ScenesTileset, Socket, drop, logics, move, orders, register, _ref;
    _ref = this.require('Canvas/Controls', 'Canvas/Objects'), CanvasControls = _ref[0], CanvasObjects = _ref[1];
    ScenesTileset = this.require('Scenes/Tileset');
    Socket = this.require('Transport/Socket');
    orders = ['tppc::register', 'tppc::drop', 'tppc::move'];
    logics = {};
    register = function(character) {
      var name, object, point;
      name = character.name, point = character.point;
      object = CanvasObjects.register({
        type: 'figure/tppc',
        data: {
          key: name,
          point: point
        }
      });
      logics[name] = character;
      CanvasControls.subscribe(object);
      return CanvasControls.addDialog(object, 'character::tppc', character);
    };
    move = function(_arg) {
      var character, from, name, path, point, to;
      name = _arg.name, point = _arg.point;
      character = logics[name];
      from = character.point;
      to = point;
      path = ScenesTileset.createPath(from, to);
      if (!path) {
        return;
      }
      return CanvasObjects.move({
        type: 'figure/tppc',
        link: character,
        key: name,
        path: path
      });
    };
    drop = function(name) {
      CanvasObjects.drop({
        type: 'figure/tppc',
        key: name
      });
      return delete logics[name];
    };
    exports.disable = function() {
      var order, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = orders.length; _i < _len; _i++) {
        order = orders[_i];
        _results.push(Socket.disable(order));
      }
      return _results;
    };
    exports.enable = function() {
      var order, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = orders.length; _i < _len; _i++) {
        order = orders[_i];
        _results.push(Socket.enable(order));
      }
      return _results;
    };
    exports.listen = function() {
      Socket.listen('tppc::register', function(character) {
        return register(character);
      });
      Socket.listen('tppc::move', function(course) {
        return move(course);
      });
      return Socket.listen('tppc::drop', function(name) {
        return drop(name);
      });
    };
    return exports.get = function(name) {
      return logics[name];
    };
  });

}).call(this);
