import {nikka} from "../lib";
nikka(
  {
    pattern: "tts2",
    desc: "Text to Speech",
    category: "tools",
    react: "🗣️",
    public: false,
  },
  async (m, { match }) => {
    if (!match) return m.reply("Please provide text to convert to speech.");

    const text = match.trim();
    const url = `https://bk9.fun/tools/tts?q=${encodeURIComponent(text)}&lang=en`;

    await m.client.sendMessage(m.jid, {
      audio: { url: url },
      mimetype: "audio/mpeg",
      ptt: true,
    }, { quoted: m.raw });
  }
);
