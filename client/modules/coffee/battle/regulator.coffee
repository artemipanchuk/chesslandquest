#### ———————————————————————————————————————
##   Battle/Regulator
#### Provides battle actions
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Battle/Regulator', (exports) ->

	[Controls, Scenes] =
		@require 'Canvas/Controls',
		         'Canvas/Scenes'

	[Board, Units] =
		@require 'Battle/Board',
		         'Battle/Units'

	UnitsMaster =
		@require 'Units/Master'

	Socket =
		@require 'Transport/Socket'

#### ———————————————————————————————————————

	mode = null ; active = null ; next = null

	actions =
		move : (cell, callback) ->
			turn =
				x : cell.x-active.cell.x
				y : cell.y-active.cell.y

			if UnitsMaster.validate active.rank, 'move', turn
				Socket.send 'battle::turn',
					turn : turn
					key  : active.key

				callback active.cell

				mode = false ; active = null ; next = false

		attack : (cell, callback) ->
			turn =
				x : cell.x-active.cell.x
				y : cell.y-active.cell.y

			if UnitsMaster.validate active.rank, 'attack', turn
				Socket.send 'battle::turn',
					turn : turn
					key  : active.key

				callback active.cell

				mode = false ; active = null ; next = false

		change : (target) ->
			active = Units.get 'own', target

#### ———————————————————————————————————————

	exports.start = ->
		mode = false

		Socket.listen 'battle::turn', (turn) ->
			next = true ; return unless turn?

			wait 500, ->
				Board.make turn

		Controls.addMouseAction 'click', (point) ->
			return unless next

			if mode is false
				Board.pick point, (picked) ->
					mode = true ; active = picked
			else
				Board.place active.key, point, (type, argument, callback) ->
					actions[type] argument, callback

	exports.stop = ->
		Socket.disable 'battle::turn'

		Controls.removeMouseAction 'click'