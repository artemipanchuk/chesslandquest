(function() {

  this.define('Transport/Socket', function(exports) {
    var bySpace, disabled, handle, orders, socket;
    socket = (function() {
      var send;
      socket = new WebSocket("ws://" + location.host);
      send = WebSocket.prototype.send;
      socket.send = function(message) {
        var resend;
        if (this.readyState === 1) {
          return send.call(this, message);
        } else {
          resend = function() {
            return socket.send(message);
          };
          return wait(500, resend);
        }
      };
      return socket;
    })();
    bySpace = ' ';
    disabled = {};
    orders = {};
    handle = {
      message: function(event) {
        var accept, incoming, parsed;
        incoming = event.data.split(bySpace);
        if (accept = orders[incoming[0]]) {
          parsed = JSON.parse(incoming.slice(1).join(bySpace));
          return accept(parsed != null ? parsed : void 0);
        }
      },
      close: function(event) {
        return console.log('WebSocket: Connection lost');
      },
      error: function(event) {},
      open: function(event) {
        return console.log('WebSocket: Connection established');
      }
    };
    socket.onmessage = handle.message;
    socket.onclose = handle.close;
    socket.onerror = handle.error;
    socket.onopen = handle.open;
    exports.send = function(subject, body) {
      return socket.send("" + subject + " " + (JSON.stringify(body)));
    };
    exports.disable = function(subject) {
      if (subject) {
        disabled[subject] = orders[subject];
        return delete orders[subject];
      }
    };
    exports.enable = function(subject) {
      var _ref;
      if ((_ref = orders[subject]) == null) {
        orders[subject] = disabled[subject];
      }
      return delete disabled[subject];
    };
    return exports.listen = function(subject, handle) {
      return orders[subject] = handle;
    };
  });

}).call(this);
