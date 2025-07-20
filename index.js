/** @format */
import express from 'express'
const app = express();
import { startWisteria } from './lib/client.js'
const PORT = process.env.PORT || 8000;
app.get('/', (req, res) => {
	res.send('Wisteria Bot Server is running');
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	startWisteria()
		.then(() => {
			console.log('Wisteria bot connected successfully');
		})
		.catch(err => {
			console.error('Failed to initialize Wisteria bot:', err);
		});
});
process.on('SIGINT', () => {
	console.log('Shutting down...');
	process.exit(0);
});
