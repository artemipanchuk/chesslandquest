#### ———————————————————————————————————————
##   Interface/HUD/Dialogs
#### Provides HUD dialogs extension
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Interface/HUD/Dialogs', (exports) ->

	Socket =
		@require 'Transport/Socket'

	Templator =
		@require 'Interface/Templator'

#### ———————————————————————————————————————

	{dom} = atom

	{body} = dom()

#### ———————————————————————————————————————

	body.delegate '.close', 'click', ->
		clean()

	body.delegate '.unit-item', 'click', (event) =>
		FPPC =
			@require 'Characters/FPPC'

		{target} = event

		rank = target
			.parentElement
			.id

		coll = dom target
		cost = parseInt dom(target)
			.get()
			.nextSibling
			.textContent

		if coll.hasClass 'lack'
			return

		points = FPPC.get 'points'
		army   = FPPC.get 'army'

		points -= cost ; army.push rank

		FPPC.update 'points', points
		FPPC.update 'army', army

		dom('.dialog')
			.find('.unit-item')
			.each (element) ->
				tr = element.parentElement

				cost = parseInt element
					.nextSibling
					.textContent

				if cost > points
					dom(tr)
						.addClass 'lack'

		Socket.send 'transaction::unit', rank

	Socket.listen 'transaction::unit', (status) ->


