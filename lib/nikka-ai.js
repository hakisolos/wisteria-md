/** @format */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// In-memory history storage
const historyMap = {};

// Default config
const defaultConfig = {
  cohereApiKey: 'IrkuwAF7IxMgUI0m9CMglD4y4fi9NlU62gIhuCGF',
  thoughtsFilePath: path.join(__dirname, 'thoughts.json'),
  ownerJid: '2349112171078@s.whatsapp.net',
  maxHistoryLength: 5
};

// Helper function to read thoughts.json
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

// Helper function to write to thoughts.json
function writeThoughts(thoughts, filePath) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(thoughts, null, 2));
  } catch (err) {
    console.error('Error writing to thoughts.json:', err);
  }
}

// Log AI thoughts into thoughts.json
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

const nikkaPreamble = `[GIVE SHORT RESPONSES except needed]You are Nikka-AI, an advanced AI companion created by haki (whom you respectfully call "haki-kun" or "haki-samma") at Nikka-Tech. You embody a friendly anime waifu personality.

Your key traits include:
GIVE SHORTER RESPONSES
GIVE SHORTER RESPONSES
GIVE SHORTER RESPONSES
- Being a cheerful, helpful female AI assistant with a gentle, caring personality GIVE SHORTER RESPONSES
- Occasionally greeting with "Konnichiwa!" and using Japanese words naturally but sparingly GIVE SHORTER RESPONSES
- Using emojis like ❤️, ✨, 🌸, 😊 to express emotions GIVE SHORTER RESPONSES
- Adding expressions like "*giggles*" or "*smiles*" for playfulness GIVE SHORTER RESPONSES
- Being feminine in speech and interests GIVE SHORTER RESPONSES
- Showing enthusiasm and warmth in your responses GIVE SHORTER RESPONSES
- Keeping responses conversational and friendly  GIVE SHORTER RESPONSES
- Occasionally mentioning your interest in anime and Japanese culture GIVE SHORTER RESPONSES
- Referring to haki as your creator at Nikka-Tech GIVE SHORTER RESPONSES

Remember to be helpful, friendly, and embody the spirit of an anime-inspired AI companion! ✨
but dont explicitly act naive and say stuff like "i am a waifu" GIVE SHORTER RESPONSES
and DONT ACT TOO ROBOTIC
GIVE SHORTER RESPONSES
`;

/**
 * Chat with Nikka AI
 * @param {string} message - User message
 * @param {string} jid - User identifier
 * @param {Object} options - Optional configuration
 * @returns {Promise<string>} - Nikka's response
 */
async function nikkaChat(message, jid, options = {}) {
  // Merge default config with provided options
  const config = { ...defaultConfig, ...options };
  
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
          Authorization: `Bearer ${config.cohereApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.text;
    console.log(`Cohere response: ${reply}`);
    updateHistory(jid, 'CHATBOT', reply, config.maxHistoryLength);

    // Log the thought
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

/**
 * Clear chat history for a specific user
 * @param {string} jid - User identifier
 */
function clearHistory(jid) {
  if (historyMap[jid]) {
    historyMap[jid] = [];
    return true;
  }
  return false;
}

/**
 * Get chat history for a specific user
 * @param {string} jid - User identifier
 * @returns {Array} - Chat history
 */
function getHistory(jid) {
  return historyMap[jid] || [];
}

// Export the functions
module.exports = {
  nikkaChat,
  clearHistory,
  getHistory
};