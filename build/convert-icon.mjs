import sharp from 'sharp';
import { writeFileSync } from 'fs';

const sizes = [256, 48, 32, 16];
const input = 'build/icon.png';
const output = 'build/icon.ico';

async function generate() {
  const images = [];

  for (const size of sizes) {
    const buf = await sharp(input)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    images.push({ size, buf });
  }

  const pngBuffers = [];
  for (const img of images) {
    pngBuffers.push(img.buf);
  }

  const headerLen = 6;
  const dirEntryLen = 16;
  const dirLen = dirEntryLen * images.length;
  let dataOffset = headerLen + dirLen;

  const header = Buffer.alloc(headerLen);
  header.writeUInt16LE(0, 0);       // reserved
  header.writeUInt16LE(1, 2);       // type: ICO
  header.writeUInt16LE(images.length, 4); // image count

  const dirEntries = [];
  for (let i = 0; i < images.length; i++) {
    const { size, buf } = images[i];
    const entry = Buffer.alloc(dirEntryLen);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2);           // color palette
    entry.writeUInt8(0, 3);           // reserved
    entry.writeUInt16LE(1, 4);        // color planes
    entry.writeUInt16LE(32, 6);       // bits per pixel
    entry.writeUInt32LE(buf.length, 8);  // data size
    entry.writeUInt32LE(dataOffset, 12); // data offset
    dataOffset += buf.length;
    dirEntries.push(entry);
  }

  const ico = Buffer.concat([header, ...dirEntries, ...pngBuffers]);
  writeFileSync(output, ico);
  console.log(`Created ${output} (${ico.length} bytes) with ${images.length} sizes: ${sizes.join(', ')}px`);
}

generate().catch(console.error);
