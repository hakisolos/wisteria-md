const {nikka} = require("../lib")
const axios = require("axios")
const yts = require("yt-search")

nikka(
    {
      pattern: "play",
      desc: "play music",
      react: true,
      public: true,
      category: "download"
    },
    async (m, { match }) => {
      if (!match) return m.reply(`hey ${m.pushName}, what song should I play for you baby? 😚`);
  
      try {
        const search = await yts(match.trim());
        const video = search.all[0];
  
        const videoUrl = video.url;
        const thumb = video.thumbnail;
        const title = video.title;
  
        const api = `https://kord-api.vercel.app/yt-song?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(api);
  
        if (!response.data.success) {
          return m.reply("aww 🥺 something went wrong baby... try another song for me?");
        }
  
        const songUrl = response.data.fileUrl;
  
        await m.client.sendMessage(m.jid, {
          audio: { url: songUrl },
          mimetype: 'audio/mpeg',
          ptt: true,
          contextInfo: {
            externalAdReply: {
              title: "Now Playing 🎧",
              body: title,
              sourceUrl: videoUrl,
              mediaUrl: songUrl,
              mediaType: 1,
              showAdAttribution: true,
              renderLargerThumbnail: true,
              thumbnailUrl: thumb
            }
          }
        });
  
      } catch (err) {
        console.error(err);
        m.reply("my sweet love 💔 I couldn't fetch the song... maybe try again?");
      }
    }
  );