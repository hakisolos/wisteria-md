import { nikka } from "../lib"
nikka(
    {
        pattern: "aov",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}aov haki`)
        var url = `https://api.nexoracle.com/ephoto360/shimmering-aov-avaters?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})

    }
)

nikka(
    {
        pattern: "avengers",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}avengers haki`)
        var url = `https://api.nexoracle.com/ephoto360/avengers?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)

nikka(
    {
        pattern: "american",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}american haki`)
        var url = `https://api.nexoracle.com/ephoto360/american-flag-3d?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)


nikka(
    {
        pattern: "angel",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}angel haki`)
        var url = `https://api.nexoracle.com/ephoto360/angel-wings?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)


nikka(
    {
        pattern: "hacker",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}hacker haki`)
        var url = `https://api.nexoracle.com/ephoto360/annonymous-hacker?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)

nikka(
    {
        pattern: "cake",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}cake haki`)
        var url = `https://api.nexoracle.com/ephoto360/anniversary-cake?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)


nikka(
    {
        pattern: "blackpink",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}blackpink haki`)
        var url = `https://api.nexoracle.com/ephoto360/blackpink?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)

nikka(
    {
        pattern: "birthday",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}birthday haki`)
        var url = `https://api.nexoracle.com/ephoto360/birthday-card?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)

nikka(
    {
        pattern: "bloody1",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}bloody1 haki`)
        var url = `https://api.nexoracle.com/ephoto360/bloody-text1?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)

nikka(
    {
        pattern: "bloody2",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}bloody2 haki`)
        var url = `https://api.nexoracle.com/ephoto360/bloody-text2?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)

nikka(
    {
        pattern: "one-piece",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}one-piece haki`)
        var url = `https://api.nexoracle.com/ephoto360/one-piece?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)


nikka(
    {
        pattern: "phub",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}phub haki`)
        var url = `https://api.nexoracle.com/ephoto360/phub?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)

nikka(
    {
        pattern: "thor",
        desc: "ephoto",
        category: "ephoto",
        react: true,
        public: true,
    },
    async(m, {match}) => {
        if(!match) return m.reply(`usage: ${m.prefix}thor haki`)
        var url = `https://api.nexoracle.com/ephoto360/thor?apikey=elDrYH7GsuIeBkyw1&text=${match.trim()}`
        await m.client.sendMessage(m.jid, {image: {url:url}}, {quoted: m.raw})
        
    }
)
