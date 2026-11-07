import fs from 'fs';
import { PART_IMAGES, USER_AVATARS, matchPartGraphic } from '../src/utils/imageUtils.ts';

let code = fs.readFileSync('src/mock/initialData.ts', 'utf8');

// Replace user avatars
code = code.replace(
  /avatar:\s*'https:\/\/images\.unsplash\.com\/photo-1534528741775-53994a69daeb\?w=100&auto=format&fit=crop&q=80'/g,
  `avatar: '${USER_AVATARS.OWNER}'`
);
code = code.replace(
  /avatar:\s*'https:\/\/images\.unsplash\.com\/photo-1507003211169-0a1dd7228f2d\?w=100&auto=format&fit=crop&q=80'/g,
  `avatar: '${USER_AVATARS.MANAGER}'`
);
code = code.replace(
  /avatar:\s*'https:\/\/images\.unsplash\.com\/photo-1500648767791-00dcc994a43e\?w=100&auto=format&fit=crop&q=80'/g,
  `avatar: '${USER_AVATARS.CASHIER_1}'`
);
code = code.replace(
  /avatar:\s*'https:\/\/images\.unsplash\.com\/photo-1472099645785-5658abf4ff4e\?w=100&auto=format&fit=crop&q=80'/g,
  `avatar: '${USER_AVATARS.CASHIER_2}'`
);

// Map of products to their specific graphic
const productMatches = [
  { name: 'Honda CG125 Cylinder Piston Kit (Standard 56.5mm)', img: PART_IMAGES.PISTON_CYLINDER },
  { name: 'Atlas Honda Genuine CG125 Clutch Plate Set (5 Pcs)', img: PART_IMAGES.CLUTCH_PLATES },
  { name: 'Caltex Havoline 4T 20W-50 Engine Oil (0.7L for 70cc)', img: PART_IMAGES.ENGINE_OIL },
  { name: 'Atlas Honda Genuine CD70 Chain Sprocket Complete Kit', img: PART_IMAGES.CHAIN_SPROCKET },
  { name: 'NGK Spark Plug C7HSA (Genuine Copper Core)', img: PART_IMAGES.ELECTRICAL_PARTS },
  { name: 'Servis Cheetah Rear Tyre 3.00-17 6PR Heavy Duty', img: PART_IMAGES.MOTORCYCLE_TYRE },
  { name: 'Crown High-Grip Front & Rear Brake Shoe Set CD70', img: PART_IMAGES.BRAKE_SYSTEM },
  { name: 'Shell Advance 4T AX7 10W-40 Synthetic Based (1 Liter)', img: PART_IMAGES.ENGINE_OIL },
  { name: 'Yamaha YBR125 High-Flow OEM Air Filter Element', img: PART_IMAGES.GENERIC_SPARE },
  { name: 'DOT Approved Matte Black Full Face Helmet (Large)', img: PART_IMAGES.HELMET_ACCESSORIES },
  { name: 'CG125 Complete Headlight Assembly Chrome Rim (12V)', img: PART_IMAGES.ELECTRICAL_PARTS },
  { name: 'DID Japan Heavy Duty 428D Drive Chain (108 Links)', img: PART_IMAGES.CHAIN_SPROCKET }
];

// Replace all unsplash imageUrls in products
for (const p of productMatches) {
  const re = new RegExp(`(name:\\s*'${p.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?imageUrl:\\s*)'https:\\/\\/images\\.unsplash\\.com[^']*'`, 'g');
  code = code.replace(re, `$1'${p.img}'`);
}

// Any remaining unsplash links in INITIAL_PRODUCTS
code = code.replace(/imageUrl:\s*'https:\/\/images\.unsplash\.com[^']*'/g, `imageUrl: '${PART_IMAGES.GENERIC_SPARE}'`);

fs.writeFileSync('src/mock/initialData.ts', code, 'utf8');
console.log('✅ Updated src/mock/initialData.ts with offline Base64 graphics');
