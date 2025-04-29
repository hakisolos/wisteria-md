/** @format */

const axios = require('axios');

const AI = {
	async gemini(query) {
		try {
			const response = await axios.get(
				`https://nikka-api.vercel.app/ai/gemini?q=${encodeURIComponent(
					query
				)}&apiKey=nikka`
			);
			return response.data.response;
		} catch (error) {
			console.error('Error fetching Gemini API response:', error.message);
			return 'An error occurred while fetching the response.';
		}
	},

	async groq(query) {
		try {
			const response = await axios.get(
				`https://nikka-api.vercel.app/ai/groq?q=${encodeURIComponent(
					query
				)}&apiKey=nikka`
			);
			return response.data.data;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async llama(query) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/llama?q=${encodeURIComponent(query)}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async meta(query) {
		try {
			const response = await axios.get(
				`https://apii.ambalzz.biz.id/api/openai/meta-ai?ask=${encodeURIComponent(
					query
				)}`
			);
			return response.data.r.meta;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async dalle(prompt) {
		try {
			return `https://bk9.fun/ai/magicstudio?prompt=${encodeURIComponent(
				prompt
			)}`;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async gpt(query, userId) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/GPT4o?q=${encodeURIComponent(
					query
				)}&userId=${userId}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async claude(query, userId) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/Claude-Opus?q=${encodeURIComponent(
					query
				)}&userId=${userId}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async hakiu(query, userId) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/Claude-Haiku?q=${encodeURIComponent(
					query
				)}&userId=${userId}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async shaka(query) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/chataibot?q=${encodeURIComponent(query)}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async nikka(query) {
		try {
			const response = await axios.get(
				`https://nikka-api.vercel.app/ai/nikka?q=${encodeURIComponent(query)}`
			);
			return response.data.data;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async jeevs(query) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/jeeves-chat?q=${encodeURIComponent(query)}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async maths(query) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/mathssolve?q=${encodeURIComponent(query)}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async flux(query) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/fluximg?q=${encodeURIComponent(query)}`
			);
			return response.data.BK9[0];
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async blackbox(query) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/blackbox?q=${encodeURIComponent(query)}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},

	async you(query) {
		try {
			const response = await axios.get(
				`https://bk9.fun/ai/you?q=${encodeURIComponent(query)}`
			);
			return response.data.BK9;
		} catch (error) {
			console.log(error);
			return error;
		}
	},
};

module.exports = AI;
