(function() {

  this.define('Interface/Templator', function(exports) {
    var HTML, Transport, ajax, fillers, parse,
      _this = this;
    Transport = this.require('Transport/Master');
    ajax = atom.ajax;
    fillers = {
      'screen::selection': function(template, callback) {
        return ajax({
          'method': 'GET',
          'url': "/account/details",
          'onLoad': function(data) {
            data = JSON.parse(data);
            return callback(parse(template, data));
          }
        });
      },
      'dialog::market-units': function(template, callback) {
        var UnitsMaster;
        UnitsMaster = _this.require('Units/Master');
        return callback(parse(template, UnitsMaster.provide()));
      }
    };
    HTML = function(id) {
      return document.getElementById(id).innerHTML;
    };
    parse = function(string, data) {
      var process, _ref;
      if (data == null) {
        data = {};
      }
      process = !/\W/.test(string) ? (_ref = cache[string]) != null ? _ref : cache[string] = parse(HTML(string)) : new Function('object', "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(object){p.push('" + string.replace(/[\r\t\n]/g, "").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
      return process(data);
    };
    return exports.provide = function(name, callback) {
      return Transport.request({
        type: 'template',
        name: name
      }, function(template) {
        var code, fill;
        if ((fill = fillers[name]) != null) {
          return fill(template, function(code) {
            return callback(code);
          });
        } else {
          code = parse(template);
          return callback(code);
        }
      });
    };
  });

}).call(this);
