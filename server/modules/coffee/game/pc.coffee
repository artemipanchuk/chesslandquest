#### ———————————————————————————————————————
##   PC
#### Player characters management
#### ———————————————————————————————————————

module.paths = module.parent.paths

Accounts = require 'http_accounts'

DB = require 'db'
UT = require 'utility'

#### ———————————————————————————————————————

# Hash of all online characters
online = {}

# Hash table "name—id" for online characters
table = {}

defaults =
	location  : 'field'

	points : 0
	rank   : 1

	army      : []
	inventory : []

#### ———————————————————————————————————————

module.exports =

	# • Check if character exists;
	#
	# `name (string)`, `callback(function)`
	checkCharacterExistence : (name, callback) ->
		DB.within 'characters', (array) ->
			callback array.some (character) ->
				character.name is name

	# • Check if owner is real;
	#
	# `name (string)`, `owner (string)`, `callback(function)`
	checkCharacterOwnership : (name, owner, callback) ->
		DB.within 'characters', (array) ->
			callback array.some (character) ->
				character.name  is name and
				character.owner is owner

	# • Create character in database;
	#
	# `character (object)`
	createCharacter : (character) ->
		log "Creating character: #{character.name} — #{character.owner}"

		for property, value of defaults
			character[property] = value

		DB.insert 'characters', character

	#### Getters

	# • Get character by owner's username;
	#
	# `username (string)`
	getCharactersByOwner : (username, callback) ->
		targets = []

		DB.within 'characters', (array) ->
			for character in array
				if character.owner is username
					targets.push character

			callback targets

	# • Get character by it's name (passive or active);
	#
	# `name (string)`, `callback (function)`*
	getCharacterByName : (name, callback) ->
		unless callback?
			return online[table[name]]

		DB.within 'characters', (array) ->
			for character in array
				if character.name is name
					callback character

	# • Get online character by it's id;
	#
	# `name (string)`
	getCharacterById : (id) ->
		if character = online[id]
			return character
		else
			log "DB: Corrupted character. Interrupting.", 'critical'

			return null

	# • Get online character by it's id;
	#
	# `name (string)`
	getCharacterNameById : (id) ->
		if character = online[id]
			return character.name
		else
			log "DB: Corrupted character. Interrupting.", 'critical'

			return null

	#### Internal mechanix

	update : (name, field, value) ->
		character = online[table[name]]

		character[field] = value

		DB.update 'characters', {name}, character

	# • Select character for account to use;
	#
	# `name (string)`, `callback (function)`
	selectCharacter : (name, callback) ->
		target = null

		DB.within 'characters', (array) ->
			for character in array
				if character.name is name
					target = character ; break

			id = UT.generateID()

			online[id] = target

			table[name] = id

			log "Select — #{name} with #{id}"

			callback id

	# • Deselect character by id;
	#
	# `id (string)` (id is character id)
	deselectCharacter : (id) ->
		if online[id]
			delete online[id]

			log "Deselect — #{id}"
		else
			log "DB: Corrupted character. Interrupting.", 'critical'

			return null

#### ———————————————————————————————————————