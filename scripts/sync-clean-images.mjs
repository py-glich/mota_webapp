import fs from 'fs';
import { MongoClient } from 'mongodb';
import { PART_IMAGES, matchPartGraphic } from '../src/utils/imageUtils.ts';

const storePath = 'server/data/store.json';
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

for (const p of store.products) {
  p.imageUrl = matchPartGraphic(p.name, p.categoryId);
}

fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf8');
console.log('✅ Updated server/data/store.json');

// Now update MongoDB
try {
  const client = new MongoClient('mongodb://127.0.0.1:27017/motopro_pos');
  await client.connect();
  const db = client.db('motopro_pos');
  for (const p of store.products) {
    await db.collection('products').updateOne(
      { id: p.id },
      { $set: { imageUrl: p.imageUrl } }
    );
  }
  console.log('✅ Updated MongoDB motopro_pos.products');
  await client.close();
} catch (err) {
  console.warn('MongoDB sync note:', err.message);
}
