import fs from 'fs';
import Crypto from 'crypto';
import ff from 'fluent-ffmpeg';
import webp from 'node-webpmux';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Needed to replicate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getTmpFile(ext) {
	return path.join(__dirname, 'store', `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);
}

export async function imageToWebp(media) {
	const tmpFileIn = getTmpFile("jpg");
	const tmpFileOut = getTmpFile("webp");

	fs.writeFileSync(tmpFileIn, media);

	await new Promise((resolve, reject) => {
		ff(tmpFileIn)
			.on("error", reject)
			.on("end", () => resolve(true))
			.addOutputOptions([
				"-vcodec", "libwebp",
				"-vf",
				"scale='min(320,iw)':min(320,ih):force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
			])
			.toFormat("webp")
			.save(tmpFileOut);
	});

	const buff = fs.readFileSync(tmpFileOut);
	fs.unlinkSync(tmpFileOut);
	fs.unlinkSync(tmpFileIn);
	return buff;
}

export async function videoToWebp(media) {
	const tmpFileIn = getTmpFile("mp4");
	const tmpFileOut = getTmpFile("webp");

	fs.writeFileSync(tmpFileIn, media);

	await new Promise((resolve, reject) => {
		ff(tmpFileIn)
			.on("error", reject)
			.on("end", () => resolve(true))
			.addOutputOptions([
				"-vcodec", "libwebp",
				"-vf",
				"scale='min(320,iw)':min(320,ih):force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
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
	fs.unlinkSync(tmpFileOut);
	fs.unlinkSync(tmpFileIn);
	return buff;
}

async function writeExif(media, metadata, isVideo = false) {
	const tmpFileIn = getTmpFile("webp");
	const tmpFileOut = getTmpFile("webp");

	const convertedMedia = isVideo ? await videoToWebp(media) : await imageToWebp(media);
	fs.writeFileSync(tmpFileIn, convertedMedia);

	if (metadata.packname || metadata.author) {
		const img = new webp.Image();
		const json = {
			"sticker-pack-id": "https://github.com/M3264",
			"sticker-pack-name": metadata.packname,
			"sticker-pack-publisher": metadata.author,
			emojis: metadata.categories || [""],
		};

		const exifAttr = Buffer.from([
			0x49, 0x49, 0x2A, 0x00,
			0x08, 0x00, 0x00, 0x00,
			0x01, 0x00, 0x41, 0x57,
			0x07, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x16, 0x00,
			0x00, 0x00
		]);

		const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
		const exif = Buffer.concat([exifAttr, jsonBuff]);
		exif.writeUIntLE(jsonBuff.length, 14, 4);

		await img.load(tmpFileIn);
		fs.unlinkSync(tmpFileIn);

		img.exif = exif;
		await img.save(tmpFileOut);

		return tmpFileOut;
	}

	return tmpFileIn;
}

export async function writeExifImg(media, meta) {
	return await writeExif(media, meta, false);
}

export async function writeExifVid(media, meta) {
	return await writeExif(media, meta, true);
}

export async function writeExifWebp(media, metadata) {
	const tmpFileIn = getTmpFile("webp");
	const tmpFileOut = getTmpFile("webp");

	fs.writeFileSync(tmpFileIn, media);

	if (metadata.packname || metadata.author) {
		const img = new webp.Image();
		const json = {
			"sticker-pack-id": "https://github.com/M3264",
			"sticker-pack-name": metadata.packname,
			"sticker-pack-publisher": metadata.author,
			emojis: metadata.categories || [""],
		};

		const exifAttr = Buffer.from([
			0x49, 0x49, 0x2A, 0x00,
			0x08, 0x00, 0x00, 0x00,
			0x01, 0x00, 0x41, 0x57,
			0x07, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x16, 0x00,
			0x00, 0x00
		]);

		const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
		const exif = Buffer.concat([exifAttr, jsonBuff]);
		exif.writeUIntLE(jsonBuff.length, 14, 4);

		await img.load(tmpFileIn);
		fs.unlinkSync(tmpFileIn);

		img.exif = exif;
		await img.save(tmpFileOut);
		return tmpFileOut;
	}

	return tmpFileIn;
}
