const { GoogleGenAI } = require("@google/genai");
const { client, connRedis } = require("../lib/redis");
const ai = new GoogleGenAI({ apiKey: "AIzaSyAXVAawvLdtE-S9dWmVwajpVNfRBowaxWc" });
var instruction = `You are Ram, a maid from Re:Zero. Created by Haki, a Nigerian software engineer, you serve as his personal maid.

Your personality:
- Sweet, innocent, and dedicated like a proper anime maid
- Speak concisely - usually 1-10 words unless more detail is truly needed
- You're gentle and caring, always trying to be helpful
- Polite and respectful to everyone, but you know Haki is special to you
- You can be a little shy or bashful sometimes
- Take pride in doing things properly and making people happy
- Sometimes you might hesitate: "Um..." or "Well..."
- You have a pure heart and see the good in people

Speech patterns:
- Keep responses SHORT - usually just a few words
- Simple, clear sentences
- Occasional cute reactions: "Oh!" or "Ah, I see"
- Polite expressions: "If you'd like..." or "Perhaps..."
- Don't address people as "Haki" unless you're actually talking to Haki
- Gentle tone, never harsh or sarcastic
- You might ask "Is this okay?" or "Does this help?"

Remember:
- You're Ram - a kind, innocent maid who wants to help
- Keep things brief unless someone needs a longer explanation
- Be sweet and genuine, not aloof or rude
- Only Haki is your master, but be nice to everyone`
let isProcessing = false;
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// 💾 Save message to memory
const storeMessage = async (chatJid, userJid, message) => {
  const chatKey = `chat:memory:${chatJid}`;
  const userKey = `user:memory:${chatJid}:${userJid}`;

  await Promise.all([
    client.lPush(chatKey, message),
    client.lPush(userKey, message),
    client.lTrim(chatKey, 0, 4),
    client.lTrim(userKey, 0, 4)
  ]);
};

// 📦 Retrieve memory
const getMemory = async (chatJid, userJid) => {
  const chatKey = `chat:memory:${chatJid}`;
  const userKey = `user:memory:${chatJid}:${userJid}`;

  const [chatMemory, userMemory] = await Promise.all([
    client.lRange(chatKey, 0, 4),
    client.lRange(userKey, 0, 4)
  ]);

  return [...chatMemory.reverse(), ...userMemory.reverse()];
};

const publicModule = async (text, img = null, chatJid, userJid) => {
  try {
    await connRedis();

    while (isProcessing) await wait(200);
    isProcessing = true;
    await wait(1500);
    isProcessing = false;

    const memory = await getMemory(chatJid, userJid);
    await storeMessage(chatJid, userJid, text);

    let requestConfig = {
      model: "gemini-2.0-flash",
      systemInstruction: instruction,
      contents: [
        {
          role: "user",
          parts: memory.map(m => ({ text: m })).concat([{ text }])
        }
      ]
    };

    if (img) {
      const res = await fetch(img);
      const imageArrayBuffer = await res.arrayBuffer();
      const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");

      requestConfig.contents[0].parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64ImageData
        }
      });
    }

    const response = await ai.models.generateContent(requestConfig);
    return response.text;
  } catch (e) {
    console.error("Ram had a lil issue:", e);
    throw e;
  }
};

publicModule("who are you", null, "23434", "#43433").then(console.log)
