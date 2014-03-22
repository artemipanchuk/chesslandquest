(function() {
  var HTTP, HTTPServer, Router;

  module.paths = module.parent.paths;

  Router = require('http_router');

  HTTP = require('http');

  HTTPServer = HTTP.createServer(function(request, response) {
    return Router.handleRequest(request, response);
  });

  HTTPServer.listen(80);

  log('HTTP: Running on 80', 'positive');

  module.exports = HTTPServer;

}).call(this);
