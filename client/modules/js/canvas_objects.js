(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.define('Canvas/Objects', function(exports) {
    var AElement, Animations, Decoration, DynamicElement, Effect, Element, Figure, MultiDecoration, Point, Preloader, Projection, Rectangle, SingleDecoration, StaticElement, clean, cleanBy, find, force, layer, patterns, shift, _ref, _ref1,
      _this = this;
    _ref = this.require('Canvas/Projection', 'Canvas/Animations'), Projection = _ref[0], Animations = _ref[1];
    _ref1 = this.require('LibCanvas/App/Element', 'LibCanvas/Rectangle', 'LibCanvas/Point'), Element = _ref1[0], Rectangle = _ref1[1], Point = _ref1[2];
    Preloader = this.require('Transport/Preloader');
    shift = null;
    layer = null;
    AElement = (function(_super) {

      __extends(AElement, _super);

      AElement.get('point', function() {
        return this.shape.center.clone();
      });

      AElement.get('zIndex', function() {
        return this.shape.points[2].y;
      });

      AElement.get('changed', function() {
        return this.previousBoundingShape !== null;
      });

      function AElement(_arg) {
        var data;
        data = _arg.data;
        this.point3D = data.point;
        AElement.__super__.constructor.call(this, layer);
      }

      AElement.prototype.configure = function() {
        var name, point3D, _ref2,
          _this = this;
        point3D = this.point3D, name = this.name;
        Animations.create(name);
        if ((_ref2 = this.shape) == null) {
          this.shape = (function() {
            var point, rectangle;
            point = Projection.translatePoint(point3D);
            point.y -= _this.height - 12.5;
            point.x -= _this.width / 2;
            rectangle = new Rectangle({
              from: point,
              size: {
                width: _this.width,
                height: _this.height
              }
            });
            return rectangle.toPolygon();
          })();
        }
        layer.ctx.projectiveImage({
          image: this.image,
          to: this.shape.clone().move(shift)
        });
        delete this.point3D;
        return force();
      };

      AElement.prototype.clearPrevious = function(ctx) {
        if (this.changed) {
          return ctx.clearRect(this.previousBoundingShape.move(shift));
        }
      };

      AElement.prototype.renderTo = function(ctx, resources) {
        if (this.changed) {
          return ctx.projectiveImage({
            image: this.image,
            to: this.shape.clone().move(shift)
          });
        }
      };

      return AElement;

    })(Element);
    StaticElement = (function(_super) {

      __extends(StaticElement, _super);

      function StaticElement() {
        return StaticElement.__super__.constructor.apply(this, arguments);
      }

      return StaticElement;

    })(AElement);
    DynamicElement = (function(_super) {

      __extends(DynamicElement, _super);

      function DynamicElement() {
        return DynamicElement.__super__.constructor.apply(this, arguments);
      }

      DynamicElement.prototype.move = function(path, onstep) {
        var height, name, redraw, shape, step, _i, _len, _results;
        name = this.name, shape = this.shape, height = this.height;
        Animations.reset(name);
        redraw = this.redraw.bind(this);
        _results = [];
        for (_i = 0, _len = path.length; _i < _len; _i++) {
          step = path[_i];
          _results.push((function() {
            var next, target, vector;
            vector = null;
            target = Projection.translatePoint(step);
            next = step;
            return Animations.add({
              target: name,
              length: 250,
              pre: function(part) {
                var base;
                base = new Point(shape.center.x, shape.center.y + 17);
                return vector = base.diff(target).mul(part);
              },
              tick: function() {
                shape.move(vector);
                return redraw();
              },
              finish: onstep ? function() {
                return onstep(next);
              } : void 0
            });
          })());
        }
        return _results;
      };

      DynamicElement.prototype.destroy = function() {
        Animations.reset(name);
        return DynamicElement.__super__.destroy.apply(this, arguments);
      };

      return DynamicElement;

    })(AElement);
    Decoration = (function(_super) {

      __extends(Decoration, _super);

      function Decoration(_arg) {
        var data, _ref2;
        this.type = _arg.type, data = _arg.data;
        this.image = Preloader.get(data.name);
        _ref2 = this.image, this.width = _ref2.width, this.height = _ref2.height;
        Decoration.__super__.constructor.apply(this, arguments);
      }

      return Decoration;

    })(StaticElement);
    MultiDecoration = (function(_super) {

      __extends(MultiDecoration, _super);

      MultiDecoration.get('zIndex', function() {
        return this.shape.points[3].y - 15;
      });

      function MultiDecoration(_arg) {
        var data;
        this.type = _arg.type, data = _arg.data;
        MultiDecoration.__super__.constructor.apply(this, arguments);
      }

      return MultiDecoration;

    })(Decoration);
    SingleDecoration = (function(_super) {

      __extends(SingleDecoration, _super);

      function SingleDecoration(_arg) {
        var data;
        this.type = _arg.type, data = _arg.data;
        SingleDecoration.__super__.constructor.apply(this, arguments);
      }

      return SingleDecoration;

    })(Decoration);
    Effect = (function(_super) {

      __extends(Effect, _super);

      Effect.get('zIndex', function() {
        return 0;
      });

      function Effect(_arg) {
        var data, _ref2;
        this.type = _arg.type, data = _arg.data;
        this.image = Preloader.get(this.type.split('/')[1]);
        _ref2 = this.image, this.width = _ref2.width, this.height = _ref2.height;
        this.shape = data.shape;
        Effect.__super__.constructor.apply(this, arguments);
      }

      return Effect;

    })(StaticElement);
    Figure = (function(_super) {

      __extends(Figure, _super);

      Figure.prototype.width = 50;

      Figure.prototype.height = 64;

      function Figure(_arg) {
        var data;
        this.type = _arg.type, data = _arg.data;
        this.image = Preloader.get('character');
        this.key = "" + this.type + "/" + data.key;
        Figure.__super__.constructor.apply(this, arguments);
      }

      return Figure;

    })(DynamicElement);
    find = function(key) {
      var element, _i, _len, _ref2;
      _ref2 = layer.elements;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        element = _ref2[_i];
        if (element.key === key) {
          return element;
        }
      }
    };
    clean = function() {
      var elements;
      elements = layer.elements;
      while (elements.first != null) {
        elements.first.destroy();
        elements.shift();
      }
      return layer.ctx.clearAll();
    };
    cleanBy = function(type) {
      var elements, target;
      elements = layer.elements;
      type = new RegExp(type);
      target = elements.filter(function(element) {
        return type.test(element.type);
      });
      target.forEach(function(element) {
        return wait(0, function() {
          return element.destroy();
        });
      });
      return force();
    };
    force = function() {
      return layer.draw();
    };
    exports.initialize = function(app) {
      return layer = app.createLayer({
        name: 'objects',
        intersection: 'all',
        invoke: true,
        zIndex: 3
      });
    };
    patterns = {
      decoration: {
        single: /decoration\/single/,
        multi: /decoration\/multi/
      },
      figure: /figure\/.*/,
      effect: /effect\/.*/
    };
    exports.register = function(_arg) {
      var data, type;
      type = _arg.type, data = _arg.data;
      if (shift == null) {
        shift = _this.require('Canvas/Controls').linkToShift();
      }
      switch (true) {
        case patterns.decoration.single.test(type):
          return new SingleDecoration({
            type: type,
            data: data
          });
        case patterns.decoration.multi.test(type):
          return new MultiDecoration({
            type: type,
            data: data
          });
        case patterns.figure.test(type):
          return new Figure({
            type: type,
            data: data
          });
        case patterns.effect.test(type):
          return new Effect({
            type: type,
            data: data
          });
        default:
          return null;
      }
    };
    exports.drop = function(_arg) {
      var key, type;
      type = _arg.type, key = _arg.key;
      return find("" + type + "/" + key).destroy();
    };
    exports.move = function(_arg) {
      var key, link, path, type;
      type = _arg.type, key = _arg.key, link = _arg.link, path = _arg.path;
      return find("" + type + "/" + key).move(path, link ? function(point) {
        return link.point = point;
      } : void 0);
    };
    return exports.clean = function(type) {
      if (type != null) {
        return cleanBy(type);
      } else {
        return clean();
      }
    };
  });

}).call(this);
