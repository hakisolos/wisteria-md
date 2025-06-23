const {nikka} = require("../lib")
const axios = require("axios")

nikka(
    {
        pattern: "gojo",
        desc: "gojo amv",
        category: "anime",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        var res = await axios.get("https://api.nexoracle.com/anime/gojo?apikey=elDrYH7GsuIeBkyw1")
        await m.client.sendMessage(m.jid, {video: {url: res.data.result}}, {quoted: m.raw})
    }
)

nikka(
    {
        pattern: "goku",
        desc: "goku amv",
        category: "anime",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        var res = await axios.get("https://api.nexoracle.com/anime/goku?apikey=elDrYH7GsuIeBkyw1")
        await m.client.sendMessage(m.jid, {video: {url: res.data.result}}, {quoted: m.raw})
    }
)

nikka(
    {
        pattern: "yuji",
        desc: "yuji amv",
        category: "anime",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        var res = await axios.get("https://api.nexoracle.com/anime/yuji?apikey=elDrYH7GsuIeBkyw1")
        await m.client.sendMessage(m.jid, {video: {url: res.data.result}}, {quoted: m.raw})
    }
)

nikka(
    {
        pattern: "yuta",
        desc: "yuta amv",
        category: "anime",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        var res = await axios.get("https://api.nexoracle.com/anime/yuta?apikey=elDrYH7GsuIeBkyw1")
        await m.client.sendMessage(m.jid, {video: {url: res.data.result}}, {quoted: m.raw})
    }
)

nikka(
    {
        pattern: "myanime",
        desc: "anime",
        category: "anime",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        var response = await axios.get(`https://api.nexoracle.com/anime/mal-character?apikey=elDrYH7GsuIeBkyw1&q=${match.trim()}`)
        var res = response.data.result[0]
        if(!res) return m.reply("no result found")
        var text = `NAME: ${res.name.trim()}\n\n ALIAS: ${res.alias_name.trim()}\n\n URL: ${res.url.trim()}\n\n ANIME: ${res.anime.trim()}\n\n ${res.manga.trim()}`
        await m.client.sendMessage(m.jid, {image: {url: res.thumbnail.trim()}, caption: text}, {quoted: m.raw})
  
    }
)

nikka(
    {
      pattern: "otaku-latest",
      desc: "Show latest ongoing anime from Otakudesu",
      category: "anime",
      react: true,
      public: true,
    },
    async (m, { match }) => {
      const count = match ? parseInt(match.trim()) : 5;
  
      const response = await axios.get(
        `https://api.nexoracle.com/anime/otakudesu-latest?apikey=elDrYH7GsuIeBkyw1`
      );
  
      const ongoing = response.data.result.ongoing_anime;
  
      if (!ongoing || ongoing.length === 0) return m.reply("No ongoing anime found.");
  
      const listCount = Math.min(count, ongoing.length);
  
      let text = `Latest Ongoing Anime (showing ${listCount}):\n\n`;
  
      for (let i = 0; i < listCount; i++) {
        const anime = ongoing[i];
        text += `${i + 1}. Title: ${anime.title}\n`;
        text += `   Episode: ${anime.current_episode}\n`;
        text += `   Release Day: ${anime.release_day}\n`;
        text += `   Newest Release Date: ${anime.newest_release_date}\n`;
        text += `   URL: ${anime.otakudesu_url}\n\n`;
      }
  
      await m.reply(text.trim());
    }
  );


