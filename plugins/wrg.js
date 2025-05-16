/** @format */
const { nikka } = require('../lib/cmd');
const axios = require('axios');

// Word Race Game manager - handles multiple concurrent games across different chats
class WordRaceManager {
	constructor() {
		// Store all active games: Map<groupJID, Map<gameId, GameState>>
		this.games = new Map();

		// Default game timeout (5 minutes of inactivity)
		this.defaultTimeout = 5 * 60 * 1000;

		// Store timeout IDs to clear them when needed
		this.timeouts = new Map();

		// Dictionary API for word validation
		this.dictionaryApiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
	}

	// Create a new game between two players
	createGame(groupJid, player1, player2) {
		// Generate a unique game ID using player JIDs
		const gameId = `${player1}:${player2}`;

		// Initialize group map if needed
		if (!this.games.has(groupJid)) {
			this.games.set(groupJid, new Map());
		}

		const groupGames = this.games.get(groupJid);

		// Check if either player is already in a game in this group
		for (const [existingGameId, game] of groupGames.entries()) {
			if (game.players.includes(player1) || game.players.includes(player2)) {
				return {
					success: false,
					message: `One of the players is already in a game. Please finish that game first.`,
				};
			}
		}

		// Create new game state
		const gameState = {
			players: [player1, player2],
			scores: {
				[player1]: 0,
				[player2]: 0,
			},
			currentPlayer: player1, // Player 1 goes first
			currentChallenge: this.generateChallenge(1), // Start with level 1
			level: 1,
			roundTimeLimit: this.defaultTimeout, // Start with default time
			startTime: Date.now(),
			lastMoveTime: Date.now(),
		};

		// Store the game
		groupGames.set(gameId, gameState);

		// Set game timeout
		this.setGameTimeout(groupJid, gameId);

		return {
			success: true,
			message: `Word Race Game created between @${player1.split('@')[0]} and @${
				player2.split('@')[0]
			}`,
			gameId,
			gameState,
		};
	}

	// Generate a new word challenge based on game level
	generateChallenge(level) {
		// Letters to choose from
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

		// Determine word length based on level (gets harder)
		let wordLength;

		if (level <= 3) {
			// Levels 1-3: 3-5 letter words
			wordLength = level + 2;
		} else if (level <= 6) {
			// Levels 4-6: 6-8 letter words
			wordLength = level + 2;
		} else if (level <= 9) {
			// Levels 7-9: 3-5 letter words but less time
			wordLength = (level % 3) + 3;
		} else {
			// Levels 10+: random length between 3-8
			wordLength = Math.floor(Math.random() * 6) + 3;
		}

		// Choose a random starting letter
		const startingLetter = letters.charAt(
			Math.floor(Math.random() * letters.length)
		);

		return {
			startingLetter,
			wordLength,
			description: `Form a ${wordLength}-letter word starting with '${startingLetter}'`,
		};
	}

	// Make a move in a game (submit a word)
	async makeMove(groupJid, playerId, word) {
		// Validate group exists
		if (!this.games.has(groupJid)) {
			return {
				success: false,
				message: 'No active games in this chat.',
			};
		}

		const groupGames = this.games.get(groupJid);

		// Find the game this player is in
		let gameId = null;
		let gameState = null;

		for (const [id, game] of groupGames.entries()) {
			if (game.players.includes(playerId)) {
				gameId = id;
				gameState = game;
				break;
			}
		}

		// No game found for this player
		if (!gameState) {
			return {
				success: false,
				message:
					"You're not in an active game. Start one by replying to someone with !wrg",
			};
		}

		// Check if it's the player's turn
		if (gameState.currentPlayer !== playerId) {
			return {
				success: false,
				message: "It's not your turn!",
			};
		}

		// Clean and validate the word
		word = word.trim().toUpperCase();

		// Check word meets the challenge requirements
		const challenge = gameState.currentChallenge;

		if (word.length !== challenge.wordLength) {
			return {
				success: false,
				message: `Your word must be exactly ${challenge.wordLength} letters long.`,
			};
		}

		if (!word.startsWith(challenge.startingLetter)) {
			return {
				success: false,
				message: `Your word must start with the letter '${challenge.startingLetter}'.`,
			};
		}

		// Validate that the word is a real word
		try {
			const isValidWord = await this.validateWord(word);

			if (!isValidWord) {
				return {
					success: false,
					message: `'${word}' is not a valid English word.`,
				};
			}
		} catch (error) {
			console.error('Error validating word:', error);
			// If API fails, we'll give benefit of the doubt
		}

		// Word is valid, update the game state

		// Update last move time
		gameState.lastMoveTime = Date.now();

		// Reset the timeout with potentially reduced time
		this.setGameTimeout(groupJid, gameId);

		// Add points based on word length
		gameState.scores[playerId] += word.length;

		// Switch to next player and increase level
		gameState.currentPlayer =
			gameState.players[0] === playerId
				? gameState.players[1]
				: gameState.players[0];
		gameState.level += 1;

		// Generate new challenge
		gameState.currentChallenge = this.generateChallenge(gameState.level);

		// Adjust time limit based on level
		if (gameState.level > 3) {
			// Reduce time by 30 seconds every 3 levels (floor at 30 seconds)
			const reductionFactor = Math.floor(gameState.level / 3);
			gameState.roundTimeLimit = Math.max(
				30 * 1000,
				this.defaultTimeout - reductionFactor * 30 * 1000
			);
		}

		return {
			success: true,
			validWord: word,
			scores: gameState.scores,
			nextPlayer: gameState.currentPlayer,
			nextChallenge: gameState.currentChallenge,
			timeLimit: Math.floor(gameState.roundTimeLimit / 1000), // in seconds
			level: gameState.level,
		};
	}

