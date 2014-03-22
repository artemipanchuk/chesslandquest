#### ———————————————————————————————————————
##   Interface/Preparer
#### Preparation interface
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Interface/Preparer', (exports) ->

	[Validator, Templator] =
		@require 'Interface/Validator',
		         'Interface/Templator'

#### ———————————————————————————————————————

	{dom, ajax} = atom

	root = dom('#root')

	root.css
		height : window.innerHeight-200

	window.onresize = ->
		root.css
			height : @innerHeight-200

#### ———————————————————————————————————————

	root.delegate '.deeper', 'click', (event) ->
		dom('.screen').addClass('upper')

		wait 750, ->
			create[event.target.id]()

	root.delegate '.back', 'click', ->
		dom('.screen').addClass('lower')

		wait 750, ->
			create.starter()

	root.delegate '.signout', 'click', ->
		Validator.submitSignout()

	root.delegate '.submit', 'click', (event) ->
		action = event.target.id.ucfirst()

		Validator["submitCharacter#{action}"] dom '.pseudoform'

#### ———————————————————————————————————————

	show = ->
		dom('.screen').get().className = 'screen'

	create =
		starter : ->
			Templator.provide 'screen::starter', (code) ->
				root.html code ; show()

		selection : ->
			Templator.provide 'screen::selection', (code) ->
				root.html code ; show()

				root.delegate 'li', 'click', (event) ->
					{target} = event

					root
						.find('li')
						.removeClass('selected')

					target.className = 'selected'

					dom('input[type=hidden]')
						.attr
							value : target.textContent

		creation  : ->
			Templator.provide 'screen::creation', (code) ->
				root.html code ; show()

#### ———————————————————————————————————————

	# • Create selection screen;
	exports.build = ->
		create.starter()

	exports.clean = (callback) ->
		dom('.screen')
			.addClass('upper')

		dom('.container')
			.addClass('vanishing')

		dom
			.create('section')
			.addClass('fader')
			.appendTo(document.body)

		wait 1000, ->
			dom('.container')
				.destroy()

			dom(document.body)
				.addClass('game-mode')

			dom('.fader')
				.destroy()

			callback()

#### ———————————————————————————————————————