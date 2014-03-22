@files =
	a : [
		'stylesheets/css/signup.css',

		'submodules/kalendae/build/kalendae.css'
		'submodules/kalendae/build/kalendae.js',
	]

	s : [
		'submodules/atomjs/atom-full-compiled.js',
		'submodules/crypto/crypto.js',

		'modules/js/utility.js',

		'modules/js/interface_validator.js'
	]

@handlers =
	'submodules/kalendae/build/kalendae.js' : ->
		new Kalendae.Input 'formCalendar',
			months : 2

	'onfinish' : ->
		{dom} = atom

		Validator =
			@require 'Interface/Validator'

		form = dom '#signupForm'

		form.bind 'keypress', (event) ->
			if event.keyCode is 13
				Validator.submitSignup form

		form.find('button').bind 'click', ->
			Validator.submitSignup form