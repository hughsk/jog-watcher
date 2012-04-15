var socketio = require('socket.io'),
	nStatic = require('node-static'),
	connect = require('connect'),
	marked = require('marked'),
	events = require('events'),
	http = require('http'),
	jog = require('jog'),
	fs = require('fs'),
	_ = require('underscore');

var createServer, Watcher, template = require('./template.js');

/**
 * Creates an HTTP server, ready to listen on your port of choice.
 * 
 * @param  {Mixed}  stores  The Jog Stores to listen to. Can be a single store instance or an array.
 * @param  {Object} options The options to pass to the server. Currently only `size`.
 * @return {HttpServer}     An instance of http.HttpServer.
 */
createServer = module.exports = function(stores, options) {
	var watcher,
		staticServer = new nStatic.Server(__dirname + '/../public'),
		readme = marked(fs.readFileSync(__dirname + '/../README.md', 'utf8'))
			.replace(/\<h1\>.*?\<\/h1\>/, ''); // Remove the first header

	var server = http.createServer(function(req, res) {
		req.once('end', function() {
			staticServer.serve(req, res, function(e) {
				res.end(
					template({
						queue: watcher.queue,
						limit: watcher.options.size,
						total: watcher.total,
						readme: readme,
						bodyTemplate: template['body-template']
					})
				);
			});
		});
	});

	var io = socketio.listen(server, { log: false });

	watcher = new Watcher(stores, io, options);
	return server;
};

module.exports.createServer = module.exports;

/**
 * Watches a set of stores, emitting log events through to socket.io
 * 
 * @param {Mixed}           stores   The store(s) to listen to.
 * @param {SocketNamespace} io       Socket.io Namespace to send events to.
 * @param {Object}          options  Options inherited from `createServer`
 */
Watcher = module.exports.Watcher = function(stores, io, options) {
	var self = this;

	if (!(this instanceof Watcher)) {
		return new Watcher(stores, options);
	}

	// Support multiple stores in an array
	if (!Array.isArray(stores)) {
		stores = [stores];
	}
	this.stores = stores;

	// Options are... optional.
	this.options = _(options || {}).defaults({
		'size': 50 // The maximum amount of logs to display on the page at once
	});

	this.queue = [];
	this.total = 0;
	this.io = io;

	// Listen to each of the stores, adding logs to the queue as
	// they appear.
	_(this.stores).each(function(store, key) {
		store.stream({ end: false, interval: 500 })
			.on('data', function(data) {
				self.enqueue(data);
				self.emit('data', data, store);
			});
	}, this);
};
Watcher.prototype = new events.EventEmitter();

/**
 * Add an item to the queue, which is limited in size
 * by `options.size`. Emits to socket.io with each new entry.
 * 
 * @param  {Object} data JSON log data from Jog.
 */
Watcher.prototype.enqueue = function(data) {
	this.queue.unshift(data);
	this.total += 1;
	this.io.sockets.emit('data', data);
	if (this.queue.length > this.options.size) {
		this.queue.pop();
	}
	return this;
};
