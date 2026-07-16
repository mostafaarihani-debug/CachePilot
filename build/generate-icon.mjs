import sharp from 'sharp';
import { writeFileSync } from 'fs';

const src = 'C:/Users/hamza/Desktop/CachePilot icons/new logo.png';
const out = 'C:/Users/hamza/Desktop/cache cleaner project/build/icon.ico';
const sizes = [16, 32, 48, 64, 128, 256];

async function generateICO() {
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(src)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();
    pngBuffers.push(buf);
  }

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type = ICO
  header.writeUInt16LE(sizes.length, 4); // image count

  // Each directory entry: 16 bytes
  // Offset starts after header + all entries
  const entriesSize = sizes.length * 16;
  let dataOffset = 6 + entriesSize;

  const entries = [];
  for (let i = 0; i < sizes.length; i++) {
    const entry = Buffer.alloc(16);
    const s = sizes[i];
    entry[0] = s === 256 ? 0 : s;  // width (0 = 256)
    entry[1] = s === 256 ? 0 : s;  // height (0 = 256)
    entry[2] = 0;                   // color palette
    entry[3] = 0;                   // reserved
    entry.writeUInt16LE(1, 4);      // color planes
    entry.writeUInt16LE(32, 6);     // bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8);  // image size
    entry.writeUInt32LE(dataOffset, 12);            // image offset
    dataOffset += pngBuffers[i].length;
    entries.push(entry);
  }

  const ico = Buffer.concat([header, ...entries, ...pngBuffers]);
  writeFileSync(out, ico);
  console.log(`ICO generated: ${ico.length} bytes, ${sizes.length} sizes`);
}

generateICO().catch(console.error);
