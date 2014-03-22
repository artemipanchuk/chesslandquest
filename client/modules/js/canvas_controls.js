(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.define('Canvas/Controls', function(exports) {
    var ASearch, HUD, LayerShift, Mouse, MouseHandler, Point, Projection, Search, addScrollingFunctionTo, layerShifts, linkToShift, mouse, mouseHandler, padding, screen, scroll, size, _ref;
    _ref = this.require('LibCanvas/App/MouseHandler', 'LibCanvas/App/LayerShift', 'LibCanvas/Mouse', 'LibCanvas/Point'), MouseHandler = _ref[0], LayerShift = _ref[1], Mouse = _ref[2], Point = _ref[3];
    Projection = this.require('Canvas/Projection');
    HUD = this.require('Interface/HUD/Master');
    ASearch = this.require('LibCanvas/App/ElementsMouseSearch');
    Search = (function(_super) {

      __extends(Search, _super);

      function Search() {
        this.elements = [];
      }

      Search.prototype.findByPoint = function(point) {
        var coordinate, element, _i, _len, _ref1;
        coordinate = point.clone().move(linkToShift(), true);
        _ref1 = this.elements;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          element = _ref1[_i];
          if (element.isTriggerPoint(coordinate)) {
            return [element];
          }
        }
        return [];
      };

      return Search;

    })(ASearch);
    mouse = null;
    layerShifts = null;
    mouseHandler = null;
    size = Projection.size, screen = Projection.screen, padding = Projection.padding;
    window.oncontextmenu = Mouse.prevent;
    addScrollingFunctionTo = function(app) {
      layerShifts = app.layers.map(function(layer) {
        var layerShift;
        layerShift = new LayerShift(layer);
        return layerShift.setLimitShift({
          from: [screen.x - size.x, screen.y - size.y - padding],
          to: [0, 0]
        });
      });
      mouse = new Mouse(app.container.bounds);
      return mouse.events.add('move', function(event, mouse) {
        var x, xs, y, ys;
        x = event.clientX, y = event.clientY;
        if (x < 5) {
          xs = 10;
        } else if (x > screen.x - 5) {
          xs = -10;
        }
        if (y < 5) {
          ys = 10;
        } else if (y > screen.y - 5) {
          ys = -10;
        }
        if (xs || ys) {
          return scroll([xs || 0, ys || 0]);
        }
      });
    };
    scroll = function(vector) {
      return layerShifts.forEach(function(layerShift) {
        return layerShift.addShift(vector);
      });
    };
    exports.linkToShift = linkToShift = function() {
      return layerShifts.first.shift;
    };
    exports.clean = function() {
      return layerShifts.forEach(function(layerShift) {
        return layerShift.setShift(new Point(0, 0));
      });
    };
    exports.observe = function(point) {
      point.reverse();
      point.x += screen.x / 2;
      point.y += screen.y / 2;
      return layerShifts.forEach(function(layerShift) {
        return layerShift.setShift(point);
      });
    };
    exports.initialize = function(app) {
      addScrollingFunctionTo(app);
      return mouseHandler = new MouseHandler({
        search: new Search,
        app: app,
        mouse: mouse
      });
    };
    exports.subscribe = function(element) {
      return mouseHandler.subscribe(element);
    };
    exports.addDialog = function(element, type, settings) {
      return element.events.add('click', function(event) {
        if (event.button === 2) {
          return HUD.dialog("" + type, settings);
        }
      });
    };
    exports.addInteractive = function(element, action, callback) {
      return element.events.add(action, callback);
    };
    exports.addMouseAction = function(event, callback) {
      return mouse.events.add(event, function(event, mouse) {
        var point, shift;
        point = mouse.point.clone();
        shift = linkToShift();
        point.x -= shift.x;
        point.y -= shift.y;
        point = Projection.to3D(point);
        return callback(point);
      });
    };
    exports.removeMouseAction = function(event) {
      return mouse.events.remove(event);
    };
    return exports.addKeyboardAction = function(event, callback) {};
  });

}).call(this);
