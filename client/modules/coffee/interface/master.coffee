#### ———————————————————————————————————————
##   Interface/Master
#### Provides interface management
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Interface/Master', (exports) ->

	[Preparer, HUD] =
		@require 'Interface/Preparer',
		         'Interface/HUD/Master'

#### ———————————————————————————————————————

	level = null

#### ———————————————————————————————————————

	exports.preparePreparationInterface = ->
		return if level is 'preparer'

		Preparer.build()

		level = 'preparer'

	exports.prepareHUD = (callback) ->
		if level is 'hud'
			callback() ; return

		Preparer.clean ->
			callback()

		HUD.build()

		level = 'hud'

	exports.switchHUD = (settings) ->
		HUD.switch settings

#### ———————————————————————————————————————