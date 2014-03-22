#### ———————————————————————————————————————
##   Interface/Templator
#### Provides template parsing
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Interface/Templator', (exports) ->

	Transport =
		@require 'Transport/Master'

#### ———————————————————————————————————————

	{ajax} = atom

#### ———————————————————————————————————————

	fillers =
		'screen::selection' : (template, callback) ->
			ajax
				'method' : 'GET'
				'url'    : "/account/details"
				'onLoad' : (data) ->
					data = JSON.parse data

					callback parse template, data

		'dialog::market-units' : (template, callback) =>
			UnitsMaster =
				@require 'Units/Master'

			callback parse template, UnitsMaster.provide()

#### ———————————————————————————————————————

	HTML = (id) ->
		return document
			.getElementById(id)
			.innerHTML

	parse = (string, data = {}) ->
		process = if !/\W/.test string
			cache[string] ?= parse HTML string
		else
			new Function 'object',
				"var p=[],print=function(){p.push.apply(p,arguments);};" +
				"with(object){p.push('" +

					string
						.replace(/[\r\t\n]/g, "")
						.split("<%").join("\t")
						.replace(/((^|%>)[^\t]*)'/g, "$1\r")
						.replace(/\t=(.*?)%>/g, "',$1,'")
						.split("\t").join("');")
						.split("%>").join("p.push('")
						.split("\r").join("\\'") +

				"');}return p.join('');"

		return process data

#### ———————————————————————————————————————

	exports.provide = (name, callback) ->
		Transport.request {type:'template', name}, (template) ->
			if (fill = fillers[name])?
				fill template, (code) ->
					callback code
			else
				code = parse template

				callback code

#### ———————————————————————————————————————