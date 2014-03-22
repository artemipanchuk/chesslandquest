#### ———————————————————————————————————————
##   Game/UnitsMaster
#### Provides interface to manage units
#### ———————————————————————————————————————

module.paths = module.parent.paths

#### ———————————————————————————————————————

PC = require 'game_pc'

FS = require 'fs'
UT = require 'utility'

#### ———————————————————————————————————————

cached = {}
keys   = {}

units = [
	'private',
	'corporal',
	'sergeant',
	'sergeant-major',
	'second-lieutenant',
	'lieutenant',
	'captain',
	'major',
	'colonel',
	'brigadier'
]

count = units.length

byLine    = /\n/g
bySection = /#.*\n/g
bySpace   = /\s+/g

parse = (content) ->
	sections = content.split(bySection).filter (section) -> section.length isnt 0

	stats  = {}
	move   = {}
	attack = {}

	plain  = []

	for line, y in sections[0].split byLine
		continue unless line.length

		[property, value] = line.split bySpace

		stats[property] = (parseInt value) or value

	for line in sections[1].split byLine
		continue unless line.length

		[direction, limit] = line.split bySpace; limit = parseInt limit

		move[direction] = limit

	for line in sections[2].split byLine
		continue unless line.length

		[direction, limit] = line.split bySpace; limit = parseInt limit

		attack[direction] = limit

	if sections[3]?
		for line in sections[3].split byLine
			continue unless line.length

			[x, y] = line.split bySpace

			plain.push [(parseInt x), (parseInt y)]

	return {stats, move, attack, plain}

get = (rank, callback) ->
	path = "server/data/units/#{rank}"

	# Checking version key
	UT.version path, (version) ->
		if (not exports = cached[rank]) or keys[rank] isnt version
			FS.readFile path, 'utf8', (error, content) ->
				cached[rank] = exports = parse content

				calculateUnitActions rank, exports

				callback rank, exports
		else
			callback rank, exports

calculateUnitActions = (rank, imports) ->
	for action in ['move', 'attack']
		turnsₐ = []

		for direction, limit of imports[action]
			for i in [1..limit]
				turnsₐ.push calculateDelta i, direction

		turnsₐ.push imports.plain...

		cached[rank][action] = turnsₐ

calculateDelta = (i, direction) ->
	switch direction
		when 't' then [ i, 0]
		when 'r' then [ 0, i]
		when 'b' then [-i, 0]
		when 'l' then [ 0,-i]

		when 'tr' then [ i, i]
		when 'br' then [-i, i]
		when 'bl' then [-i,-i]
		when 'tl' then [ i,-i]

calculateDeltaVector = (i) ->
	return [
		[ 0,  i],
		[ i,  0],
		[ i,  i],
		[-i, -i],
		[ 0, -i],
		[-i,  0],
		[-i,  i],
		[ i, -i]
	]

have = (argument) ->
	return Array.isArray argument

#### ———————————————————————————————————————

UnitsMaster =

	# • Request unit from server fs or active memory;
	#
	# `rank (string)`, `callback (function)`
	request : (rank , callback) ->
		get rank, callback

	# • Request all units;
	requestAll : (callback) ->
		data = {}

		for unit in units
			get unit, (rank, exports) ->
				data[rank] = exports

				if (summary data) is count
					callback data

	validateUnitAction : (rank, action, {x, y}) ->
		list = turns[rank][action]

		for [xₐ, yₐ] in list
			if xₐ == x and yₐ == y
				return true

		return false

	validateGeneralAction : (name, {x, y}) ->
		PCMaster = require 'game_pc'

		{rank:radius} = PCMaster.getCharacterByName name

		for i in [1..radius]
			for [xₐ, yₐ] in calculateDeltaVector i
				if xₐ == x and yₐ == y
					return true

		return false

	getUnitActions : (rank, action) ->
		if action
			return cached[rank][action]
		else
			return cached[rank]

	getGeneralActions : (name) ->
		{rank:radius} = PC.getCharacterByName name

		actions =
			move   : []
			attack : []

		for i in [1..radius]
			for turn in calculateDeltaVector i
				actions.move.push turn

		actions.attack = actions.move

		return actions

	evaluateUnit : (rank) ->
		return cached[rank].stats.points

	evaluateGeneral : (name) ->
		{rank:n} = PC.getCharacterByName name

		return n*10

#### ———————————————————————————————————————

module.exports = UnitsMaster