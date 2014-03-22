(function() {

  this.define('Canvas/Projection', function(exports) {
    var Point, Point3D, Projection, Size, height, padding, projection, proportion, screen, size, width, _ref;
    _ref = this.require('LibCanvas/IsometricEngine/Projection', 'LibCanvas/Point3D', 'LibCanvas/Point', 'LibCanvas/Size'), Projection = _ref[0], Point3D = _ref[1], Point = _ref[2], Size = _ref[3];
    width = window.innerWidth, height = window.innerHeight;
    exports.padding = padding = 200;
    exports.screen = screen = new Size(width, height);
    exports.size = size = new Size(4700, 2900);
    projection = new Projection({
      factor: [0.866, 0.5, 1],
      start: [padding, padding + size.y / 2],
      size: 1
    });
    exports.to3D = function(point2D) {
      var point3D;
      point3D = projection.to3D(point2D);
      point3D.x = point3D.x.floor();
      point3D.y = point3D.y.floor();
      return point3D;
    };
    exports.translatePoint = function(point3D) {
      var point2D;
      if (point3D instanceof Array) {
        point3D = new Point3D(point3D.first, point3D.second);
      }
      point2D = projection.toIsometric(point3D);
      return point2D;
    };
    proportion = 1.075;
    return exports.translateTile = function(polygon, keep) {
      if (keep == null) {
        keep = false;
      }
      if (!keep) {
        polygon.scale(proportion, polygon.center);
      }
      polygon.points = polygon.points.map(function(point3D) {
        return projection.toIsometric(point3D);
      });
      return polygon;
    };
  });

}).call(this);
