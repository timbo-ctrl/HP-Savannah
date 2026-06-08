// Syncs the most recent Instagram posts into assets/instagram/.
// Uses the Instagram API with Instagram Login (graph.instagram.com).
// Runs in CI (GitHub Action) with secrets, or locally with env vars set.
//
// Required env:
//   IG_ACCESS_TOKEN  long-lived Instagram user access token
// Optional env:
//   IG_USER_ID       Instagram user id (defaults to "me")
//   IG_LIMIT         number of posts to keep (default 12)

import { mkdir, writeFile, readdir, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'assets', 'instagram');
const FEED_PATH = join(OUT_DIR, 'feed.json');
const GRAPH = 'https://graph.instagram.com';
const API_VERSION = 'v25.0';

const token = process.env.IG_ACCESS_TOKEN;
const userId = process.env.IG_USER_ID || 'me';
const limit = Number(process.env.IG_LIMIT || 12);

if (!token) {
  console.error('Missing IG_ACCESS_TOKEN. Set it as an environment variable / GitHub secret.');
  process.exit(1);
}

const CAPTION_MAX = 160;
const trimCaption = (c) => {
  if (!c) return '';
  const oneLine = c.replace(/\s+/g, ' ').trim();
  return oneLine.length > CAPTION_MAX ? oneLine.slice(0, CAPTION_MAX - 1).trimEnd() + '…' : oneLine;
};

async function getMedia() {
  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
  const url = `${GRAPH}/${API_VERSION}/${userId}/media?fields=${encodeURIComponent(fields)}&limit=${limit}&access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Instagram API error ${res.status}: ${body}`);
  }
  const json = await res.json();
  return Array.isArray(json.data) ? json.data : [];
}

function imageUrlFor(item) {
  if (item.media_type === 'VIDEO') return item.thumbnail_url || item.media_url;
  return item.media_url; // IMAGE and CAROUSEL_ALBUM return the (first) image
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const media = await getMedia();
  const feed = [];

  for (const item of media) {
    const src = imageUrlFor(item);
    if (!src) continue;
    const file = `${item.id}.jpg`;
    try {
      await download(src, join(OUT_DIR, file));
    } catch (err) {
      console.warn(`Skipping ${item.id}: ${err.message}`);
      continue;
    }
    feed.push({
      id: item.id,
      file,
      permalink: item.permalink || 'https://www.instagram.com/hp.savannah/',
      caption: trimCaption(item.caption),
      timestamp: item.timestamp || null,
    });
  }

  await writeFile(FEED_PATH, JSON.stringify(feed, null, 2) + '\n');

  // Remove image files that are no longer part of the current feed.
  const keep = new Set(feed.map((p) => p.file));
  const existing = await readdir(OUT_DIR);
  for (const name of existing) {
    if (name.endsWith('.jpg') && !keep.has(name)) {
      await unlink(join(OUT_DIR, name)).catch(() => {});
    }
  }

  console.log(`Synced ${feed.length} Instagram post(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
