(function() {

  this.define('Scenes/Pathfinder', function(exports) {
    var AStarFinder, Grid, finder, grid, _ref;
    _ref = this.require('PathFinding/AStarFinder', 'PathFinding/Grid'), AStarFinder = _ref[0], Grid = _ref[1];
    finder = null;
    grid = null;
    exports.update = function(matrix, width, height) {
      var row, table, value, x, y, _i, _j, _len, _len1;
      table = [];
      for (y = _i = 0, _len = matrix.length; _i < _len; y = ++_i) {
        row = matrix[y];
        table[y] = [];
        for (x = _j = 0, _len1 = row.length; _j < _len1; x = ++_j) {
          value = row[x];
          table[y][x] = 0;
        }
      }
      finder = new AStarFinder({
        allowDiagonal: true
      });
      return grid = new Grid(width, height, table);
    };
    exports.close = function(x, y) {
      return grid.setWalkableAt(x, y, false);
    };
    return exports.find = function(from, to) {
      var gridBackup, path;
      gridBackup = grid.clone();
      path = finder.findPath(from.x, from.y, to.x, to.y, grid);
      path = path.map(function(s) {
        return [s[0] + 0.5, s[1] + 0.5];
      });
      grid = gridBackup;
      return path;
    };
  });

}).call(this);
