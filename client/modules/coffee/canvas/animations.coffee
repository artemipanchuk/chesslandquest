#### ———————————————————————————————————————
##   Canvas/Animations
#### Provides interface to manage animations
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Canvas/Animations', (exports) ->

	animations = {}
	activated  = {}

	frame = 1000/25

	run = (time, callback) ->
		setInterval callback, time

	stop = (animation) ->
		clearInterval animation

	activate = (target) ->
		return unless (pool = animations[target]) and pool.length

		return if activated[target]

		{pre, tick, finish, length} = pool.shift()

		activated[target] = yes

		progress = 0
		step     = frame/length

		pre step

		animation = run frame, ->
			if progress >= 1
				stop animation

				activated[target] = false

				finish() if typeof finish is 'function'

				activate target

				return

			progress += step

			call tick

#### ———————————————————————————————————————

	exports.create = (target) ->
		animations[target] = []

	exports.reset = (target) ->
		animations[target] = []

	exports.add = (settings) ->
		{target} = settings

		return unless animations[target]

		animations[target].push settings

		activate target