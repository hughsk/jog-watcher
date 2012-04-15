# jog-watcher

Watches [Jog](http://visionmedia.github.com/jog/) stores for changes and presents them in a clean real-time web interface.

## Installation

``` bash
npm install jog-watcher
```

## Usage

Jog Watcher is essentially a preloaded HTTP server, so you can treat it as so.

``` javascript
var jog = require('jog'),
    store = jog(new jog.FileStore(__dirname + '/log')),
    watcher = require('jog-watcher');

watcher(store).listen(80);
```

You can specify the maximum amount of logs that appear at once using the `size` option:

``` javascript
watcher(store, {
    size: 100
}).listen(80);
```

The design of the page is borrowing heavily from [orderedlist](https://github.com/orderedlist)'s [Minimal](http://orderedlist.github.com/minimal/) Github Pages theme, and all credit goes to [visionmedia](https://github.com/visionmedia) for creating the [original module](http://visionmedia.github.com/jog/).