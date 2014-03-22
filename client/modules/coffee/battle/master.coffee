#### ———————————————————————————————————————
##   Battle/Master
#### Provides battle management
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Battle/Master', (exports) ->

	[Regulator, Board, Units] =
		@require 'Battle/Regulator',
		         'Battle/Board',
		         'Battle/Units'

	[Arranger, HUD] =
		@require 'Interface/HUD/Arranger',
		         'Interface/HUD/Master'

	Socket =
		@require 'Transport/Socket'

#### ———————————————————————————————————————

	listen = ->
		Socket.listen 'battle::call', (information) ->
			HUD.dialog 'battle::call', information

		Socket.listen 'battle::set', (status) ->
			Arranger.visualize status

		Socket.listen 'battle::start', (set) ->
			Arranger.destroy()

			Board.accept set

			Regulator.start()

#### ———————————————————————————————————————

	engage = ({size}) ->
		Board.configure {size}

#### ———————————————————————————————————————

	exports.startBattle = (battle, callback) ->
		if battle.status is true
			Socket.disable 'battle::call'

			callback() ; engage battle
		else
			HUD.dialog 'battle::reject', battle

	exports.endBattle = (battle, callback) =>
		HUD.dialog 'battle::end', battle, callback

		{result} = battle

		FPPC =
			@require 'Characters/FPPC'

		character = FPPC.get()

		{army, points} = character

		points += result.points

		for dead in result.casualties
			for unit, index in army
				if unit is dead
					army.splice index, 1 ; break

		FPPC.update 'points', points
		FPPC.update 'army', army

		Regulator.stop()

	exports.initialize = ->
		listen()

	exports.submit = ->
		Socket.send 'battle::set', Units.get 'own'