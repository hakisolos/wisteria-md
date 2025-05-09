const {nikka} = require("../lib")


nikka(
    {
      pattern: "take",
      desc: "sticker/audio stealing",
      public: false,
      react: true,
      category: "converter"
    },
    async(m, {match}) => {
        if (!m.quoted) return m.reply('Please reply to a sticker or audio to steal it');

        const mime = m.quoted.mtype || m.quoted.type;
        
        if (mime !== 'stickerMessage' && mime !== 'audioMessage') {
            return m.reply('Please reply to a *sticker* or *audio* message only 💕');
        }
      let buff = await m.quoted.download();
      let [packname, author] = match.split(";");
      await m.sendMessage(
        buff,
        {
          packname: packname || "H4KI",
          author: author || "XER"
        },
        "sticker"
      );
      }
  );
    