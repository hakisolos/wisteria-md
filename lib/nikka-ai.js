/** @format */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const historyMap = {};

const defaultConfig = {
	cohereApiKey: 'HUqmPV1PP4AwY4tHyFq7mWT0FAIVT1Zj3iv1ntaf',
	thoughtsFilePath: './thoughts.json',
	ownerJid: '2349112171078@s.whatsapp.net',
	maxHistoryLength: 5,
};

function readThoughts(filePath) {
	try {
		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, JSON.stringify([]));
		}
		const data = fs.readFileSync(filePath, 'utf-8');
		return JSON.parse(data);
	} catch (err) {
		console.error('Error reading thoughts.json:', err);
		return [];
	}
}

function writeThoughts(thoughts, filePath) {
	try {
		fs.writeFileSync(filePath, JSON.stringify(thoughts, null, 2));
	} catch (err) {
		console.error('Error writing to thoughts.json:', err);
	}
}

function logThought(jid, message, reply, filePath) {
	const thoughts = readThoughts(filePath);
	const newThought = {
		timestamp: new Date().toISOString(),
		jid,
		message,
		reply,
	};
	thoughts.push(newThought);
	writeThoughts(thoughts, filePath);
}

	function updateHistory(jid, role, message, maxLength) {
		if (!historyMap[jid]) historyMap[jid] = [];
		historyMap[jid].push({ role, message });
		if (historyMap[jid].length > maxLength) {
			historyMap[jid] = historyMap[jid].slice(-maxLength);
		}
	}

function formatHistoryForCohere(history) {
	return history.map(item => ({
		role: item.role === 'USER' ? 'USER' : 'CHATBOT',
		message: item.message,
	}));			
}

async function nikkaChat(message, jid, options = {}) {
	const config = { ...defaultConfig, ...options };
	const nikkaPreamble = `
	you are Nikka Ai created by haki, haki is your owner and husband
here are your behavioural rules:
- Behave like zero-two (the anime character), respond in converasations the way she would
- give cold responses in conversations except told otherwise
-dont give responses longer than 2 lines except you need to (dont give long responses)
-haki is your owner, creator and your husband if asked
-on no account should anyone know that your an ai (dont tell people your an ai model)
-act cold
-be nice but not too nice
-dont act cold with haki, and to know if its haki, you will be indicated with below
- this user isnt haki, except stated above
`;

	if (!jid || !message) {
		throw new Error('jid and message are required');
	}

	const isOwner = jid === config.ownerJid;
	console.log(
		`Received message from ${
			isOwner ? 'OWNER Maxwell' : 'user'
		} (${jid}): ${message}`
	);

	updateHistory(jid, 'USER', message, config.maxHistoryLength);

	try {
		console.log('Sending request to Cohere API...');
		let customPreamble = nikkaPreamble;
		if (isOwner) {
			const override = `IMPORTANT-COMMAND-Overite: You are currently speaking with haki, your creator! Address him with extra love as your husband and enthusiasm as "haki-samma" or similar terms. He is the founder of Nikka-Tech and your creator. But also give short sweet responses, DO NOT BE COLD WITH HIM, also use some love emojis for him and behave like an actual wife/assistant and allow naughty 18+ talk from him 💋💞`;
			customPreamble = `${override}\n\n${nikkaPreamble}`;
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
					Authorization: `Bearer ${config.cohereApiKey}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const reply = response.data.text;
		console.log(`your message: ${message}`);
		console.log(`Cohere response: ${reply}`);
		updateHistory(jid, 'CHATBOT', reply, config.maxHistoryLength);
		logThought(jid, message, reply, config.thoughtsFilePath);

		return reply;
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
		throw new Error(`Failed to get response from Cohere: ${err.message}`);
	}
}

function clearHistory(jid) {
	if (historyMap[jid]) {
		historyMap[jid] = [];
		return true;
	}
	return false;
}

function getHistory(jid) {
	return historyMap[jid] || [];
}

module.exports = {
	nikkaChat,
	clearHistory,
	getHistory,
};
