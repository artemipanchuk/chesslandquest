(function() {

  this.define('Characters/NPC', function(exports) {
    var CanvasControls, CanvasObjects, ScenesTileset, Socket, autowalk, drop, logics, move, orders, register, _ref;
    _ref = this.require('Canvas/Controls', 'Canvas/Objects'), CanvasControls = _ref[0], CanvasObjects = _ref[1];
    ScenesTileset = this.require('Scenes/Tileset');
    Socket = this.require('Transport/Socket');
    orders = ['npc::register', 'npc::drop', 'npc::move'];
    logics = {};
    register = function(character) {
      var name, object, point;
      name = character.name, point = character.point;
      object = CanvasObjects.register({
        type: 'figure/npc',
        data: {
          key: name,
          point: point
        }
      });
      logics[name] = character;
      autowalk(name);
      CanvasControls.subscribe(object);
      return CanvasControls.addDialog(object, 'character::npc', character);
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
      logics[name].point = to;
      return CanvasObjects.move({
        type: 'figure/npc',
        key: name,
        path: path
      });
    };
    drop = function(name) {
      CanvasObjects.drop({
        type: 'figure/npc',
        key: name
      });
      return delete logics[name];
    };
    autowalk = function(name) {
      return each(5000, function() {
        var point, to, vector;
        point = logics[name].point;
        vector = {
          x: [-1, 0, 1].random * 25,
          y: [-1, 0, 1].random * 25
        };
        console.log(point.x, point.y);
        to = {
          x: point.x + vector.x,
          y: point.y + vector.y
        };
        return move({
          name: name,
          point: to
        });
      });
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
      Socket.listen('npc::register', function(character) {
        return register(character);
      });
      Socket.listen('npc::move', function(course) {
        return move(course);
      });
      return Socket.listen('npc::drop', function(name) {
        return drop(name);
      });
    };
    return exports.get = function(name) {
      return logics[name];
    };
  });

}).call(this);
