#### ———————————————————————————————————————
##   Interface/HUD/Master
#### HUD management
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Interface/HUD/Master', (exports) ->

	Dialogs =
		@require 'Interface/HUD/Dialogs'

	Extensions = [Arranger, Menu, Chat] =
		@require 'Interface/HUD/Arranger',
		         'Interface/HUD/Menu',
		         'Interface/HUD/Chat'

#### ———————————————————————————————————————

	exports.build = ->
		E.build() for E in [Menu, Chat]

	exports.switch = (settings) ->
		switch settings.mode
			when 'battle'
				Dialogs .clean()
				Arranger.build()

				Menu.switch 'battle'

				if settings.type is 'pc'
					Chat.switch 'battle'
				else
					Chat.hide()

			when 'global'
				Menu.switch 'global'
				Chat.switch 'global'

	exports.dialog = (type, settings, callback) ->
		Dialogs.build type, settings, callback