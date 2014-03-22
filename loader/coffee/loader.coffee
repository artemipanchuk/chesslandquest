#### ———————————————————————————————————————
##   Loader
#### Provides javascript loading interface
#### ———————————————————————————————————————

# • Beautiful alias for `do`;
#
# 'scope (function)'
@call = (scope, args...) ->
	scope args...

#### ———————————————————————————————————————

# • Compact XHR interface
XHR = do ->
	current = window.location.toString()

	get = 'GET'

	ready = 4
	ok    = 200

	defaults =
		method : get
		async  : yes
		url    : current

	return (options) ->
		request = new XMLHttpRequest

		options.onLoad   = options.onLoad  or null
		options.onError  = options.onError or null

		mode = if (typeof options.mode is 'undefined') or (options.mode is yes) then yes else no

		request.open(
			options.method or defaults.method,
			options.url    or defaults.url,
			mode
		)

		responseHandler = ->
			if request.readyState is ready
				if request.status is ok
					options.onLoad  request.response if options.onLoad
				else
					options.onError request.response if options.onError

		request.send null

		if mode
			request.onreadystatechange = responseHandler
		else
			call responseHandler

#### ———————————————————————————————————————

@Loader = do ->
	#### Javascript loading

	libraryPattern = /\/library\//g
	# • Request Javascript file;
	#
	# `url (string)`, `handler (function)`, `mode (string)`
	requestJS = (url, handler, mode) ->
		XHR
			url  : url
			mode : mode

			onLoad : (code) ->
				if libraryPattern.test url
					evaluateLibrary code
				else
					evaluateScript code

				handler.call sandbox if handler

			onError : ->
				console.log "Loader: Failed to load #{url}"

	#### Cascad Style Sheets loading

	# • Request Javascript file;
	#
	# `url (string)`
	requestCSS = (url) ->
		node = document.createElement 'link'
		head = document.head

		node.rel  = 'stylesheet'
		node.href = "#{url}"

		head.appendChild node

	#### Common loading

	extensionPattern = /\.\w+$/
	# • Request Javascript file;
	#
	# `url (string)`, `handler (function)`, `mode (string)`
	request = (url, handler, mode) ->
		extension = extensionPattern.exec(url)[0]

		# Simplify url
		url = "/client/#{url}"

		switch extension
			when '.js'
				requestJS url, handler, mode

			when '.css'
				requestCSS url

			else
				throw new Error 'Unresolved extension'

	load = (files, handlers, mode) ->
		handlers ?= {}

		files.forEach (url) ->
			request url, handlers[url], mode

	onfinish = ->

	#### Execution

	evaluateScript = (code) ->
		eval code

	evaluateLibrary = (code) ->
		eval code

	evaluateWarrant = (code) ->
		eval code

		{files, handlers} = @

		load files.a, handlers     if files.a
		load files.s, handlers, no if files.s

		if handlers?.onfinish
			onfinish = handlers.onfinish

		do finalize

	finalize = ->
		onfinish.call sandbox if onfinish
		console.log 'Loader: Done'

	#### Sandbox

	sandbox =
		define : (module, implement) ->
			depth   = module.split '/'
			imports = {}

			if typeof implement is 'function'
				implement.call @, imports
			else
				imports = implement

			length = depth.length

			if length is 1
				@[depth[0]] = imports
			else if length is 2
				[a, b] = depth

				@[a]   ?= {}
				@[a][b] = imports
			else if length is 3
				[a, b, c] = depth

				@[a]      ?= {}
				@[a][b]   ?= {}
				@[a][b][c] = imports

		require : (modules...) ->
			if modules.length is 1
				depth = modules[0].split '/'

				if depth.length > 1
					return depth.reduce (a, b, index) =>
						if index is 1
							return @[a][b]
						else
							return a[b]
				else
					return @[depth[0]]
			else
				return modules.map (name) =>
					return @require name

	warrant = {}

	#### Export

	call ->
		page = do ->
			page = location.pathname
				.replace('/', '')
				.replace(/\//g, '_')

			page = 'index' if page.length is 0

			return "loader/js/#{page}.js"

		evaluateWarrant = evaluateWarrant.bind warrant
		evaluateScript  = evaluateScript .bind sandbox

		XHR
			url    : page
			onLoad : evaluateWarrant

#### ———————————————————————————————————————