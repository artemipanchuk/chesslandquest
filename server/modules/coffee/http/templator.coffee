#### ———————————————————————————————————————
##   Templator
#### Provides interface to work with templates
#### ———————————————————————————————————————

module.paths = module.parent.paths

#### ———————————————————————————————————————

FS = require 'fs'
UT = require 'utility'

#### ———————————————————————————————————————

cached = {} # Cached templates ({content, version})

#### ———————————————————————————————————————

module.exports =

	get : (name, callback) ->
		path = "client/templates/#{name}"

		UT.version path, (actual) ->
			unless actual
				callback no ; return

			if (not template = cached[name]) or template.version isnt actual
				FS.readFile path, 'utf8', (error, content) ->
					if error
						callback no ; return

					callback content

					cached[name] = {version:actual, content}
			else
				callback template.content

	getVersion : (name, callback) ->
		path = "client/templates/#{name}"

		UT.version path, (actual) ->
			unless actual
				callback no ; return

			callback actual

#### ———————————————————————————————————————