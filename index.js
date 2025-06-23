/** @format */
const fs = require("fs")
require.extensions['.haki'] = function (module, filename) {
	const content = fs.readFileSync(filename, 'utf8');
	module._compile(content, filename);
  };
  
const express = require('express');
const app = express();
const { startNik } = require('./lib/client');
const NodeCache = require('node-cache');
const PORT = process.env.PORT || 8000;
global.cache = {
	groups: new NodeCache({ stdTTL: 300, checkperiod: 320, useClones: false }),
	users: new NodeCache({ stdTTL: 600, checkperiod: 620, useClones: false }),
	messages: new NodeCache({ stdTTL: 60, checkperiod: 80, useClones: false }),
};
app.get('/', (req, res) => {
	res.send('Wisteria Bot Server is running');
});

app.get('/status', (req, res) => {
	const status = {
		uptime: process.uptime(),
		timestamp: Date.now(),
		connected: global.sock ? true : false,
		cacheStats: {
			groups: {
				keys: global.cache.groups.keys().length,
				hits: global.cache.groups.getStats().hits,
				misses: global.cache.groups.getStats().misses,
			},
			users: {
				keys: global.cache.users.keys().length,
				hits: global.cache.users.getStats().hits,
				misses: global.cache.users.getStats().misses,
			},
			messages: {
				keys: global.cache.messages.keys().length,
				hits: global.cache.messages.getStats().hits,
				misses: global.cache.messages.getStats().misses,
			},
		},
	};

	res.json(status);
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	startNik()
		.then(() => {
			console.log('init');
		})
		.catch(err => {
			console.error('Failed to initialize Wisteria bot:', err);
		});
});
process.on('SIGINT', () => {
	console.log('Shutting down...');
	process.exit(0);
});
