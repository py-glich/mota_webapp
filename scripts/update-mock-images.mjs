import fs from 'fs';

const partImages = JSON.parse(fs.readFileSync('scripts/part-images.json', 'utf8'));

function matchGraphic(name, cat) {
  const n = (name || '').toLowerCase();
  if (n.includes('piston') || n.includes('cylinder')) return partImages.PISTON_CYLINDER;
  if (n.includes('clutch')) return partImages.CLUTCH_PLATES;
  if (n.includes('oil') || n.includes('havoline') || n.includes('lubricant')) return partImages.ENGINE_OIL;
  if (n.includes('chain') || n.includes('sprocket')) return partImages.CHAIN_SPROCKET;
  if (n.includes('brake') || n.includes('shoe')) return partImages.BRAKE_SYSTEM;
  if (n.includes('tyre') || n.includes('tire')) return partImages.MOTORCYCLE_TYRE;
  if (n.includes('plug') || n.includes('battery') || n.includes('light') || n.includes('bulb')) return partImages.ELECTRICAL_PARTS;
  if (n.includes('shock') || n.includes('suspension')) return partImages.SUSPENSION_SHOCK;
  if (n.includes('tank') || n.includes('body')) return partImages.BODY_PARTS;
  if (n.includes('helmet') || n.includes('lock')) return partImages.HELMET_ACCESSORIES;
  return partImages.GENERIC_SPARE;
}

// 1. Update store.json
const storePath = 'server/data/store.json';
if (fs.existsSync(storePath)) {
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  let updatedCount = 0;
  if (Array.isArray(store.products)) {
    store.products.forEach(p => {
      if (!p.imageUrl || p.imageUrl.includes('unsplash.com')) {
        p.imageUrl = matchGraphic(p.name, p.categoryId);
        updatedCount++;
      }
    });
  }
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
  console.log(`Updated ${updatedCount} products in server/data/store.json with offline Base64 graphics.`);
}
