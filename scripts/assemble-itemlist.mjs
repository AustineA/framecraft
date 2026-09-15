/** Assemble the PlantPal presentation from Framecraft's four CLI-rendered PNGs. */
import sharp from 'sharp';
import { readdir, mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve('output/plantpal');
const dir = resolve(root, 'screens');
const files = (await readdir(dir)).filter(file => file.endsWith('.png')).sort();
if (files.length !== 4) throw new Error('Export the four PlantPal screens to output/plantpal/screens first.');
const mask = Buffer.from('<svg width="460" height="998"><rect width="460" height="998" rx="60" fill="white"/></svg>');
const panels = await Promise.all(files.map(async (file, index) => ({
  input: await sharp(resolve(dir, file)).resize(460, 1000, { fit: 'fill' }).extract({left:0,top:0,width:460,height:998}).composite([{input:mask,blend:'dest-in'}]).png().toBuffer(),
  left:74+index*480, top:77,
})));
// Reproduce only the visible 54px of the fifth panel from the reference.
const partial = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="54" height="998"><rect width="460" height="998" rx="60" fill="#0B433B"/><rect x="23" y="224" width="416" height="920" rx="88" fill="#080808" stroke="#B4C99A" stroke-width="5"/><path d="M38 461h16v528H38z" fill="#A19D84"/></svg>');
await mkdir(root, {recursive:true});
await sharp({create:{width:2048,height:1152,channels:4,background:'#B4C99A'}}).composite([...panels,{input:partial,left:1994,top:77}]).png().toFile(resolve(root,'plantpal-reference-2048x1152.png'));
await copyFile(resolve(root,'plantpal-reference-2048x1152.png'),resolve('public/templates/itemlist/plantpal-reference-2048x1152.png'));
console.log(resolve(root,'plantpal-reference-2048x1152.png'));
