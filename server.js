var jog = require('jog'),
	watcher = require('./index.js'),
	store = jog(new jog.FileStore(__dirname + '/log'));

var server = watcher(store);

server.on('request', function(req, res) {
	if (
		req.url === '/' &&
		req.headers &&
		req.headers['user-agent']
	) {
		store.debug('Someone just visited this page...');
	}
});

var intervalCount = 0;
setInterval(function() {
	intervalCount += 1;
	store.info('This server has been alive for at least ' + intervalCount + ' hour(s).');
}, 1000 * 60 * 60); // Once an hour...

server.listen(80);