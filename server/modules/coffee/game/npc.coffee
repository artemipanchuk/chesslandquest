#### ———————————————————————————————————————
##   Game/NPC
#### Provides interface to NPCs' data 
#### ———————————————————————————————————————

module.paths = module.parent.paths

Scenes = require 'game_scenes'
Units  = require 'game_units'

#### ———————————————————————————————————————

npcs = {}

#### ———————————————————————————————————————

# • Get random number;
#
# `n (number)` —> `(number)`
rand = (n) ->
	Math.round(Math.random()*n)

create =
	first : ({name, from, to, x, y}, callback) ->
		exact = from+rand(to-from)
		point = {x, y}

		army = []

		exact.times (i) ->
			army.push 'private'

		character = {name, army, point}

		npcs[name] = {character, creational:arguments[0]}

		callback character

#### ———————————————————————————————————————

exports =
	generate : (callback) ->
		locations = Scenes.getLocationsList()

		for location in locations then do ->
			Scenes.getGlobalScene location, ({internal}) ->
				for npc in internal.npcs then do ->
					create[npc.rank] npc, (created) ->
						created.location = location

						callback created

	kill : (name, callback) ->
		create npcs[name].creational, (created) ->
			callback created

	get : (name, property) ->
		if property
			return npcs[name].character?[property] or null
		else
			return npcs[name].character or null

#### ———————————————————————————————————————

module.exports = exports