#### ———————————————————————————————————————

	wrap = (code) ->
		dom
			.create('section')
			.html(code)
			.find('.dialog')
			.appendTo(body)

	dialogs =
		'wait' : ->
			dialog = dom
				.create('section')
				.addClass('wait dialog')
				.appendTo(body)

			dom
				.create('h2')
				.text('Please, wait')
				.appendTo(dialog)

		'place' :
			'market-units' : =>
				Templator.provide 'dialog::market-units', (code) =>
					wrap code

					FPPC =
						@require 'Characters/FPPC'

					{points} = FPPC.get()

					dom('.dialog')
						.find('.unit-item')
						.each (element) ->
							tr = element.parentElement

							cost = parseInt element
								.nextSibling
								.textContent

							if cost > points
								dom(tr)
									.addClass 'lack'

		'menu' :
			'experience' : ->

			'inventory' : ->

			'army' : ->

		'character' :
			'npc' : ({name}) =>
				CharactersNPC =
					@require 'Characters/NPC'

				opponent = CharactersNPC.get name

				dialog = dom
					.create('section')
					.addClass('npc dialog')
					.appendTo(document.body)

				dom
					.create('h2')
					.text("#{name.ucfirst()} the Computer")
					.appendTo(dialog)

				sectionUnits = dom
					.create('section')
					.addClass('units-case')
					.appendTo(dialog)

				dom
					.create('button')
					.addClass('close')
					.text('Close')
					.appendTo(dialog)
					.bind 'click', ->
						dialog.destroy()

				dom
					.create('button')
					.addClass('fight')
					.text('Fight!')
					.appendTo(dialog)
					.bind 'click', =>
						Socket.send 'battle::call',
							type : 'npc'
							name : name

						dialog.destroy()

						build 'wait'

				units = {}
				for uname in opponent.army
					units[uname] ?= 0 ; ++units[uname]

				for unit, quantity of units
					dom
						.create('span')
						.addClass('rank')
						.text(unit)
						.appendTo(sectionUnits)

					dom
						.create('span')
						.addClass('quantity')
						.text(quantity)
						.appendTo(sectionUnits)

			'tppc' : ({name}) =>
				CharactersTPPC =
					@require 'Characters/TPPC'

				opponent = CharactersTPPC.get name

				console.dir opponent

				dialog = dom
					.create('section')
					.addClass('tppc dialog')
					.appendTo(document.body)

				dom
					.create('h2')
					.text("General #{name.ucfirst()}")
					.appendTo(dialog)

				sectionUnits = dom
					.create('section')
					.addClass('units-case')
					.appendTo(dialog)

				dom
					.create('button')
					.addClass('close')
					.text('Close')
					.appendTo(dialog)
					.bind 'click', ->
						dialog.destroy()

				dom
					.create('button')
					.addClass('fight')
					.text('Fight')
					.appendTo(dialog)
					.bind 'click', =>
						Socket.send 'battle::call',
							type : 'tppc'
							name : name

						dialog.destroy()

						build 'wait'

				units = {}

				units.general = "#{name.ucfirst()} of #{opponent.experience.rank}"

				for unit in opponent.army
					units[unitName = unit.stats.name] ?= 0
					++units[unitName]

				for unit, quantity of units
					dom
						.create('span')
						.addClass('rank')
						.text(unit)
						.appendTo(sectionUnits)

					dom
						.create('span')
						.addClass('quantity')
						.text(quantity)
						.appendTo(sectionUnits)

		'battle' :
			'reject' : ->
				clean()

				dialog = dom
					.create('section')
					.addClass('battle-reject dialog')
					.appendTo(document.body)

				dom
					.create('h2')
					.addClass('headerMessage')
					.text('Sorry, your battle call was rejected')
					.appendTo(dialog)

				dom
					.create('button')
					.addClass('close')
					.text('Close')
					.appendTo(dialog)
					.bind 'click', ->
						dialog.destroy()

			'call' : ({name}) =>
				CharactersTPPC =
					@require 'Characters/TPPC'

				opponent = CharactersTPPC.get name

				dialog = dom
					.create('section')
					.addClass('battle-call dialog')
					.appendTo(document.body)

				dom
					.create('h2')
					.text("General #{name.ucfirst()} is calling you for a battle")
					.appendTo(dialog)

				sectionUnits = dom
					.create('section')
					.addClass('units-case')
					.appendTo(dialog)

				dom
					.create('button')
					.addClass('reject')
					.text('Reject')
					.appendTo(dialog)
					.bind 'click', ->
						dialog.destroy()

						Socket.send 'battle::answer', no

				dom
					.create('button')
					.addClass('accept')
					.text('Accept')
					.appendTo(dialog)
					.bind 'click', =>
						dialog.destroy()

						build 'wait'

						Socket.send 'battle::answer', yes

				units = {}

				units.general = "#{name.ucfirst()} of #{opponent.experience.rank}"

				for unit in opponent.army
					units[unitName = unit.stats.name] ?= 0
					++units[unitName]

				for unit, quantity of units
					dom
						.create('span')
						.addClass('rank')
						.text(unit)
						.appendTo(sectionUnits)

					dom
						.create('span')
						.addClass('quantity')
						.text(quantity)
						.appendTo(sectionUnits)

			'end' : ({reason, result}, callback) ->
				dialog = dom
					.create('section')
					.addClass('battle-end dialog')
					.appendTo(document.body)

				dom
					.create('h2')
					.text("#{reason.ucfirst()}!")
					.appendTo(dialog)

				{points, casualties} = result

				units = {}

				dom
					.create('p')
					.addClass('points-case')
					.text("Gained points: #{points}")
					.appendTo(dialog)

				for unit in casualties
					units[unit] ?= 0
					++units[unit]

				sectionUnits = dom
					.create('section')
					.addClass('units-case')
					.appendTo(dialog)

				for unit, quantity of units
					dom
						.create('span')
						.addClass('rank')
						.text(unit)
						.appendTo(sectionUnits)

					dom
						.create('span')
						.addClass('quantity')
						.text(quantity)
						.appendTo(sectionUnits)

				dom
					.create('button')
					.addClass('accept')
					.text('Accept')
					.appendTo(dialog)
					.bind 'click', =>
						dialog.destroy()

						callback()

#### ———————————————————————————————————————

	exports.clean = clean = ->
		dom('section.dialog')
			.destroy()

	byColon = '::'
	exports.build = build = (type, settings, callback) ->
		depth = type.split byColon

		if depth.length is 1
			dialogs[type]? settings, callback
		else
			dialogs[depth[0]][depth[1]]? settings, callback

	exports.view = (text, exact) ->
		h1 = dom
			.create('h1')
			.text(text)
			.appendTo(document.body)

		h1.addClass exact if exact?

		wait 2000, ->
			h1.addClass 'vanishing'
			wait 750, ->
				h1.destroy()

	exports.destroy = destroy = (type) ->
		dom('section.dialog.#{type}')
			.destroy()

#### ———————————————————————————————————————