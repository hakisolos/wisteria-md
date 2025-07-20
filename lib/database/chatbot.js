import { connRedis, client } from "../redis.js";

const CHATBOT = {
	enable: async (jid) => {
		await connRedis();
		await client.hSet(`gc:${jid.split("@")}`, {
			enabled: "true"
		});
	},
	disable: async (jid) => {
		await connRedis();
		await client.hSet(`gc:${jid.split("@")}`, {
			enabled: "false"
		});
	},
	isEnabled: async (jid) => {
		await connRedis();
		const data = await client.hGetAll(`gc:${jid.split("@")}`);
		return data.enabled === "true";
	}
};

export default CHATBOT;
