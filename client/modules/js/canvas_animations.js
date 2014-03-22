(function() {

  this.define('Canvas/Animations', function(exports) {
    var activate, activated, animations, frame, run, stop;
    animations = {};
    activated = {};
    frame = 1000 / 25;
    run = function(time, callback) {
      return setInterval(callback, time);
    };
    stop = function(animation) {
      return clearInterval(animation);
    };
    activate = function(target) {
      var animation, finish, length, pool, pre, progress, step, tick, _ref;
      if (!((pool = animations[target]) && pool.length)) {
        return;
      }
      if (activated[target]) {
        return;
      }
      _ref = pool.shift(), pre = _ref.pre, tick = _ref.tick, finish = _ref.finish, length = _ref.length;
      activated[target] = true;
      progress = 0;
      step = frame / length;
      pre(step);
      return animation = run(frame, function() {
        if (progress >= 1) {
          stop(animation);
          activated[target] = false;
          if (typeof finish === 'function') {
            finish();
          }
          activate(target);
          return;
        }
        progress += step;
        return call(tick);
      });
    };
    exports.create = function(target) {
      return animations[target] = [];
    };
    exports.reset = function(target) {
      return animations[target] = [];
    };
    return exports.add = function(settings) {
      var target;
      target = settings.target;
      if (!animations[target]) {
        return;
      }
      animations[target].push(settings);
      return activate(target);
    };
  });

}).call(this);
