/** @format */
const CHATBOT = require("../lib/database/chatbot")
const { nikka } = require("../lib");
const config = require("../config");
const { nikkaChat, clearHistory, getHistory } = require("../lib/nikka-ai");

const stickerUrls = [
  "https://cdn.kordai.biz.id/serve/5ibpbcgTuOA4.webp",
  "https://cdn.kordai.biz.id/serve/9LuMCAVqaYSe.webp",
  "https://cdn.kordai.biz.id/serve/5ibpbcgTuOA4.webp",
  "https://cdn.kordai.biz.id/serve/bLyCztL6hYFV.webp",
  "https://cdn.kordai.biz.id/serve/YkAYrAN9o4Dy.webp"
];

let stickerIndex = 0;
function getNextStickerUrl() {
  const url = stickerUrls[stickerIndex];
  stickerIndex = (stickerIndex + 1) % stickerUrls.length;
  return url;
}
nikka(
  {
    pattern: "nikka",
    desc: "nikkka chatbot",
    public: false,
    react: true,
    category: "ai"
  },
  async(m, {match}) => {
    if(!match) return m.reply(`use ${m.prefix}nikka on | off`)
    var input = match.trim()
    if(input === "on") {
      var isEnabled = await CHATBOT.isEnabled(m.jid)
      if(isEnabled) return m.reply("nikka already active")
      await CHATBOT.enable(m.jid)
      await m.reply(`_nikka activated for this chat_`)
    }
    else if(input === "off") {
      var isEnabled = await CHATBOT.isEnabled(m.jid)
      if(!isEnabled) return m.reply("nikka already inactive")
      await CHATBOT.disable(m.jid)
      await m.reply(`_nikka deactivated for this chat_`)
    } else return m.reply(`invalid usage; use: \n\n ${m.prefix}nikka on | of`)
  }
)
nikka(
  {
    on: "reply",
  },
  async (m, { eventType }) => {
    try {
      if(!m.isGroup) return
      if (m.fromMe) return;
      if (m.body.startsWith("?")) return;

      var isEnabled = await CHATBOT.isEnabled(m.jid)
      if(!isEnabled) return 

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

        await m.client.sendMessage(
          m.jid,
          { sticker: { url: getNextStickerUrl() } }
        );

      } catch (aiError) {
        console.error("Error getting AI response:", aiError);
        if (
          !aiError.message.includes("ECONNREFUSED") &&
          !aiError.message.includes("timeout")
        ) {
          await m.reply(
            "Gomen nasai! I encountered an error while processing your message. "
          );
        }
      }
    } catch (error) {
      console.error("Error in Nikka AI reply listener:", error);
    }
  }
);
