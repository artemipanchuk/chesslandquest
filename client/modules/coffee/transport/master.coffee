#### ———————————————————————————————————————
##   Transport/Master
#### Resources management
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Transport/Master', (exports) ->

	Socket =
		@require 'Transport/Socket'

#### ———————————————————————————————————————

	{ajax} = atom

	if localStorage.versions?
		versions = JSON.parse localStorage.versions
	else
		versions = {}

	gameResources = ['scene']
	htmlResources = ['template']

#### ———————————————————————————————————————

	requestVersion = (key, callback) ->
		ajax
			'method' : 'POST'
			'data'   : "#{key}"
			'url'    : "/version"
			'onLoad' : (actual) ->
				callback actual

	requestHTMLResource = ({key, type, name}, callback) ->
		ajax
			'method' : 'POST'
			'cache'  : 'false'
			'data'   : "#{name}"
			'url'    : "/#{type}"
			'onLoad' : (data) ->
				localStorage[key] = data

				callback data

	requestGameResource = ({key, type, name}, callback) ->
		Socket.listen "#{type}", (data) ->
			localStorage[key] = JSON.stringify data

			callback data

		Socket.send "#{type}", "#{name}"

#### ———————————————————————————————————————

	exports.request = ({type, name}, callback) ->
		key = "#{type}/#{name}"

		requestVersion key, (actual) ->
			if versions[key] != actual
				versions[key] = actual

				localStorage.versions = JSON.stringify versions

				if type in gameResources
					requestGameResource {key, type, name}, callback
				else if type in htmlResources
					requestHTMLResource {key, type, name}, callback
				else
					warn 'Transport/Master: invalid resource type'
			else
				if type in gameResources
					callback JSON.parse localStorage[key]
				else
					callback localStorage[key]


#### ———————————————————————————————————————