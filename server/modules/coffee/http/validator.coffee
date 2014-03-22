#### ———————————————————————————————————————
##   RequestDataParser
#### Parses income data and returns status
#### ———————————————————————————————————————

module.paths = module.parent.paths

Accounts = require 'http_accounts'

GameServer = require 'game_server'
PC         = require 'game_pc'

UT = require 'utility'

verifyFormat = (form, n, mistakes) ->
	if form.length isnt n
		mistakes.push
			'message'  : 'Invalid format'
			'selector' :  form[0].selector

		return 'invalid'

verifyFullness = (form, mistakes) ->
	form.forEach (field) ->
		if field.value.length is 0
			mistakes.push
				'message'  : 'Must be filled'
				'selector' :  field.selector

allowed = /[a-zA-Z\d. ]+/g
verifyCharacters = (fields..., mistakes) ->
	fields.forEach (field) ->
		if field.value.replace(allowed, '').length isnt 0
			mistakes.push
				'message'  : 'Invalid characters'
				'selector' :  field.selector

verifyDate = (field, mistakes) ->
	value = field.value

	if value
		date = new Date value

		# UTC fix
		date.setDate date.getDate()+1

		if date.toString() is 'Invalid Date' or date > new Date
			mistakes.push
				'message'  : 'Invalid date'
				'selector' : 'input#formCalendar'

verifyAccountExistence = (field, mistakes, callback) ->
	Accounts.checkAccountExistence field.value, (status) ->
		if status
			mistakes.push
				'message'  : 'Already exists'
				'selector' :  field.selector

		callback()

verifyCharacterExistence = (field, mistakes, callback) ->
	PC.checkCharacterExistence field.value, (status) ->
		if status
			mistakes.push
				'message'  : 'Already exists'
				'selector' :  field.selector

		callback()

verifyCharacterOnwnership = (name, owner, mistakes, callback) ->
	PC.checkCharacterOwnership name.value, owner, (status) ->
		unless status
			mistakes.push
				'message'  : 'Ownership required'
				'selector' :  name.selector

		callback()

verifyHMAC = (form, mistakes) ->
	digest   = form.pop()
	username = form[0].value;

	serverDigest = UT.hash JSON.stringify(form), username

	if serverDigest isnt digest
		mistakes.push
			'message'  : 'Attack detected'
			'selector' :  form[0].selector

verifyAccount = (username, password, mistakes, callback) ->
	Accounts.checkAccount username.value, password.value, (status) ->
		unless status
			mistakes.push
				'message'  : 'Incorrect details'
				'selector' : 'input#formLogin, input#formPassword'

		callback()

Validator =
	parseSignin : (form, callback) ->
		mistakes = []

		format = verifyFormat form, 3, mistakes

		callback mistakes if format is 'invalid'

		[username, password, digest] = form

		verifyHMAC       form, mistakes
		verifyFullness   form, mistakes
		verifyCharacters username, password, mistakes
		verifyAccount    username, password, mistakes, ->
			callback if mistakes.length then mistakes else yes

	parseSignup : (form, callback) ->
		mistakes = []

		format = verifyFormat form, 5, mistakes

		callback mistakes if format is 'invalid'

		[username, password, repeat, date] = form

		verifyHMAC     form, mistakes
		verifyFullness form, mistakes
		verifyCharacters username, password, mistakes
		verifyDate date, mistakes
		verifyAccountExistence username, mistakes, ->
			callback if mistakes.length then mistakes else yes

	parseCharacterCreation : (form, callback) ->
		mistakes = []

		format = verifyFormat form, 2, mistakes

		callback mistakes if format is 'invalid'

		[name] = form

		verifyHMAC       form, mistakes
		verifyFullness   form, mistakes
		verifyCharacters name, mistakes
		verifyCharacterExistence name, mistakes, ->
			callback if mistakes.length then mistakes else yes

	parseCharacterSelection : (form, owner, callback) ->
		mistakes = []

		format = verifyFormat form, 2, mistakes

		callback mistakes if format is 'invalid'

		[name] = form

		verifyHMAC       form, mistakes
		verifyFullness   form, mistakes
		verifyCharacters name, mistakes
		verifyCharacterOnwnership name, owner, mistakes, ->
			callback if mistakes.length then mistakes else yes

#### ———————————————————————————————————————

module.exports = Validator