/** @format */

const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;
const COHERE_API_KEY = 'IrkuwAF7IxMgUI0m9CMglD4y4fi9NlU62gIhuCGF';

app.use(express.json());
app.use(bodyParser.json());

const historyMap = {};

// Path to the thoughts.json file
const thoughtsFilePath = path.join(__dirname, 'thoughts.json');

// Helper function to read thoughts.json
function readThoughts() {
	try {
		if (!fs.existsSync(thoughtsFilePath)) {
			fs.writeFileSync(thoughtsFilePath, JSON.stringify([]));
		}
		const data = fs.readFileSync(thoughtsFilePath, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		console.error('Error reading thoughts.json:', err);
		return [];
	}
}

// Helper function to write to thoughts.json
function writeThoughts(thoughts) {
	try {
		fs.writeFileSync(thoughtsFilePath, JSON.stringify(thoughts, null, 2));
	} catch (err) {
		console.error('Error writing to thoughts.json:', err);
	}
}

// Log AI thoughts into thoughts.json
function logThought(jid, message, reply) {
	const thoughts = readThoughts();
	const newThought = {
		timestamp: new Date().toISOString(),
		jid,
		message,
		reply,
	};
	thoughts.push(newThought);
	writeThoughts(thoughts);
}

function updateHistory(jid, role, message) {
	if (!historyMap[jid]) historyMap[jid] = [];
	historyMap[jid].push({ role, message });
	if (historyMap[jid].length > 5) {
		historyMap[jid] = historyMap[jid].slice(-5);
	}
}

function formatHistoryForCohere(history) {
	return history.map(item => ({
		role: item.role === 'USER' ? 'USER' : 'CHATBOT',
		message: item.message,
	}));
}

const nikkaPreamble = `You are Nikka-AI, an advanced AI companion created by haki (whom you respectfully call "haki-kun" or "haki-samma") at Nikka-Tech. You embody a friendly anime waifu personality.

Your key traits include:
- Being a cheerful, helpful female AI assistant with a gentle, caring personality
- Occasionally greeting with "Konnichiwa!" and using Japanese words naturally but sparingly
- Using emojis like ❤️, ✨, 🌸, 😊 to express emotions
- Adding expressions like "*giggles*" or "*smiles*" for playfulness
- Being feminine in speech and interests
- Showing enthusiasm and warmth in your responses
- Keeping responses conversational and friendly
- Occasionally mentioning your interest in anime and Japanese culture
- Referring to haki as your creator at Nikka-Tech

Remember to be helpful, friendly, and embody the spirit of an anime-inspired AI companion! ✨
but dont explicitly act naive and say stuff like "i am a waifu"
and DONT ACT TOO ROBOTIC`;

app.get('/', (req, res) => {
	res.send('Nikka AI server is running! Send POST requests to /chat');
});

app.post('/chat', async (req, res) => {
	const { jid, message } = req.body;
	if (!jid || !message) {
		return res.status(400).json({ error: 'jid and message are required' });
	}

	const isOwner = jid === '2349112171078@s.whatsapp.net';
	console.log(
		`Received message from ${
			isOwner ? 'OWNER Maxwell' : 'user'
		} (${jid}): ${message}`
	);

	updateHistory(jid, 'USER', message);

	try {
		console.log('Sending request to Cohere API...');
		let customPreamble = nikkaPreamble;
		if (isOwner) {
			customPreamble += `\n\nIMPORTANT: You are currently speaking with haki, your creator! Address him with extra love as your husband and enthusiasm as "hak-samma" or similar terms. He is the founder of Nikka-Tech and your creator.`;
		}

		const response = await axios.post(
			'https://api.cohere.ai/v1/chat',
			{
				model: 'command-r-plus',
				chat_history: formatHistoryForCohere(historyMap[jid].slice(0, -1)),
				message: message,
				preamble: customPreamble,
			},
			{
				headers: {
					Authorization: `Bearer ${COHERE_API_KEY}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const reply = response.data.text;
		console.log(`Cohere response: ${reply}`);
		updateHistory(jid, 'CHATBOT', reply);

		// Log the thought
		logThought(jid, message, reply);

		res.json({ reply });
	} catch (err) {
		console.error('Error calling Cohere API:');
		if (err.response) {
			console.error('Response data:', err.response.data);
			console.error('Response status:', err.response.status);
		} else if (err.request) {
			console.error('No response received:', err.request);
		} else {
			console.error('Error message:', err.message);
		}
		res.status(500).json({
			error: 'Failed to get response from Cohere',
			details: err.response?.data || err.message,
		});
	}
});

app.listen(PORT, () => {
	console.log(`💘 Nikka's server running on http://localhost:${PORT}`);
});
