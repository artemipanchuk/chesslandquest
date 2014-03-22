#### ———————————————————————————————————————
##   HTTP Server
#### Runs and provides HTTP Server interface
#### ———————————————————————————————————————

module.paths = module.parent.paths

Router = require 'http_router'

HTTP = require 'http'

HTTPServer = HTTP.createServer (request, response) ->
	Router.handleRequest request, response

HTTPServer.listen 80

log 'HTTP: Running on 80', 'positive'

#### ———————————————————————————————————————

module.exports = HTTPServer
