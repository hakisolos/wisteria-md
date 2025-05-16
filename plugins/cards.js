/** @format */

const { nikka } = require('../lib');
const { getCardDetailByIndex } = require('../lib/database/cards/func');

nikka(
	{
		pattern: 'card',
		desc: 'get card info',
		public: true,
		react: true,
		use: 'card <index',
		category: 'cards',
	},
	async (m, { match }) => {
		const query = match.trim();

		if (!query)
			return m.reply(
				`hey ${m.pushName}, give me a card index\n eg: ${m.prefix}card 14`
			);
		const details = await getCardDetailByIndex(query);
		const msg = `----- Card Information -----

Name : ${details.title}
Tier : ${details.tier}
Price: ${details.price}
Index: ${details.index}
ID   : ${details.id}

----------------------------`;

		await m.client.sendMessage(m.jid, {
			image: { url: details.imageUrl },
			caption: msg,
		});
	}
);
