(function() {
  var global;

  global = window;

  global.wait = function(time, callback) {
    return setTimeout(callback, time);
  };

  global.each = function(time, callback) {
    return setInterval(callback, time);
  };

  global.warn = function(message) {
    return console.log(message);
  };

  global.π = Math.PI;

  global.unsafe = /[^a-zA-Zа-яА-Я.,!?—\- ]+/g;

  Function.prototype.set = function(property, callback) {
    return atom.accessors.define(this.prototype, property, {
      'set': callback
    });
  };

  Function.prototype.get = function(property, callback) {
    return atom.accessors.define(this.prototype, property, {
      'get': callback
    });
  };

  Function.prototype.access = function(property, options) {
    return atom.accessors.define(this.prototype, property, {
      'get': options.get,
      'set': options.set
    });
  };

  Array.access('first', {
    get: function() {
      if (this.length > 0) {
        return this[0];
      } else {
        return null;
      }
    },
    set: function(v) {
      return this[0] = v;
    }
  });

  Array.access('last', {
    get: function() {
      var a;
      if ((a = this.length) > 0) {
        return this[a - 1];
      } else {
        return null;
      }
    },
    set: function(v) {
      var a;
      return this[(a = this.length - 1) > 0 && a || 0] = v;
    }
  });

  Array.access('second', {
    get: function() {
      if (this.length > 1) {
        return this[1];
      } else {
        return null;
      }
    },
    set: function(v) {
      return this[1] = val;
    }
  });

  Array.access('penult', {
    get: function() {
      var a;
      if ((a = this.length) > 1) {
        return this[a - 2];
      } else {
        return null;
      }
    },
    set: function(v) {
      var a;
      return this[(a = this.length) > 2 && a - 2 || 0] = v;
    }
  });

  String.get('dom', function() {
    return atom.dom("" + this);
  });

  String.get('first', function() {
    return this[0];
  });

  Number.prototype.times = function(iterator) {
    var i, _i, _results;
    _results = [];
    for (i = _i = 0; 0 <= this ? _i < this : _i > this; i = 0 <= this ? ++_i : --_i) {
      _results.push(iterator(i));
    }
    return _results;
  };

}).call(this);
