#### ———————————————————————————————————————
##   Game/Battles
#### Provides interface to battle data access
#### ———————————————————————————————————————

module.paths = module.parent.paths

Units = require 'game_units'
NPC   = require 'game_npc'
PC    = require 'game_pc'
AI    = require 'game_ai'

UT    = require 'utility'

#### ———————————————————————————————————————

class ABattle
	exactActionType : ({x, y}, opponent) ->
		switch true
			when @matrix[y]?[x] is null
				return ['move']

			when @sets[opponent][key = @matrix[y]?[x]]?
				return ['attack', key]

			else
				return false

	constructor : ({@type, @sides, @size}) ->
		[initiator, opponent] = @sides ; @sets = {}

		@status = true

		@matrix = []
		@size.times (y) =>
			@matrix[y] = []

			@size.times (x) =>
				@matrix[y][x] = null

		for property, initial of {'casualties' : [], 'points' : 0}
			@[property] = {}
			@[property][opponent ] = initial
			@[property][initiator] = initial

	set : ({set, name}) ->
		if name is @starter
			@sets[name] = set
		else
			{size} = @

			@sets[name] = {}

			for key, {rank, cell} of set
				@sets[name][-key] =
					rank : rank
					cell :
						x : size-cell.x-1
						y : cell.y

	@get 'home', ->
		return do =>
			{size} = @ ; home = []

			size.times (y) ->
				(size/4).times (x) ->
					home.push {x, y}

			return home

class NPCBattle extends ABattle
	generateMachineSet : ->
		name = @sides[1] ; set = {}
		army = NPC.get name, 'army'

		for cell, index in @home
			break if index is army.length

			{x, y} = cell ; x = @size-x-1

			@matrix[y][x] = key = -index-1

			set[key] =
				rank : army[index]
				cell : {x, y}

		@sets[name] = set

	constructor : ({@type, @sides, @size}) ->
		super ; @generateMachineSet()

		@starter = @sides[0]

	set : ({set, name}) ->
		for key, {cell} of set
			@matrix[cell.y][cell.x] = key

		super

		return true

	accept : (name, {key, turn}, callback) ->
		# Cache values
		{rank, cell} = @sets[name][key] ; {size} = @

		# Calculate new coordinaters
		cellₙ =
			x : cell.x+turn.x
			y : cell.y+turn.y

		opponent = @sides[1]

		[action, keyₜ] = @exactActionType cellₙ, opponent

		if rank is 'general'
			status = Units.validateGeneralAction name, turn
		else
			status = Units.validateUnitAction rank, action, turn

		if status is yes
			if action is 'attack'
				{rank:rankₜ} = @sets[opponent][keyₜ]

				@casualties[opponent].push rankₜ

				@points[name] += Units.evaluateUnit rankₜ

				delete @sets[opponent][keyₜ]

				if !Object.keys(@sets[opponent]).length
					@winner = name ; callback() ; return

			@matrix[cell.y][cell.x] = null

			@matrix[cellₙ.y][cellₙ.x] = key
			@sets[name][key].cell = cellₙ

			answer = AI.analyze @

			if answer.result is 'checkmate'
				@winner = opponent ; callback answer ; callback()
			else if answer.result is 'stalemate'
				@winner = no ; callback() ; return
			else
				callback answer

