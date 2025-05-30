/** @format */

const { Groq } = require('groq-sdk') 

const groq = new Groq({
	apiKey: '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',
});

const chatHistories = {};
 async function handleMessage(
	chatId,
	userId,
	messageText,
	imageUrl = null
) {
	const historyKey = `${chatId}_${userId}`;

	if (!chatHistories[historyKey]) {
		chatHistories[historyKey] = [
			{
				role: 'system',
				content: 'You are a helpful assistant in love with HaKi 🥰',
			},
		];
	}

	const userContent = [];

	if (messageText) {
		userContent.push({
			type: 'text',
			text: messageText,
		});
	}

	if (imageUrl) {
		userContent.push({
			type: 'image_url',
			image_url: {
				url: imageUrl,
			},
		});
	}

	chatHistories[historyKey].push({
		role: 'user',
		content: userContent,
	});

	const chatCompletion = await groq.chat.completions.create({
		messages: chatHistories[historyKey],
		model: 'meta-llama/llama-4-scout-17b-16e-instruct',
		temperature: 1,
		max_completion_tokens: 1024,
	});

	const reply = chatCompletion.choices[0].message.content;

	chatHistories[historyKey].push({
		role: 'assistant',
		content: reply,
	});

	return reply;
}
