#### ———————————————————————————————————————
##   Router
#### Provides routing
#### ———————————————————————————————————————

module.paths = module.parent.paths

handlers = require 'http_handlers'

URL = require 'url'

#### ———————————————————————————————————————

Router =
	handleRequest : (request, response) ->
		request.setEncoding 'utf8'

		data = URL.parse request.url, true
		path = data.pathname

		if (handle = handlers[path])
			handle request, response
		else if (handle = handlers['resource'])
			handle path, request, response
		else
			log "HTTP: Unknown request: #{path}", 'ordinary'

#### ———————————————————————————————————————

module.exports = Router