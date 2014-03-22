#### ———————————————————————————————————————
##   Interface/Validator
#### Form validation and submission
#### ———————————————————————————————————————

String::toHMAC = (key) ->
	return Crypto.HMAC Crypto.SHA1, @, key

String::toSHA1 = ->
	return Crypto.SHA1 @

#### ———————————————————————————————————————

@define 'Interface/Validator', (exports) ->
	{ajax, cookie, dom} = atom

	# • Verify if form is filled;
	#
	# `form (array)`, `mistakes (array)`
	verifyFullness = (form, mistakes) ->
		form.forEach (field) ->
			if field.value.length is 0
				mistakes.push
					'message'  : 'Must Be Filled'
					'selector' :  field.selector

	# • Verify if fields contain valid characters;
	#
	# `fields (collection)`, `mistakes (array)`
	allowed = /[a-zA-Z\d. ]+/g
	verifyCharacters = (fields, mistakes) ->
		fields.forEach (field) ->
			if field.value.replace(allowed, '').length isnt 0
				mistakes.push
					'message'  : 'Invalid Characters'
					'selector' :  field.selector

	# • Verify if form is filled;
	#
	# `form (array)`, `mistakes (array)`
	verifyFieldMatch = (fields, mistakes) ->
		etalon = fields[0].value

		fields.some (field) ->
			if field.value isnt etalon
				mistakes.push
					'message'  : 'Fields Missmatch'
					'selector' :  field.selector

	# • Verify if date is valid;
	#
	# `field (object)`, `mistakes (array)`
	verifyDateFormat = (field, mistakes) ->
		value = field.value

		if value
			date = new Date value

			date.setDate date.getDate()+1

			if date.toString() is 'Invalid Date' or date > new Date
				mistakes.push
					'message'  : 'Invalid Date'
					'selector' : 'input#formCalendar'

#### ———————————————————————————————————————

	#### Work with forms

	# • Divide form to fields;
	#
	# `form (dom)` —> `(array)`
	divide = (form) ->
		fields = []

		form.find('input').each (element, index) ->
			fields.push
				'selector' : "##{element.id}"
				'value'    : element.value

		return fields

	notify = (form, mistakes) ->
		dom('.fieldMessage').destroy()

		mistakes.forEach (mistake) ->
			messageText = mistake.message
			field       = dom mistake.selector
			element     = field.first

			field.addClass 'invalid'

			message = dom
				.create('section')
				.addClass('message')
				.css(
					'top'  : element.offsetTop-12.5
					'left' : element.offsetLeft+element.offsetWidth+15
				)
				.text(messageText)
				.appendTo(form)

			field.bind 'focus', handler = ->
				field.removeClass 'invalid'

				message.destroy()

				field.unbind 'focus', handler

	getRequest = (url, callback) ->
		ajax
			'method' : 'get'
			'cache'  : 'false'
			'url'    :  url

			onLoad : callback

	postRequest = (url, callback, data = '') ->
		ajax
			'method' : 'post'
			'type'   : 'plain'
			'cache'  : 'false'
			'url'    :  url
			'data'   :  data

			onLoad : callback

	submit = (form, data, url, callback) ->
		digest = (JSON.stringify data).toHMAC(data[0].value)

		data.push digest

		chunk = JSON.stringify data

		ajax
			'method' : 'post'
			'type'   : 'plain'
			'cache'  : 'false'
			'url'    :  url
			'data'   :  chunk

			onLoad : callback

			onError : (xhr) ->
				notify(form, JSON.parse xhr.target.response)

#### ———————————————————————————————————————

	exports.submitSignout = ->
		postRequest '/account/sign-out', (response) ->
			cookie.del 'id'
			cookie.del 'character'

			window.location = '/'

	exports.submitSignin = (form) ->
		data = divide form ; mistakes = []

		verifyFullness   data,    mistakes
		verifyCharacters data, mistakes

		data[1].value = data[1].value.toSHA1()

		if mistakes.length > 0
			notify form, mistakes
		else
			submit form, data, '/account/sign-in', (response) ->
				cookie.set 'id', response

				window.location = '/game'

	exports.submitSignup = (form) ->
		data = divide form ; mistakes = []

		verifyFullness    data,       mistakes
		verifyCharacters  data[0..1], mistakes
		verifyFieldMatch  data[1..2], mistakes
		verifyDateFormat  data[3],    mistakes

		data.splice 2, 1

		data[1].value = data[1].value.toSHA1()

		if mistakes.length > 0
			notify form, mistakes
		else
			submit form, data, '/account/sign-up', (response) ->
				cookie.set 'id', response

				window.location = '/game'

	exports.submitCharacterCreation = (form) =>
		Master = @require 'Master'

		data = divide form ; mistakes = []

		verifyFullness   data, mistakes
		verifyCharacters data, mistakes

		if mistakes.length > 0
			notify form, mistakes
		else
			submit form, data, '/game/create-character', (id) ->
				Master.game id

	exports.submitCharacterSelection = (form) =>
		Master = @require 'Master'

		data = divide form ; mistakes = []

		verifyFullness   data, mistakes
		verifyCharacters data, mistakes

		if mistakes.length > 0
			notify form, mistakes
		else
			submit form, data, '/game/select-character', (id) ->
				Master.game id

#### ———————————————————————————————————————