	// Validate if a word exists in English
	async validateWord(word) {
		try {
			// Using Dictionary API to validate
			const response = await axios.get(
				`${this.dictionaryApiUrl}${word.toLowerCase()}`
			);
			return response.status === 200;
		} catch (error) {
			// Word not found in dictionary
			if (error.response && error.response.status === 404) {
				return false;
			}
			// For other errors, throw to be handled by caller
			throw error;
		}
	}

	// Get current game state for a player
	getGameState(groupJid, playerId) {
		// Check if group exists
		if (!this.games.has(groupJid)) {
			return null;
		}

		const groupGames = this.games.get(groupJid);

		// Find player's game
		for (const [gameId, game] of groupGames.entries()) {
			if (game.players.includes(playerId)) {
				return {
					gameId,
					gameState: game,
				};
			}
		}

		return null;
	}

	// Set a timeout to end inactive games
	setGameTimeout(groupJid, gameId) {
		// Clear existing timeout if any
		if (this.timeouts.has(`${groupJid}:${gameId}`)) {
			clearTimeout(this.timeouts.get(`${groupJid}:${gameId}`));
		}

		// Get the game state
		const groupGames = this.games.get(groupJid);
		const gameState = groupGames.get(gameId);

		// Use the current time limit from game state (changes as game progresses)
		const timeLimit = gameState.roundTimeLimit || this.defaultTimeout;

		// Store timeout info for notifications
		gameState.timeoutInfo = {
			groupJid,
			gameId,
			expiresAt: Date.now() + timeLimit,
		};

		// Set new timeout
		const timeoutId = setTimeout(() => {
			if (this.games.has(groupJid)) {
				const groupGames = this.games.get(groupJid);
				if (groupGames.has(gameId)) {
					// Get the game state before deleting
					const gameState = groupGames.get(gameId);
					const currentPlayer = gameState.currentPlayer;
					const otherPlayer = gameState.players.find(p => p !== currentPlayer);

					// Get scores
					const scores = gameState.scores;

					// Store timeout result for later notification
					this.timeoutResults = this.timeoutResults || [];
					this.timeoutResults.push({
						groupJid,
						winner: otherPlayer,
						loser: currentPlayer,
						scores,
					});

					// Delete the game
					groupGames.delete(gameId);

					// Clean up if no more games in group
					if (groupGames.size === 0) {
						this.games.delete(groupJid);
					}
				}
			}

			this.timeouts.delete(`${groupJid}:${gameId}`);
		}, timeLimit);

		this.timeouts.set(`${groupJid}:${gameId}`, timeoutId);
	}

	// Check for timed out games and notify (call this from the message handler)
	checkTimeouts(m) {
		if (!this.timeoutResults || this.timeoutResults.length === 0) return;

		// Process each timeout result
		for (let i = this.timeoutResults.length - 1; i >= 0; i--) {
			const result = this.timeoutResults[i];

			// Only process timeouts for the current group
			if (result.groupJid === m.jid) {
				// Send timeout notification
				m.client
					.sendMessage(result.groupJid, {
						text: `⏰ Time's up! @${
							result.loser.split('@')[0]
						} took too long to respond.\n\n🏆 @${
							result.winner.split('@')[0]
						} wins with ${result.scores[result.winner]} points!\n@${
							result.loser.split('@')[0]
						} had ${result.scores[result.loser]} points.`,
						mentions: [result.winner, result.loser],
					})
					.catch(err =>
						console.error('Error sending timeout notification:', err)
					);

				// Remove this result
				this.timeoutResults.splice(i, 1);
			}
		}
	}

