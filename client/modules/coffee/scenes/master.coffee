#### ———————————————————————————————————————
##   Scenes/Master
#### Scenes management
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Scenes/Master', (exports) ->

	[Global, Battle] =
		@require 'Scenes/Global',
		         'Scenes/Battle'

#### ———————————————————————————————————————

	exports.buildGlobalScene = (settings) ->
		if settings?
			Global.build settings
		else
			Global.buildActual()

	exports.buildBattleScene = (settings) ->
		Battle.build settings

#### ———————————————————————————————————————