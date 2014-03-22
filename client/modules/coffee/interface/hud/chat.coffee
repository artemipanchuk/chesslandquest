#### ———————————————————————————————————————
##   Interface/HUD/Chat
#### Chat extension
#### ———————————————————————————————————————

#### ———————————————————————————————————————

@define 'Interface/HUD/Chat', (exports) ->

	Socket =
		@require 'Transport/Socket'

#### ———————————————————————————————————————

	{dom} = atom

	messages = null
	field    = null
	body     = null
	mode     = null

#### ———————————————————————————————————————

	escape = (string) ->
		if unsafe.test string
			return string.replace unsafe, ''
		else
			return string

	post = (sender, text) ->
		dom
			.create('section')
			.addClass('message')
			.text("#{sender}: #{text}")
			.appendTo messages

	send = ->
		return unless (text = escape field.text()).trim().length

		field.text ''

		post 'Me', text

		Socket.send "chat::#{mode}", text

	listen = (chanel) ->
		Socket.listen "chat::#{chanel}", (message) ->
			post message.name, message.text

	disable = (chanel) ->
		Socket.disable "chat::#{chanel}"

	enable = (chanel) ->
		Socket.enable "chat::#{chanel}"

#### ———————————————————————————————————————

	exports.switch = (place) ->
		body.removeClass 'hidden'

		disable mode

		mode = place

		listen mode

		messages
			.find('*')
			.destroy()

	exports.hide = ->
		body.addClass 'hidden'

	exports.build = (place = 'global')->
		mode = place

		body = dom
			.create('section')
			.attr('id', 'chat')
			.appendTo(document.body)

		dom
			.create('section')
			.addClass('header')
			.appendTo(body)

		messages = dom
			.create('section')
			.addClass('messages')
			.appendTo(body)

		field = dom
			.create('section')
			.addClass('field')
			.attr('contenteditable', 'true')
			.appendTo(body)

		field.bind 'keypress', (event) ->
			if event.keyCode is 13
				send()

		listen mode

#### ———————————————————————————————————————