	// Force end a game
	endGame(groupJid, playerId) {
		// Check if group exists
		if (!this.games.has(groupJid)) {
			return {
				success: false,
				message: 'No active games in this chat.',
			};
		}

		const groupGames = this.games.get(groupJid);

		// Find player's game
		let gameId = null;
		let gameState = null;

		for (const [id, game] of groupGames.entries()) {
			if (game.players.includes(playerId)) {
				gameId = id;
				gameState = game;
				break;
			}
		}

		// No game found for this player
		if (!gameState) {
			return {
				success: false,
				message: "You're not in an active game.",
			};
		}

		// Get opponent
		const opponent =
			gameState.players[0] === playerId
				? gameState.players[1]
				: gameState.players[0];

		// Get scores
		const scores = gameState.scores;

		// End the game
		groupGames.delete(gameId);

		// Clear timeout
		if (this.timeouts.has(`${groupJid}:${gameId}`)) {
			clearTimeout(this.timeouts.get(`${groupJid}:${gameId}`));
			this.timeouts.delete(`${groupJid}:${gameId}`);
		}

		// Clean up if no more games in group
		if (groupGames.size === 0) {
			this.games.delete(groupJid);
		}

		return {
			success: true,
			message: `Game ended by @${playerId.split('@')[0]}.\n\nFinal scores:\n@${
				playerId.split('@')[0]
			}: ${scores[playerId]} points\n@${opponent.split('@')[0]}: ${
				scores[opponent]
			} points`,
			opponent,
			scores,
		};
	}
}

// Create a global game manager instance
const wordRaceManager = new WordRaceManager();

// We'll use a different approach for timeout handling
// since nikka.on() isn't available in the plugin structure

// Command to start a new game
nikka(
	{
		pattern: 'wrg',
		desc: 'Start a Word Race Game with another user',
		usage: '!wrg (reply to a user)',
		category: 'games',
		react: true,
		public: true,
	},
	async m => {
		try {
			// Must be in a group
			if (!m.isGroup) {
				return await m.reply('Word Race Game can only be played in groups!');
			}

			// Must be a reply to someone
			if (!m.quoted) {
				return await m.reply('Reply to someone to start a game with them!');
			}

			// Cannot play with yourself
			if (m.quoted.sender === m.sender) {
				return await m.reply('You cannot play with yourself!');
			}

			// Create new game
			const result = wordRaceManager.createGame(
				m.jid,
				m.sender,
				m.quoted.sender
			);

			if (!result.success) {
				return await m.reply(result.message);
			}

			// Send game start message with @mentions
			await m.client.sendMessage(m.jid, {
				text: `🎮 *WORD RACE GAME* 🎮\n\n${
					result.message
				}\n\n🏁 Game started! Level: 1\n\nChallenge for @${
					result.gameState.currentPlayer.split('@')[0]
				}:\n${
					result.gameState.currentChallenge.description
				}\n\nTime limit: 5 minutes\n\nTo make a move, reply with a valid word.`,
				mentions: [m.sender, m.quoted.sender],
			});
		} catch (error) {
			console.error('Error in Word Race Game start:', error);
			await m.reply('❌ Error starting the game. Please try again.');
		}
	}
);

// Command to end a game
nikka(
	{
		pattern: 'wrgend',
		desc: 'End your current Word Race Game',
		usage: '!wrgend',
		category: 'games',
		react: true,
		public: true,
	},
	async m => {
		try {
			// End the game
			const result = wordRaceManager.endGame(m.jid, m.sender);

			if (!result.success) {
				return await m.reply(result.message);
			}

			// Send game end notification with mentions
			await m.client.sendMessage(m.jid, {
				text: result.message,
				mentions: [m.sender, result.opponent],
			});
		} catch (error) {
			console.error('Error ending Word Race Game:', error);
			await m.reply('❌ Error ending the game. Please try again.');
		}
	}
);

// Listen for word submissions
nikka(
	{
		on: 'reply',
	},
	async m => {
		try {
			// Check for any timed out games
			wordRaceManager.checkTimeouts(m);

			// Only process if the user is in a game
			const gameInfo = wordRaceManager.getGameState(m.jid, m.sender);
			if (!gameInfo) return; // Not in a game, no need to respond

			// The submitted word is in the message body
			const word = m.body.trim();

			// Skip if not a word (at least 2 characters and no spaces)
			if (word.length < 2 || /\s/.test(word)) return;

			// Make move with the submitted word
			const moveResult = await wordRaceManager.makeMove(m.jid, m.sender, word);

			if (!moveResult.success) {
				// Just reply privately to the user with the error
				return await m.reply(moveResult.message);
			}

			// Handle successful move
			await m.client.sendMessage(m.jid, {
				text: `🎮 *WORD RACE GAME* 🎮\n\n✅ @${
					m.sender.split('@')[0]
				} submitted: "${moveResult.validWord}"\n\n📊 Scores:\n@${
					gameInfo.gameState.players[0].split('@')[0]
				}: ${moveResult.scores[gameInfo.gameState.players[0]]} points\n@${
					gameInfo.gameState.players[1].split('@')[0]
				}: ${
					moveResult.scores[gameInfo.gameState.players[1]]
				} points\n\n🆙 Level: ${moveResult.level}\n\n🎯 New challenge for @${
					moveResult.nextPlayer.split('@')[0]
				}:\n${moveResult.nextChallenge.description}\n\n⏱️ Time limit: ${
					moveResult.timeLimit
				} seconds`,
				mentions: gameInfo.gameState.players,
			});
		} catch (error) {
			console.error('Error processing Word Race Game move:', error);
		}
	}
);
