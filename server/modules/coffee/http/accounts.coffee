#### ———————————————————————————————————————
##   Accounts
#### Provides interface to manage accounts
#### ———————————————————————————————————————

module.paths = module.parent.paths

#### ———————————————————————————————————————

DB = require 'db'
UT = require 'utility'

#### ———————————————————————————————————————

online = {}

#### ———————————————————————————————————————

module.exports =

	# • Check if account exists;
	#
	# `username (string)`, `callback (function)`
	checkAccountExistence : (username, callback) ->
		DB.within 'accounts', (array) ->
			callback array.some (account) ->
				account.username is username

	# • Create account in database;
	#
	# `account (account)`*
	createAccount : (account) ->
		log "Creating account: #{account.username} — #{account.password}"

		DB.insert 'accounts', account

	# • Check if details is right;
	#
	# `username (string)`, `password (string)`, `callback (function)`
	checkAccount : (username, password, callback) ->
		DB.within 'accounts', (array) ->
			callback array.some (account) ->
				account.username is username and
				account.password is password

	#### Sessions

	# • Open session for account;
	#
	# `account (account)`
	openSession : (account) ->
		{username} = account

		for sessionID, accountₒ of online
			if username is accountₒ.username
				return sessionID

		sessionID = UT.generateID()

		online[sessionID] = account

		log "Sign in — #{username} with #{sessionID}"

		return sessionID

	# • Check if id of session is actual;
	#
	# `id (string)` —> `(bool)`
	checkActuality : (id) ->
		return !!online[id]

	# • Discover username by id;
	#
	# `id (string)` —> `(string)`
	discoverUsernameById : (id) ->
		if account = online[id]
			return account.username
		else
			log 'DB: Corrupted id #{id}. Interrupting.', 'critical'

			return null

	# • Close session for account with id;
	#
	# `id (string)`
	closeSession : (id) ->
		if online[id]
			log "Sign out — #{id}" ; delete online[id]

# *account — { `username (string)`, `password (string)` }

#### ———————————————————————————————————————