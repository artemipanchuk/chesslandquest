#### ———————————————————————————————————————
##   ScenesManager
#### Provides interface to manage locations
#### ———————————————————————————————————————

module.paths = module.parent.paths

FS = require 'fs'
UT = require 'utility'

#### ———————————————————————————————————————

# location is global or local scene
locations = [
	'field'
]

# Cached scenes
cached = {}

#### ———————————————————————————————————————

byLine    = /\n/g
bySection = /#.*\n/g
bySpace   = /\s+/g

parse = (content) ->
	sections = content.split(bySection).filter (section) -> section.length isnt 0

	# Parsed data (by order)

	# Public
	matrix   = []
	objects  = []
	markers  = {}

	# Private
	npcs = []

	for line, y in sections[0].split byLine then do ->
		return unless line.length

		matrix[y] = line.split ''

	for line in sections[1].split byLine then do ->
		return unless line.length

		[name, x, y, width, height] = line.split bySpace

		object =
			name : name

			# Object cell
			x : parseInt x
			y : parseInt y

		if width and height
			object.width  = parseInt width
			object.height = parseInt height

		objects.push object

	for line in sections[2].split byLine then do ->
		return unless line.length

		[type, x, y] = line.split bySpace

		marker =
			# Marker cell
			x : (parseInt x)*50
			y : (parseInt y)*50

		markers[type] = marker

	for line in sections[3].split byLine then do ->
		return unless line.length

		[rank, name, from, to, x, y] = line.split bySpace

		npcs.push

			# Quality of army
			rank : rank

			# Name for NPC
			name : name

			# Range of army size in units
			from  : parseInt from
			to    : parseInt   to

			# Spawning point
			x : (parseInt x)*50
			y : (parseInt y)*50

	return {'public' : {matrix, objects, markers}, 'private' : {npcs}}

#### ———————————————————————————————————————

ScenesManager =

	# • Get list of locations names;
	getLocationsList : ->
		return locations

	# • Request location from server fs or active memory;
	#
	# `name (string)`, `callback (function)`
	getGlobalScene : (name , callback) ->
		path = "server/data/scenes/global/#{name}"

		# Checking version key
		UT.version path, (version) ->
			if (not location = cached[name]) or location.version isnt version
				FS.readFile path, 'utf8', (error, content) ->
					data = parse content

					location = cached[name] =
						internal : data.private
						exports  : data.public
						version  : version

					callback location
			else
				callback location

	getBattleScene : ({size}, callback) ->
		objects = []
		matrix  = []

		# Battlefield borders distance
		size += 2

		size.times (x) ->
			matrix[x] ?= []

			size.times (y) ->
				if y<1 or x<1 or y>size-2 or x>size-2
					matrix[x][y] = 'i'
				else
					matrix[x][y] = if (x+y)%2 is 0 then 'd' else 'l'

		callback {matrix, objects}

	getVersion : (name, callback) ->
		path = "server/data/scenes/global/#{name}"

		UT.version path, (actual) ->
			callback actual

#### ———————————————————————————————————————

module.exports = ScenesManager