/** @format */
const { isChatbotEnabled } = require("../lib/database/chatbot");
const { nikka } = require("../lib");
const config = require("../config");
const { nikkaChat, clearHistory, getHistory } = require("../lib/nikka-ai");

nikka(
  {
    on: "reply",
  },
  async (m, { eventType }) => {
    try {
      if (m.fromMe) return;
      if (m.body.startsWith("?")) return;

      const chatbotEnabled = await isChatbotEnabled(m.jid);
      if (!chatbotEnabled) return;

      const userMessage = m.body;
      if (!userMessage) return;

      await m.client.sendPresenceUpdate("typing", m.jid);

      const senderNumber = m.sender.split("@")[0];
      const isOwner =
        config.OWNER === senderNumber ||
        (config.SUDO && config.SUDO.includes(senderNumber));

      try {
        const response = await nikkaChat(userMessage, m.sender, {
          ownerJid: config.OWNER + "@s.whatsapp.net",
          thoughtsFilePath: "../lib/thoughts.json",
        });

        await m.reply(response);
      } catch (aiError) {
        console.error("Error getting AI response:", aiError);
        if (
          !aiError.message.includes("ECONNREFUSED") &&
          !aiError.message.includes("timeout")
        ) {
          await m.reply(
            "Gomen nasai! I encountered an error while processing your message. 😔"
          );
        }
      }
    } catch (error) {
      console.error("Error in Nikka AI reply listener:", error);
    }
  }
);
