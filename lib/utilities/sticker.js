const fs = require("fs");
const { tmpdir } = require("os");
const Crypto = require("crypto");
const ff = require("fluent-ffmpeg");
const webp = require("node-webpmux");
const path = require("path");
const FormData = require("form-data");
const { JSDOM } = require("jsdom");
const fetch = require("node-fetch");

async function imageToWebp(media) {
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`
  );

  fs.writeFileSync(tmpFileIn, media);

  try {
    await new Promise((resolve, reject) => {
      ff(tmpFileIn)
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .on("end", () => resolve(true))
        .addOutputOptions([
          "-vcodec", "libwebp",
          "-vf", "scale='min(320,iw)':'min(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
        ])
        .toFormat("webp")
        .save(tmpFileOut);
    });

    const buff = fs.readFileSync(tmpFileOut);
    return buff;
  } catch (error) {
    throw error;
  } finally {
    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut);
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
  }
}

async function videoToWebp(media) {
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`
  );

  fs.writeFileSync(tmpFileIn, media);

  try {
    await new Promise((resolve, reject) => {
      ff(tmpFileIn)
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .on("end", () => resolve(true))
        .addOutputOptions([
          "-vcodec", "libwebp",
          "-vf", "scale='min(320,iw)':'min(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
          "-loop", "0",
          "-ss", "00:00:00",
          "-t", "00:00:05",
          "-preset", "default",
          "-an",
          "-vsync", "0"
        ])
        .toFormat("webp")
        .save(tmpFileOut);
    });

    const buff = fs.readFileSync(tmpFileOut);
    return buff;
  } catch (error) {
    throw error;
  } finally {
    if (fs.existsSync(tmpFileOut)) fs.unlinkSync(tmpFileOut);
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
  }
}

async function writeExifImg(media, metadata) {
  let wMedia = await imageToWebp(media);
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  
  try {
    fs.writeFileSync(tmpFileIn, wMedia);

    if (metadata.packname || metadata.author) {
      const img = new webp.Image();
      const json = {
        "sticker-pack-id": `https://github.com/KING-DAVIDX`,
        "sticker-pack-name": metadata.packname,
        "sticker-pack-publisher": metadata.author,
        emojis: metadata.categories ? metadata.categories : [""],
      };
      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);
      const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuff]);
      exif.writeUIntLE(jsonBuff.length, 14, 4);
      await img.load(tmpFileIn);
      img.exif = exif;
      await img.save(tmpFileOut);
      return tmpFileOut;
    }
  } finally {
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
  }
}

async function writeExifVid(media, metadata) {
  let wMedia = await videoToWebp(media);
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  
  try {
    fs.writeFileSync(tmpFileIn, wMedia);

    if (metadata.packname || metadata.author) {
      const img = new webp.Image();
      const json = {
        "sticker-pack-id": `https://github.com/KING-DAVIDX`,
        "sticker-pack-name": metadata.packname,
        "sticker-pack-publisher": metadata.author,
        emojis: metadata.categories ? metadata.categories : [""],
      };
      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);
      const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuff]);
      exif.writeUIntLE(jsonBuff.length, 14, 4);
      await img.load(tmpFileIn);
      img.exif = exif;
      await img.save(tmpFileOut);
      return tmpFileOut;
    }
  } finally {
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
  }
}

async function writeExifWebp(media, metadata) {
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );
  
  try {
    fs.writeFileSync(tmpFileIn, media);

    if (metadata.packname || metadata.author) {
      const img = new webp.Image();
      const json = {
        "sticker-pack-id": `https://github.com/KING-DAVIDX`,
        "sticker-pack-name": metadata.packname,
        "sticker-pack-publisher": metadata.author,
        emojis: metadata.categories ? metadata.categories : [""],
      };
      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);
      const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuff]);
      exif.writeUIntLE(jsonBuff.length, 14, 4);
      await img.load(tmpFileIn);
      img.exif = exif;
      await img.save(tmpFileOut);
      return tmpFileOut;
    }
  } finally {
    if (fs.existsSync(tmpFileIn)) fs.unlinkSync(tmpFileIn);
  }
}

function toVideo(buffer, ext) {
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`
  );

  fs.writeFileSync(tmpFileIn, buffer);

  return new Promise((resolve, reject) => {
    ff(tmpFileIn)
      .on("error", reject)
      .on("end", () => {
        const data = fs.readFileSync(tmpFileOut);
        fs.unlinkSync(tmpFileIn);
        fs.unlinkSync(tmpFileOut);
        resolve(data);
      })
      .addOutputOptions([
        "-c:v", "libx264",
        "-c:a", "aac",
        "-ab", "128k",
        "-ar", "44100",
        "-crf", "32",
        "-preset", "slow"
      ])
      .toFormat("mp4")
      .save(tmpFileOut);
  });
}

async function webp2mp4(source) {
  let form = new FormData();
  let isUrl = typeof source === "string" && /https?:\/\//.test(source);
  form.append("new-image-url", isUrl ? source : "");
  form.append("new-image", isUrl ? "" : source, "image.webp");
  let res = await fetch("https://ezgif.com/webp-to-mp4", {
    method: "POST",
    body: form,
  });
  let html = await res.text();
  let { document } = new JSDOM(html).window;
  let form2 = new FormData();
  let obj = {};
  for (let input of document.querySelectorAll("form input[name]")) {
    obj[input.name] = input.value;
    form2.append(input.name, input.value);
  }
  let res2 = await fetch("https://ezgif.com/webp-to-mp4/" + obj.file, {
    method: "POST",
    body: form2,
  });
  let html2 = await res2.text();
  let { document: document2 } = new JSDOM(html2).window;
  return new URL(
    document2.querySelector("div#output > p.outfile > video > source").src,
    res2.url
  ).toString();
}

async function videoToAudio(buffer, ext, audioFormat = 'mp3') {
  const tmpFileIn = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`
  );
  const tmpFileOut = path.join(
    tmpdir(),
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${audioFormat}`
  );

  fs.writeFileSync(tmpFileIn, buffer);

  return new Promise((resolve, reject) => {
    ff(tmpFileIn)
      .on('error', reject)
      .on('end', () => {
        const data = fs.readFileSync(tmpFileOut);
        fs.unlinkSync(tmpFileIn);
        fs.unlinkSync(tmpFileOut);
        resolve(data);
      })
      .noVideo() // Remove video stream
      .audioCodec('libmp3lame') // Use MP3 codec by default
      .audioBitrate('128k') // Set audio bitrate
      .toFormat(audioFormat)
      .save(tmpFileOut);
  });
}

module.exports = {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
  writeExifWebp,
  toVideo,
  webp2mp4,
  videoToAudio
};