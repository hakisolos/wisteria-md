/** @format */
const { nikka } = require('../lib/cmd');
nikka(
	{
		pattern: 'poll',
		desc: 'Send a poll result',
		category: 'misc',
		react: true,
		public: true,
	},
	async (m, { match }) => {
		await m.sendPollResult({
			name: 'Which is better?',
			values: [
				['Option 1', 1000],
				['Option 2', 2000],
				['Option 3', 1500],
			],
		});
	}
);
