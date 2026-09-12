/** Build a portable project with every template asset embedded. Run after build:cli. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
import template from '../dist/cli/src/lib/itemlist-template.js';
const { ITEMLIST_PROJECT } = template;
const project = {
  ...ITEMLIST_PROJECT,
  media: ITEMLIST_PROJECT.media.map(asset => {
    const file = resolve(here, '../public', asset.dataUrl.replace(/^\//, ''));
    const mime = extname(file) === '.svg' ? 'image/svg+xml' : 'image/png';
    return { ...asset, dataUrl: `data:${mime};base64,${readFileSync(file).toString('base64')}` };
  }),
};
writeFileSync(resolve(here, '../public/templates/itemlist/itemlist.framecraft.json'), JSON.stringify({
  framecraft: 1, name: 'Itemlist — reference recreation', updatedAt: new Date().toISOString(), project,
}));
console.log('Packaged four screens and all embedded image assets.');
