const { nikka } = require("../lib");
const axios = require("axios");
nikka(
    {
        pattern: "apkfab",
        desc: "apk search",
        react: "true",
        category: "search",
        public: false,
        
    },
    async(m, {match}) => {
    if(!match) return m.reply("query needed")
    var query = match.trim()
    var response = await axios.get(`https://bk9.fun/search/apkfab?q=${query}`)
    res = response.data.BK9[0]
    var data = {
        title: res.title,
        link: res.link,
        img: res.image,
        rating: res.rating,
        review: res.review
    }
    var text = `TITLE: ${data.title}\n\n LINK: ${data.link}\n\n RATING: ${data.rating}\n\n REVIEW: ${data.review}`
    return await m.client.sendMessage(m.jid, {image: {url: data.img}, caption: text})
    
    }

)
nikka(
    {
        pattern: "pixabay",
        desc: "pixabay search",
        react: "true",
        category: "search",
        public: false,
        
    },
    async(m, {match}) => {
    if(!match) return m.reply("query needed")
    if(match.includes(",")) {
       var q1 = match.split(",")[0]
       var q2 = parseInt(match.split(",")[1].trim(), 10)
       const response = await axios.get(`https://bk9.fun/search/pixabay?q=${q1}`)
       var urls = response.data.BK9
       for (let i = 0; i < q2; i++){
        await m.client.sendMessage(m.jid, {image: {url: urls[i] }})
       }
    }else{
        const q = match.trim()
        const response = await axios.get(`https://bk9.fun/search/pixabay?q=${q}`)
       var urls = response.data.BK9
       for (let i = 0; i < 5;  i++){
        await m.client.sendMessage(m.jid, {image: {url: urls[i] }})
       }
    }
    
    }

)
nikka(
  {
    pattern: "playstore",
    desc: "search playstore apps",
    react: "true",
    category: "search",
    public: false,
  },
  async (m, { match }) => {
    if (!match) return m.reply("query needed");

    var q = match.trim();
    var response = await axios.get(`https://bk9.fun/search/playstore?q=${q}`);
    var res = response.data.BK9;

    var text = `TITLE: ${res.title}
SUMMARY: ${res.summary}

URL: ${res.url}

DEVELOPER: ${res.developer}
RELEASED: ${res.released}
UPDATED: ${res.updated}
VERSION: ${res.version}

SCORE: ${res.score}
INSTALLS: ${res.installs}
PRICE: ${res.price}
SIZE: ${res.size}
ANDROID VERSION: ${res.androidVersion}`;

    return await m.client.sendMessage(
      m.jid,
      {
        image: { url: res.icon },
        caption: text,
      },
      { quoted: m.raw }
    );
  }
);
nikka(
    {
        pattern: "soundcloud",
        desc: "music search",
        react: "true",
        category: "search",
        public: false,
        
    },
    async(m, {match}) => {
    if(!match) return m.reply("query needed")
    var q = match.trim()
    var response = await axios.get(`https://bk9.fun/search/soundcloud?q=${q}`)
    var res = response.data.BK9[0]
    await m.reply(`TITLE: ${res.title}\n\n LINK: ${res.link}`)
    
    })
    
    
nikka(
  {
    pattern: "ss",
    desc: "Take a tablet screenshot of a webpage",
    react: "true",
    category: "search",
    public: false,
  },
  async (m, { match }) => {
    let input = match || m.quoted?.text;

    if (!input) return m.reply("Please provide a valid link.");

 
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return m.reply("No valid URL found in the message.");

    const url = urlMatch[0];
    const apiURL = `https://bk9.fun/tools/screenshot?url=${encodeURIComponent(url)}&device=phone`;

    await m.client.sendMessage(m.jid, {image: {url: apiURL}, caption: url}, {quoted: m.raw})
  }
);

nikka(
  {
    pattern: "sstab",
    desc: "Take a tablet screenshot of a webpage",
    react: "true",
    category: "search",
    public: false,
  },
  async (m, { match }) => {
    let input = match || m.quoted?.text;

    if (!input) return m.reply("Please provide a valid link.");

 
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return m.reply("No valid URL found in the message.");

    const url = urlMatch[0];
    const apiURL = `https://bk9.fun/tools/screenshot?url=${encodeURIComponent(url)}&device=tablet`;

    await m.client.sendMessage(m.jid, {image: {url: apiURL}, caption: url}, {quoted: m.raw})
  }
);
nikka(
    {
        pattern: "steam",
        desc: "steam search",
        react: "true",
        category: "search",
        public: false,
        
    },
    async(m, {match}) => {
    if(!match) return m.reply("query needed")
    var q = match.trim()
    var response = await axios.get(`https://bk9.fun/search/Steam?q=${q}`)
    var res = response.data.BK9[0]
    var text = `TITLE: ${res.title}\n\n LINK: ${res.link}\n\n RELEASE: ${res.release.trim()}\n\n PRICE: ${res.price}\n\n RATING: ${res.rating}`
    return await m.client.sendMessage(m.jid, {image: {url: res.img}, caption: text}, {quoted: m.raw})
    })
    
    

nikka(
    {
        pattern: "unsplash",
        desc: "unsplash search",
        react: "true",
        category: "search",
        public: false,
        
    },
    async(m, {match}) => {
    if(!match) return m.reply("query needed")
    if(match.includes(",")) {
       var q1 = match.split(",")[0]
       var q2 = parseInt(match.split(",")[1].trim(), 10)
       const response = await axios.get(`https://bk9.fun/search/unsplash?q=${q1}`)
       var urls = response.data.BK9
       for (let i = 0; i < q2; i++){
        await m.client.sendMessage(m.jid, {image: {url: urls[i] }})
       }
    }else{
        const q = match.trim()
        const response = await axios.get(`https://bk9.fun/search/unsplash?q=${q}`)
       var urls = response.data.BK9
       for (let i = 0; i < 5;  i++){
        await m.client.sendMessage(m.jid, {image: {url: urls[i] }})
       }
    }
    
    }

)

nikka(
  {
    pattern: "wiki",
    desc: "search Wikipedia",
    react: "true",
    category: "search",
    public: false,
  },
  async (m, { match }) => {
    if (!match) return m.reply("query needed");

    var q = match.trim();
    var response = await axios.get(`https://bk9.fun/search/wiki?q=${q}`);
    var res = response.data.BK9[0];

    var text = res.BK9.trim();

    return await m.client.sendMessage(
      m.jid,
      {
        image: { url: res.thumb },
        caption: text,
      },
      { quoted: m.raw }
    );
  }
);
