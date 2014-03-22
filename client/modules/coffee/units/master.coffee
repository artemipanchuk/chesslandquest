#### ———————————————————————————————————————
##   Units/Master
#### Provides units logical data management
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Units/Master', (exports) ->

	Socket =
		@require 'Transport/Socket'

	FPPC =
		@require 'Characters/FPPC'

#### ———————————————————————————————————————

	units = {}

#### ———————————————————————————————————————

	delta = (i, direction) ->
		switch direction
			when 't' then [ i, 0]
			when 'r' then [ 0, i]
			when 'b' then [-i, 0]
			when 'l' then [ 0,-i]

			when 'tr' then [ i, i]
			when 'br' then [-i, i]
			when 'bl' then [-i,-i]
			when 'tl' then [ i,-i]

	have = (argument) ->
		return Array.isArray argument

#### ———————————————————————————————————————

	exports.initialize = ->
		# Request all units logical data
		Socket.send 'units', null

		# Store logical data on response
		Socket.listen 'units', (data) ->
			units = data

	exports.provide = ->
		return {units}

	exports.evaluate = (rank) ->
		return units[rank].stats.points

	exports.validate = (rank, action, {x, y}) ->
		if rank is 'general'
			for [xₐ, yₐ] in FPPC.calculate action
				if xₐ == x and yₐ == y
					return true
		else
			for [xₐ, yₐ] in units[rank][action]
				if xₐ == x and yₐ == y
					return true

		return false

#### ———————————————————————————————————————