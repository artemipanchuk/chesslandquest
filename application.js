// Configure require paths
[
	'./lib',
	'./node_modules',
	'./server/submodules',
	'./server/modules/js'
].forEach(function(path) {
	require.main.paths.push(path);
});

var HTTPServer = require('http_server');
var GAMEServer = require('game_server');

GAMEServer.use(HTTPServer);