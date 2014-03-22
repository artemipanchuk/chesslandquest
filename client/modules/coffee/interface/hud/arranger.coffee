#### ———————————————————————————————————————
##   Interface/HUD/Indicators
#### Provides HUD indicators extension
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Interface/HUD/Arranger', (exports) ->

	Dialogs =
		@require 'Interface/HUD/Dialogs'

	Preloader =
		@require 'Transport/Preloader'

#### ———————————————————————————————————————

	{dom} = atom

	unitsCase = null
	selected  = null
	body      = null
	mode      = false

	store = (name, select) ->
		image = Preloader.get "#{name}i"

		icon = dom(image)
			.addClass(name)
			.appendTo(unitsCase)
			.bind 'click', (event) ->
				deselect()

				icon.addClass 'selected'

				selected = name ; mode = true

		icon.addClass 'selected' if select?

	deselect = ->
		unitsCase
			.find('.selected')
			.removeClass('selected')

		selected = null ; mode = false

#### ———————————————————————————————————————

	exports.destroy = =>
		CanvasControls = @require 'Canvas/Controls'

		body.destroy()

		CanvasControls.removeMouseAction 'click'

	exports.visualize = (status) =>
		body
			.find('.status-indicator')
			.toggleClass('')
			.addClass(if status then 'valid' else 'invalid')

		unless status
			Dialogs.view 'Invalid set', 'yellow'

	exports.build = =>
		CharactersFPPC = @require 'Characters/FPPC'
		CanvasControls = @require 'Canvas/Controls'

		[BattleMaster, BattleBoard] =
			@require 'Battle/Master',
			         'Battle/Board'

		reserve = []
		units   = CharactersFPPC.get 'army'
		self    = CharactersFPPC.get()

		Dialogs.view 'Arrange your units on the board'

		body = dom
			.create('section')
			.attr('id', 'arranger')
			.appendTo(document.body)

		controlCase = dom
			.create('section')
			.addClass('control-case')
			.appendTo(body)

		dom
			.create('button')
			.text('Ready')
			.appendTo(controlCase)
			.bind 'click', ->
				BattleMaster.submit()

		dom
			.create('section')
			.addClass('status-indicator')
			.appendTo(controlCase)

		unitsCase = dom
			.create('section')
			.addClass('units-case')
			.appendTo(body)
			.bind 'mousedown', (event) ->
				deselect() if event.button is 2

		console.dir units

		for rank in units then do ->
			store rank

		store 'general'

		CanvasControls.addMouseAction 'click', (point) ->
			if mode is true
				BattleBoard.place selected, point, (old) ->
					store old if old

					selected = null ; mode = false

					unitsCase
						.find('.selected')
						.destroy()
			else
				BattleBoard.pick point, (picked) ->
					selected = picked; mode = true

					store picked, true

#### ———————————————————————————————————————