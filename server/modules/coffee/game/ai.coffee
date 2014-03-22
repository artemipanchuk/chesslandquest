#### ———————————————————————————————————————
##   Game/AI
#### Provides interface to AI
#### ———————————————————————————————————————

module.paths = module.parent.paths

#### ———————————————————————————————————————

Units = require 'game_units'

#### ———————————————————————————————————————

half = 0.5

#### ———————————————————————————————————————

calculateTurns = ({sets, sides, matrix, size, starter}, side) ->
	turns = [] ; [actor, opponent] = [sides[side], sides[1-side]]

	for key, {rank, cell} of sets[actor]
		if rank is 'general'
			{move, attack} = Units.getGeneralActions actor
		else
			{move, attack} = Units.getUnitActions rank

		{x, y} = cell

		isStarter = actor is starter

		move = move.filter ([xₜ, yₜ]) ->
			matrix[y + yₜ]?[x + (if isStarter then +xₜ else -xₜ)] is null

		attack = attack.filter ([xₜ, yₜ]) ->
			sets[opponent][matrix[y + yₜ]?[x + (if isStarter then +xₜ else -xₜ)]]?

		for [xₜ, yₜ] in move
			turns.push
				action : 'move'
				key    : +key
				turn   : [x, y, x + (if isStarter then +xₜ else -xₜ), y+yₜ]

		for [xₜ, yₜ] in attack
			turns.push
				action : 'attack'
				key    : +key
				turn   : [x, y, x + (if isStarter then +xₜ else -xₜ), y+yₜ]

	return turns

calculateState = (state, side = 1) ->
	opposit = 1-side

	{matrix, sides, sets} = state ; [actor, opponent] = [sides[side], sides[opposit]]

	points = 0

	turnsₐ = calculateTurns state, side
	turnsₒ = calculateTurns state, opposit

	for key, {rank} of sets[actor]
		if rank is 'general'
			points += Units.evaluateGeneral actor
		else
			points += Units.evaluateUnit rank

	return points

makeTurn = ({sides, matrix, sets, size, starter}, {action, key, turn}, side) ->
	[actor, opponent] = [sides[side], sides[1-side]] ; [x, y, xₙ, yₙ] = turn

	sets[actor][key].cell = {x:xₙ, y:yₙ}

	if action is 'attack'
		{rank} = sets[opponent][matrix[yₙ][xₙ]]

		delete sets[opponent][matrix[yₙ][xₙ]]

	matrix[y][x] = null ; matrix[yₙ][xₙ] = key

	if action is 'attack'
		return rank

#### ———————————————————————————————————————

module.exports =
	analyze : (state) ->
		turnsₒ = calculateTurns state, 1

		return {result:'stalemate'} if turnsₒ.length == 0

		max = -Infinity ; target = null ; nearest = 1

		analyze = (state, side, depth, index) ->
			return if max == Infinity

			turns = calculateTurns state, side

			if depth == 1 or turns.length == 0
				evaluation = calculateState state

				if depth >= nearest and evaluation >= max
					nearest = depth
					target  = index
					max     = evaluation

				return

			for turn, i in turns
				copy = clone state

				makeTurn copy, turn, side

				analyze copy, 1-side, depth-1, index

		for turnₒ, i in turnsₒ
			copy = clone state

			makeTurn copy, turnₒ, 1

			analyze copy, 1, 5, i

		{action, key, turn} = final = turnsₒ[target]

		rank = makeTurn state, final, 1

		delta =
			x : turn[2]-turn[0]
			y : turn[3]-turn[1]

		{sets, sides, matrix} = state

		if rank is 'general'
			return {key, turn:delta, result:'checkmate'}
		else
			return {key, turn:delta, result:'normal'}

#### ———————————————————————————————————————