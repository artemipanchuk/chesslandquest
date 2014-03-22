#### ———————————————————————————————————————
##   Transport/Preloader
#### Resources preloading
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Transport/Preloader', (exports) ->

#### ———————————————————————————————————————

	preloader = null

#### ———————————————————————————————————————

	exports.initialize = (callback) ->

		preloader = new atom.ImagePreloader

			# Now there is the list of all textures to be used in game
			images :

				#### Tiles

				# Suffix number means variation — used for decoration.
				# Suffix "c" means "corner" — used for tile transitions.
				# Suffix "s" means "side"   — used for tile transitions.

				grass0 : 'client/textures/tiles.png [50:50]{0:0}'
				grass1 : 'client/textures/tiles.png [50:50]{1:0}'

				road0 : 'client/textures/tiles.png [50:50]{2:2}'
				road1 : 'client/textures/tiles.png [50:50]{3:2}'
				roadc : 'client/textures/tiles.png [50:50]{2:3}'
				roads : 'client/textures/tiles.png [50:50]{3:3}'

				earth0 : 'client/textures/tiles.png [50:50]{2:0}'
				earth1 : 'client/textures/tiles.png [50:50]{3:0}'
				earthc : 'client/textures/tiles.png [50:50]{2:1}'
				earths : 'client/textures/tiles.png [50:50]{3:1}'

				light  : 'client/textures/tiles.png [50:50]{0:1}'
				lightc : 'client/textures/tiles.png [50:50]{0:3}'
				lights : 'client/textures/tiles.png [50:50]{0:2}'
				dark   : 'client/textures/tiles.png [50:50]{1:1}'
				darkc  : 'client/textures/tiles.png [50:50]{1:3}'
				darks  : 'client/textures/tiles.png [50:50]{1:2}'

				#### Effects

				white : 'client/textures/tiles.png [50:50]{0:4}'

				#### Objects

				# First — single-cell objects (they occupie one cell each)

				tree1 : 'client/textures/objects.png [100:138]{0:0}'
				tree2 : 'client/textures/objects.png [100:138]{1:0}'
				tree3 : 'client/textures/objects.png [100:138]{0:1}'

				# Then — multi-cell objects (they occupie more than one cell each)

				'market-units' : 'client/textures/market.png'

				#### Units

				# Suffix "i" means "icon"
				# Suffix "f" means "figure"

				privatei : 'client/textures/units.png [100:128]{0:0}'
				privatef : 'client/textures/units.png [100:128]{1:0}'

				generali : 'client/textures/character.png'
				generalf : 'client/textures/character.png'

				character : 'client/textures/character.png'

			# Callback passed into arguments
			onReady : callback

	exports.get = (name) ->
		return preloader.get name

#### ———————————————————————————————————————