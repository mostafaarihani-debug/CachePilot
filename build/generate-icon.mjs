import { writeFileSync } from 'fs';

const size = 256;
const pixels = [];

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 8;
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

    if (dist <= r) {
      const gradient = 1 - (dist / r) * 0.3;
      const rim = Math.max(0, 1 - Math.abs(dist - (r - 4)) / 4);
      const rr = Math.floor((77 + rim * 50) * gradient);
      const gg = Math.floor((163 + rim * 30) * gradient);
      const bb = Math.floor(255 * gradient);
      pixels.push(255, bb, gg, rr);
    } else {
      pixels.push(0, 0, 0, 0);
    }
  }
}

const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);
bmpHeader.writeInt32LE(size, 4);
bmpHeader.writeInt32LE(size * 2, 8);
bmpHeader.writeUInt16LE(1, 12);
bmpHeader.writeUInt16LE(32, 14);
bmpHeader.writeUInt32LE(size * size * 4 + 40, 20);

const pixelData = Buffer.from(pixels);
const image = Buffer.concat([bmpHeader, pixelData]);

const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);

const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(0, 0);
dirEntry.writeUInt8(0, 1);
dirEntry.writeUInt8(0, 2);
dirEntry.writeUInt8(0, 3);
dirEntry.writeUInt16LE(1, 4);
dirEntry.writeUInt16LE(32, 6);
dirEntry.writeUInt32LE(image.length, 8);
dirEntry.writeUInt32LE(22, 12);

const ico = Buffer.concat([icoHeader, dirEntry, image]);
writeFileSync('build/icon.ico', ico);
console.log('Icon created: build/icon.ico (' + ico.length + ' bytes)');
