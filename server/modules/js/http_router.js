(function() {
  var Router, URL, handlers;

  module.paths = module.parent.paths;

  handlers = require('http_handlers');

  URL = require('url');

  Router = {
    handleRequest: function(request, response) {
      var data, handle, path;
      request.setEncoding('utf8');
      data = URL.parse(request.url, true);
      path = data.pathname;
      if ((handle = handlers[path])) {
        return handle(request, response);
      } else if ((handle = handlers['resource'])) {
        return handle(path, request, response);
      } else {
        return log("HTTP: Unknown request: " + path, 'ordinary');
      }
    }
  };

  module.exports = Router;

}).call(this);
