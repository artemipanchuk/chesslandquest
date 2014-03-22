#### ———————————————————————————————————————
##   Interface/HUD/Menu
#### Menu extension
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Interface/HUD/Menu', (exports) ->

	Dialogs =
		@require 'Interface/HUD/Dialogs'

#### ———————————————————————————————————————

	{dom} = atom

	mode = null
	body = null

	categories = [
		'Experience',
		'Inventory',
		'Army'
	]

#### ———————————————————————————————————————

	exports.switch = (place) ->
		mode = place

	exports.build  = (place = 'global') =>
		mode = place

		body = dom
			.create('section')
			.attr('id', 'menu')
			.appendTo(document.body)

		dom
			.create('section')
			.addClass('header')
			.appendTo(body)

		for topic in categories then do ->
			dom
				.create('section')
				.attr('id', "menu#{topic}")
				.addClass('item')
				.text(topic)
				.appendTo(body)
				.bind 'click', ->
					Dialogs.build "menu:#{topic.toLowerCase()}"

		dom
			.create('section')
			.attr('id', 'signout')
			.addClass('item')
			.text('Sign out')
			.appendTo(body)
			.bind 'click', =>
				Validator = @require 'Interface/Validator'

				Validator.submitSignout()
