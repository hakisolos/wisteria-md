/** @format */

const { nikka, extractUrls } = require('../lib');
const axios = require('axios');
const yts = require('yt-search');
const dl = require("../lib/utilities/dl")

nikka(
	{
		pattern: 'song',
		desc: 'download yt music',
		public: false,
		category: 'download',
		react: true,
	},
	async (m, { match }) => {
		const q = match; 
		if (!match)
			return m.reply(`hey ${m.pushName}, provide a youtube url to download`);
		const url = await dl(q, "mp3")
		await m.client.sendMessage(m.jid, {
			audio: { url: url },
			mimetype: 'audio/mp4',
			quoted: m.raw
		});
		
		
	}
);

nikka(
	{
		pattern: 'video',
		desc: 'download yt vid',
		public: false,
		category: 'download',
		react: true,
	},
	async (m, { match }) => {
		const q = match; 
		if (!match)
			return m.reply(`hey ${m.pushName}, provide a youtube url to download`);
		const url = await dl(q, "720")
		await m.client.sendMessage(m.jid, {
			audio: { url: url },
			mimetype: 'video/mp4',
			quoted: m.raw
		});
		
	}
);

nikka(
  {
    pattern: "apkdl",
    desc: "APK search & download",
    react: "true",
    category: "download",
    public: false,
  },
  async (m, { match }) => {
    if (!match) return m.reply("Query required.");

    const query = match.trim();
    const response = await axios.get(`https://bk9.fun/search/apkfab?q=${query}`);
    const app = response.data?.BK9?.[0];

    if (!app) return m.reply("No result found.");

    const info = {
      title: app.title,
      link: app.link,
      image: app.image,
      rating: app.rating,
      review: app.review,
    };

    const caption = `TITLE: ${info.title}\n\nLINK: ${info.link}\n\nRATING: ${info.rating}\n\nREVIEW: ${info.review}`;

    await m.client.sendMessage(
      m.jid,
      {
        image: { url: info.image },
        caption,
      },
      { quoted: m.raw }
    );

    const downloadRes = await axios.get(`https://bk9.fun/download/apkfab?url=${info.link}`);
    const apk = downloadRes.data?.BK9?.link;

    if (!apk) return m.reply("Failed to fetch APK download link.");

    await m.client.sendMessage(
      m.jid,
      {
        document: { url: apk },
        fileName: `${info.title}.apk`,
        mimetype: "application/vnd.android.package-archive",
      },
      { quoted: m.raw }
    );
  }
);
nikka(
  {
    pattern: "fb",
    desc: "Download Facebook video (HD)",
    react: true,
    category: "download",
    public: false,
  },
  async (m, { match }) => {
    if (!match) return m.reply("Gimme a Facebook video URL, love 😘");

    try {
      const res = await axios.get(`https://bk9.fun/download/fb?url=${encodeURIComponent(match.trim())}`);
      const data = res.data?.BK9;

      if (!data?.hd) return m.reply("Babe there's no HD video found 😢");

      return await m.client.sendMessage(
        m.jid,
        {
          video: { url: data.hd },
        },
        { quoted: m.raw }
      );
    } catch (e) {
      console.error("FB download error:", e);
      return m.reply("Something went wrong hun 🥺, try again.");
    }
  }
);
nikka(
  {
    pattern: "insta",
    desc: "download instagram media",
    react: "true",
    category: "download",
    public: false,
  },
  async (m, { match }) => {
    if (!match) return m.reply("Instagram URL needed");

    const response = await axios.get(`https://bk9.fun/download/instagram2?url=${encodeURIComponent(match.trim())}`);
    const data = response.data.BK9;

    // Find first video
    const video = data.formats.find((f) => f.type === "video");

    if (!video?.url) return m.reply("No video found in this post");

    return await m.client.sendMessage(
      m.jid,
      {
        video: { url: video.url },
      },
      { quoted: m.raw }
    );
  }
);
nikka(
  {
    pattern: "pinterest",
    desc: "download Pinterest image or video",
    react: "true",
    category: "download",
    public: false,
  },
  async (m, { match }) => {
    if (!match) return m.reply("Pinterest URL needed");

    var url = match.trim();
    var response = await axios.get(`https://bk9.fun/download/pinterest?url=${encodeURIComponent(url)}`);
    var media = response.data.BK9[0].url;

    if (media.endsWith(".jpg") || media.endsWith(".png") || media.endsWith(".jpeg")) {
      return await m.client.sendMessage(
        m.jid,
        { image: { url: media } },
        { quoted: m.raw }
      );
    }

    if (media.endsWith(".mp4")) {
      return await m.client.sendMessage(
        m.jid,
        { video: { url: media } },
        { quoted: m.raw }
      );
    }

    return await m.reply("Unsupported file type");
  }
);
nikka(
  {
    pattern: "tiktok",
    desc: "download TikTok video",
    react: "true",
    category: "download",
    public: false,
  },
  async (m, { match }) => {
    let url = match?.trim();

    if (!url && m.quoted?.text) {
      url = m.quoted.text.trim();
    }

    if (!url) return m.reply("TikTok URL needed");

    const response = await axios.get(`https://bk9.fun/download/tiktok?url=${encodeURIComponent(url)}`);
    const data = response.data.BK9;

    const caption = `🎬 ${data.desc || "No description"}\n👤 ${data.nickname || "Unknown"}\n🎵 ${data.music_info?.title || "No music title"}\n👍 ${data.likes_count} likes | 💬 ${data.comment_count} comments`;

    return await m.client.sendMessage(
      m.jid,
      {
        video: { url: data.BK9 },
        caption: caption
      },
      { quoted: m.raw }
    );
  }
);
