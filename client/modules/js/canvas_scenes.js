(function() {

  this.define('Canvas/Scenes', function(exports) {
    var Controls, Element, Objects, Point, Preloader, Projection, Rectangle, Size, TileEngine, area, engine, overlapsLayer, projectEffect, projectMultiObject, projectSingleObject, projectTile, projectTransition, size, tilesLayer, variations, zero, _ref, _ref1;
    _ref = this.require('LibCanvas/TileEngine/Element', 'LibCanvas/TileEngine', 'LibCanvas/Rectangle', 'LibCanvas/Point', 'LibCanvas/Size'), Element = _ref[0], TileEngine = _ref[1], Rectangle = _ref[2], Point = _ref[3], Size = _ref[4];
    Preloader = this.require('Transport/Preloader');
    _ref1 = this.require('Canvas/Projection', 'Canvas/Controls', 'Canvas/Objects'), Projection = _ref1[0], Controls = _ref1[1], Objects = _ref1[2];
    size = exports.size = 50;
    area = new Size(size, size);
    zero = new Size(0, 0);
    overlapsLayer = null;
    tilesLayer = null;
    engine = new TileEngine({
      size: area,
      cellSize: area,
      cellMargin: zero,
      defaultValue: 'no'
    });
    variations = function(n) {
      return Math.round(Math.random() * n);
    };
    projectSingleObject = function(_arg) {
      var name, x, y;
      name = _arg.name, x = _arg.x, y = _arg.y;
      return Objects.register({
        type: 'decoration/single',
        data: {
          point: {
            x: (x + 0.5) * size,
            y: (y + 0.5) * size
          },
          name: name
        }
      });
    };
    projectMultiObject = function(_arg) {
      var height, name, object, width, x, y;
      name = _arg.name, x = _arg.x, y = _arg.y, width = _arg.width, height = _arg.height;
      object = Objects.register({
        type: 'decoration/multi',
        data: {
          point: {
            x: (x + 0.5) * size,
            y: (y + height + 0.5) * size
          },
          name: name
        }
      });
      Controls.subscribe(object);
      return Controls.addDialog(object, "place::" + name, self);
    };
    projectEffect = function(_arg) {
      var cell, name, point, polygon;
      name = _arg.name, point = _arg.point;
      cell = engine.getCellByIndex(new Point(point));
      polygon = Projection.translateTile(cell.rectangle.toPolygon());
      return Objects.register({
        type: "effect/" + name,
        data: {
          shape: polygon
        }
      });
    };
    projectTile = function(_arg) {
      var cell, polygon, texture;
      texture = _arg.texture, cell = _arg.cell;
      polygon = Projection.translateTile(cell.rectangle.toPolygon());
      return tilesLayer.ctx.projectiveImage({
        image: Preloader.get(texture),
        to: polygon
      });
    };
    projectTransition = function(_arg) {
      var angle, polygon, texture, x, y;
      x = _arg.x, y = _arg.y, angle = _arg.angle, texture = _arg.texture;
      polygon = engine.getCellByIndex(new Point(x, y)).rectangle.toPolygon();
      polygon.rotate(angle, polygon.center);
      polygon = Projection.translateTile(polygon);
      return overlapsLayer.ctx.projectiveImage({
        image: Preloader.get(texture),
        to: polygon
      });
    };
    engine.setMethod({
      grass: function(ctx, cell) {
        return projectTile({
          texture: "grass" + (variations(1)),
          cell: cell
        });
      },
      earth: function(ctx, cell) {
        return projectTile({
          texture: "earth" + (variations(1)),
          cell: cell
        });
      },
      road: function(ctx, cell) {
        return projectTile({
          texture: "road" + (variations(1)),
          cell: cell
        });
      },
      dark: function(ctx, cell) {
        return projectTile({
          texture: "dark",
          cell: cell
        });
      },
      light: function(ctx, cell) {
        return projectTile({
          texture: "light",
          cell: cell
        });
      },
      no: function() {}
    });
    exports.projectTile = function(_arg) {
      var tile, x, y;
      tile = _arg.tile, x = _arg.x, y = _arg.y;
      return engine.getCellByIndex(new Point(x, y)).value = tile;
    };
    exports.projectTransition = function(settings) {
      return projectTransition(settings);
    };
    exports.projectObject = function(settings) {
      if ((settings.width != null) && (settings.height != null)) {
        return projectMultiObject(settings);
      } else {
        return projectSingleObject(settings);
      }
    };
    exports.getCellOf = function(point) {
      var coordinates;
      return coordinates = point.clone().mul(size);
    };
    exports.getCellByPoint = function(point) {
      return engine.getCellByPoint(new Point(point));
    };
    exports.clean = function() {
      var cell, _i, _len, _ref2;
      Controls.clean();
      Objects.clean();
      _ref2 = engine.cells;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        cell = _ref2[_i];
        cell.value = 'no';
      }
      overlapsLayer.ctx.clearAll();
      return tilesLayer.ctx.clearAll();
    };
    exports.complete = function() {
      var cell, _i, _len, _ref2, _results;
      _ref2 = engine.cells;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        cell = _ref2[_i];
        _results.push(engine.updateCell(cell));
      }
      return _results;
    };
    exports.effect = function(settings) {
      return projectEffect(settings);
    };
    exports.cleanEffects = function() {
      return Objects.clean('effect');
    };
    return exports.initialize = function(app) {
      var element, pseudoLayer, screen;
      screen = Projection.screen;
      pseudoLayer = app.createLayer({
        zIndex: 0,
        name: 'pseudo'
      });
      tilesLayer = app.createLayer({
        zIndex: 0,
        name: 'tiles'
      });
      overlapsLayer = app.createLayer({
        zIndex: 1,
        name: 'overlaps'
      });
      return element = new Element(pseudoLayer, {
        engine: engine,
        from: new Point(0, 0)
      });
    };
  });

}).call(this);
