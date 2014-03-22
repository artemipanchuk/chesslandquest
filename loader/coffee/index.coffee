@files =
	a : [
		'stylesheets/css/index.css'
	]

	s : [
		'submodules/crypto/crypto.js',
		'submodules/atomjs/atom-full-compiled.js',

		'modules/js/utility.js',
		'modules/js/interface_validator.js'
	]

@handlers =
	'onfinish' : ->
		{dom} = atom

		Validator =
			@require 'Interface/Validator'

		form = dom '#loginForm'

		form.bind 'keypress', (event) ->
			if event.keyCode is 13
				Validator.submitSignin form

		form.find('button').bind 'click', ->
			Validator.submitSignin form