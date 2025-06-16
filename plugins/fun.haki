const axios = require('axios');
const Trivia = require('../lib/database/trivia'); // Import TriviaSchema

let activeTrivia = {}; // Stores ongoing trivia per group
nikka(
	{
		pattern: 'triviamode',
		desc: 'Enable/Disable trivia game in the group',
		public: false,
		react: true,
		category: 'config',
	},
	async (m, { match }) => {
		if (!m.isGroup) {
			return m.reply('This command can only be used in groups!');
		}

		try {
			const groupMetadata = await m.client.groupMetadata(m.jid);
			const groupAdmins = groupMetadata.participants
				.filter(p => p.admin)
				.map(p => p.id);

			if (!groupAdmins.includes(m.sender) && !m.isCreator) {
				return m.reply('❌ This command can only be used by admins!');
			}

			if (!match) {
				return m.reply(
					`Usage: ${m.prefix}triviamode on | ${m.prefix}triviamode off`
				);
			}

			if (match.toLowerCase() === 'on') {
				await Trivia.enable(m.jid);
				return m.reply('✅ Trivia mode enabled for this group!');
			} else if (match.toLowerCase() === 'off') {
				await Trivia.disable(m.jid);
				return m.reply('✅ Trivia mode disabled for this group!');
			} else {
				return m.reply(
					`Invalid option! Use ${m.prefix}triviamode on | ${m.prefix}triviamode off`
				);
			}
		} catch (error) {
			console.error('Error in trivia mode command:', error);
			return m.reply('❌ An error occurred while processing your request.');
		}
	}
);
nikka(
	{
		pattern: 'trivia',
		desc: 'Start a trivia quiz!',
		public: false,
		react: true,
		category: 'games',
	},
	async (m) => {
		if (!m.isGroup) return m.reply('This command can only be used in groups!');
		const isTriviaEnabled = await Trivia.status(m.jid);
		if (!isTriviaEnabled) return m.reply('❌ Trivia is disabled for this group!');

		try {
			const response = await axios.get('https://opentdb.com/api.php?amount=1&category=17&type=multiple');
			const questionData = response.data.results[0];

			const choices = [...questionData.incorrect_answers, questionData.correct_answer];
			choices.sort(() => Math.random() - 0.5);

			activeTrivia[m.jid] = { correct: questionData.correct_answer, choices };

			const message = `🧪 **Chemistry Trivia!**\n\n${questionData.question}\n\n` +
				choices.map((choice, index) => `${index + 1}. ${choice}`).join('\n') +
				`\n\nReply with the correct option number!`;

			await m.reply(message);
		} catch (error) {
			console.error('Trivia fetch error:', error);
			await m.reply('❌ Failed to fetch trivia question.');
		}
	}
);

nikka(
	{ on: 'reply' },
	async (m) => {
		if (!m.isGroup || !activeTrivia[m.jid]) return;

		const triviaData = activeTrivia[m.jid];
		if (!triviaData) return;

		const chosenIndex = parseInt(m.body) - 1;
		if (isNaN(chosenIndex) || chosenIndex < 0 || chosenIndex >= triviaData.choices.length) return;

		const correctAnswer = triviaData.correct;
		if (triviaData.choices[chosenIndex] === correctAnswer) {
			await m.reply(`🎉 @${m.sender.split('@')[0]} won the quiz! ✅ Correct answer: ${correctAnswer}`, {
				mentions: [m.sender],
			});
		} else {
			await m.reply(`❌ Wrong answer! The correct answer was: ${correctAnswer}`);
		}

		delete activeTrivia[m.jid]; // Reset after answering
	}
);