class PCBattle extends ABattle
	constructor : ({@type, @sides, @size}) ->
		super

	set : ({set, name}) ->
		@next ?= @starter ?= name

		for key, {cell} of set
			if name is @starter
				@matrix[cell.y][cell.x] = +key
			else
				@matrix[cell.y][@size-cell.x-1] = -key

		super

		return !!@sets[opponents[name]]

	accept : (name, {key, turn}, callback) ->
		if name is @starter
			keyₙ = +key

			turnₙ =
				x : turn.x
				y : turn.y
		else
			keyₙ = -key

			turnₙ =
				x : -turn.x
				y :  turn.y

		# Cache values
		{rank, cell} = @sets[name][keyₙ] ; {size} = @

		# Calculate new coordinaters
		cellₙ =
			x : cell.x + turnₙ.x
			y : cell.y + turnₙ.y

		opponent = opponents[name]

		[action, keyₜ] = @exactActionType cellₙ, opponent

		if rank is 'general'
			status = Units.validateGeneralAction name, turnₙ
		else
			status = Units.validateUnitAction rank, action, turnₙ

		if status is yes
			if action is 'attack'
				{rank:rankₜ} = @sets[opponent][keyₜ]

				if rankₜ is 'general'
					points = Units.evaluateGeneral name
				else
					points = Units.evaluateUnit rank

				@casualties[opponent].push rankₜ

				@points[name] += points

				if rankₜ is 'general'
					@winner = name ; callback()

			@matrix[cell.y][cell.x]   = null
			@matrix[cellₙ.y][cellₙ.x] = keyₙ

			@sets[name][keyₙ].cell = cellₙ

			callback {turn:turnₙ, key:keyₙ}, opponent

pcs  = []
npcs = []

# Battles by key
battles = {}

# opponent—opponent hash
opponents = {}

# initiator—opponent hash for battles on call
waiting = {}

# Literal for rejected battle call
rejection =
	status : false

max = (a, b) ->
	return if a > b then a else b

exports =
	rejection : rejection

	getOpponent : (name) ->
		return opponents[name] or null

	getWaiter : (who) ->
		whom = waiting[who]
		delete waiting[who]
		return whom

	key : (name) ->
		for key, battle of battles
			if name in battle.sides
				return key

		return null

	get : (key, property) ->
		return battles[key]?[property] or null

	set : (key, property, value) ->
		return battles[key][property] value

	accept : (key, name, data, callback) ->
		battles[key].accept name, data, (next, answer) ->
			callback next, answer

	close : (key, callback) ->
		battle = battles[key]

		{winner} = battle ; sides = {}

		if battle instanceof PCBattle
			for side in battle.sides
				sides[side] =
					'casualties' : casualties = battle.casualties[side]
					'points'     : points     = battle.points[side]

				character = PC.getCharacterByName side

				for dead in casualties
					for unit, index in {army} = character
						if unit is dead
							army.splice index, 1 ; break

				PC.update side, 'army', army
				PC.update side, 'points', character.points+points
		else
			side = battle.sides[0]

			sides[side] =
				'casualties' : casualties = battle.casualties[side]
				'points'     : points     = battle.points[side]

			character = PC.getCharacterByName side

			{army} = character

			for dead in casualties
				for unit, index in army
					if unit is dead
						army.splice index, 1 ; break

			PC.update side, 'army', army
			PC.update side, 'points', character.points+points

		callback sides, winner ; delete battles[key]

	addWaiter : (who, forWhom) ->
		waiting[who] = forWhom

	checkFighters : (initiator, opponent) ->
		return waiting[initiator]? or waiting[opponent]?

	createBattleWithNPC : (pc, npc) ->
		if pc.name in pcs or npc.name in npcs
			return rejection

		#pcs .push  pc.name
		#npcs.push npc.name

		alpha = max pc.army.length+1, npc.army.length

		if alpha < 4
			size = 4
		else
			size = alpha+3-(alpha-1)%4

		return battles[UT.generateID()] = new NPCBattle
			sides : [pc.name, npc.name]
			size  : size

	createBattleWithPC  : (pci, pco) ->
		{name:namei} = pci ; {name:nameo} = pco
		if namei in pcs or nameo in pcs
			return rejection

		opponents[namei] = nameo ; opponents[nameo] = namei

		pcs.push pci.name
		pcs.push pco.name

		alpha = max pci.army.length+1, pco.army.length+1

		if alpha < 4
			size = 4
		else
			size = alpha+3-(alpha-1)%4

		return battles[UT.generateID()] = new PCBattle
			sides : [namei, nameo]
			size  : size

#### ———————————————————————————————————————

module.exports = exports