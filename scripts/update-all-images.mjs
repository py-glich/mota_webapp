import fs from 'fs';
import path from 'path';

// Clean, 100% valid XML SVG base64 strings with &amp;
const makePartSvg = (innerContent, title, subtitle, color, borderDash = "8,6") => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141c2e"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#080c16"/>
    </linearGradient>
  </defs>
  <rect width="240" height="240" rx="24" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="2"/>
  <rect x="12" y="12" width="216" height="216" rx="18" fill="none" stroke="${color}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="${borderDash}"/>
  <g transform="translate(0, -6)">
    ${innerContent}
  </g>
  <g transform="translate(16, 184)">
    <rect width="208" height="42" rx="10" fill="#020617" fill-opacity="0.9" stroke="${color}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="104" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff" letter-spacing="1.2" text-anchor="middle">${title}</text>
    <text x="104" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" fill="${color}" letter-spacing="0.8" text-anchor="middle">${subtitle}</text>
  </g>
</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
};

const PISTON_CYLINDER = makePartSvg(`
  <rect x="70" y="38" width="100" height="96" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="3"/>
  <line x1="62" y1="52" x2="178" y2="52" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="68" x2="178" y2="68" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="84" x2="178" y2="84" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="100" x2="178" y2="100" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="116" x2="178" y2="116" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <circle cx="120" cy="85" r="32" fill="#0f172a" stroke="#ffffff" stroke-width="3"/>
  <circle cx="120" cy="85" r="16" fill="#f43f5e"/>
  <circle cx="120" cy="85" r="8" fill="#ffffff"/>
`, 'CYLINDER &amp; PISTON', 'ENGINE ASSEMBLY', '#e11d48');

const CLUTCH_PLATES = makePartSvg(`
  <circle cx="120" cy="88" r="54" fill="none" stroke="#f97316" stroke-width="6"/>
  <circle cx="120" cy="88" r="42" fill="#1e293b" stroke="#fb923c" stroke-width="4"/>
  <circle cx="120" cy="88" r="22" fill="#0f172a" stroke="#fed7aa" stroke-width="3"/>
  <path d="M120 28 L120 38 M120 138 L120 148 M60 88 L70 88 M170 88 L180 88 M78 46 L85 53 M155 123 L162 130 M78 130 L85 123 M155 53 L162 46" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
  <circle cx="120" cy="88" r="6" fill="#ffffff"/>
`, 'CLUTCH PLATE SET', '5-PIECE FRICTION KIT', '#f97316');

const ENGINE_OIL = makePartSvg(`
  <path d="M90 42 L150 42 L162 70 L162 142 L78 142 L78 70 Z" fill="#1e293b" stroke="#10b981" stroke-width="4" stroke-linejoin="round"/>
  <rect x="106" y="28" width="28" height="14" rx="3" fill="#34d399" stroke="#059669" stroke-width="2"/>
  <rect x="88" y="74" width="64" height="52" rx="6" fill="#0f172a" stroke="#059669" stroke-width="2"/>
  <path d="M120 86 C120 86 102 108 102 118 C102 128 110 134 120 134 C130 134 138 128 138 118 C138 108 120 86 120 86 Z" fill="#34d399"/>
  <circle cx="120" cy="122" r="4" fill="#ffffff"/>
`, '4T MOTORCYCLE OIL', '20W-50 / 10W-40', '#10b981');

const CHAIN_SPROCKET = makePartSvg(`
  <circle cx="106" cy="82" r="44" fill="#1e293b" stroke="#3b82f6" stroke-width="5"/>
  <circle cx="106" cy="82" r="24" fill="#0f172a" stroke="#60a5fa" stroke-width="3"/>
  <circle cx="106" cy="82" r="10" fill="#ffffff"/>
  <circle cx="154" cy="112" r="22" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="154" cy="112" r="6" fill="#ffffff"/>
  <path d="M106 38 L154 90 M106 126 L154 134" stroke="#93c5fd" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,4"/>
`, 'CHAIN SPROCKET KIT', 'DRIVE &amp; ROLLER CHAIN', '#3b82f6');

const BRAKE_SYSTEM = makePartSvg(`
  <circle cx="120" cy="88" r="54" fill="none" stroke="#06b6d4" stroke-width="8"/>
  <circle cx="120" cy="88" r="32" fill="#1e293b" stroke="#22d3ee" stroke-width="3"/>
  <circle cx="120" cy="56" r="4" fill="#ffffff"/>
  <circle cx="120" cy="120" r="4" fill="#ffffff"/>
  <circle cx="88" cy="88" r="4" fill="#ffffff"/>
  <circle cx="152" cy="88" r="4" fill="#ffffff"/>
  <circle cx="97" cy="65" r="3.5" fill="#ffffff"/>
  <circle cx="143" cy="111" r="3.5" fill="#ffffff"/>
  <circle cx="97" cy="111" r="3.5" fill="#ffffff"/>
  <circle cx="143" cy="65" r="3.5" fill="#ffffff"/>
  <path d="M142 54 L172 74 L162 108 L134 94 Z" fill="#0891b2" stroke="#22d3ee" stroke-width="2.5"/>
`, 'BRAKE SHOE / DISC', 'HYDRAULIC &amp; DRUM', '#06b6d4');

const MOTORCYCLE_TYRE = makePartSvg(`
  <circle cx="120" cy="88" r="58" fill="none" stroke="#334155" stroke-width="18"/>
  <circle cx="120" cy="88" r="58" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="8,8"/>
  <circle cx="120" cy="88" r="38" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="120" cy="88" r="16" fill="#0f172a" stroke="#ffffff" stroke-width="3"/>
  <line x1="120" y1="50" x2="120" y2="72" stroke="#38bdf8" stroke-width="3"/>
  <line x1="120" y1="104" x2="120" y2="126" stroke="#38bdf8" stroke-width="3"/>
  <line x1="82" y1="88" x2="104" y2="88" stroke="#38bdf8" stroke-width="3"/>
  <line x1="136" y1="88" x2="158" y2="88" stroke="#38bdf8" stroke-width="3"/>
`, 'TYRE &amp; TUBE', 'ALL-WEATHER TREAD', '#64748b');

const ELECTRICAL_PARTS = makePartSvg(`
  <rect x="110" y="32" width="20" height="26" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <rect x="104" y="58" width="32" height="42" rx="4" fill="#334155" stroke="#facc15" stroke-width="3"/>
  <line x1="104" y1="72" x2="136" y2="72" stroke="#ca8a04" stroke-width="2"/>
  <line x1="104" y1="86" x2="136" y2="86" stroke="#ca8a04" stroke-width="2"/>
  <rect x="112" y="100" width="16" height="34" fill="#1e293b" stroke="#eab308" stroke-width="2.5"/>
  <polygon points="120,52 108,86 118,86 114,116 132,80 122,80" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
`, 'SPARK PLUG / IGNITION', 'ELECTRICAL SYSTEM', '#eab308');

const BODY_PARTS = makePartSvg(`
  <path d="M56 104 C64 68 114 62 144 68 C174 74 186 96 172 116 C158 136 84 136 56 104 Z" fill="#1e293b" stroke="#a78bfa" stroke-width="4"/>
  <path d="M88 74 C112 72 134 76 154 84" stroke="#c4b5fd" stroke-width="3" stroke-linecap="round"/>
  <circle cx="82" cy="120" r="14" fill="#0f172a" stroke="#8b5cf6" stroke-width="3"/>
  <circle cx="158" cy="120" r="14" fill="#0f172a" stroke="#8b5cf6" stroke-width="3"/>
  <line x1="82" y1="120" x2="158" y2="120" stroke="#a78bfa" stroke-width="3"/>
`, 'BODY &amp; CHASSIS', 'FRAME / TANK / COVERS', '#8b5cf6');

const HELMET_ACCESSORIES = makePartSvg(`
  <path d="M68 114 C68 68 102 50 128 50 C166 50 188 76 188 114 C188 136 170 148 144 148 L96 148 C78 148 68 136 68 114 Z" fill="#1e293b" stroke="#f472b6" stroke-width="4"/>
  <path d="M96 90 L166 90 C172 90 178 96 172 110 L146 118 L96 112 Z" fill="#0f172a" stroke="#fb7185" stroke-width="3"/>
  <circle cx="94" cy="116" r="6" fill="#f43f5e"/>
`, 'HELMET &amp; ACCESSORIES', 'RIDER GEAR &amp; SPARES', '#ec4899');

const SUSPENSION_SHOCK = makePartSvg(`
  <rect x="110" y="32" width="20" height="24" rx="10" fill="#1e293b" stroke="#2dd4bf" stroke-width="3"/>
  <rect x="114" y="56" width="12" height="74" fill="#0f172a" stroke="#5eead4" stroke-width="2"/>
  <path d="M102 68 Q138 74 102 80 Q138 86 102 92 Q138 98 102 104 Q138 110 102 116 Q138 122 102 128" fill="none" stroke="#14b8a6" stroke-width="5" stroke-linecap="round"/>
  <rect x="110" y="130" width="20" height="20" rx="6" fill="#1e293b" stroke="#2dd4bf" stroke-width="3"/>
`, 'SHOCK ABSORBERS', 'SUSPENSION SYSTEM', '#14b8a6');

const GENERIC_SPARE = makePartSvg(`
  <circle cx="120" cy="86" r="48" fill="#1e293b" stroke="#e11d48" stroke-width="5"/>
  <circle cx="120" cy="86" r="26" fill="#0f172a" stroke="#ffffff" stroke-width="3"/>
  <path d="M120 38 L120 54 M120 118 L120 134 M72 86 L88 86 M152 86 L168 86" stroke="#f43f5e" stroke-width="6" stroke-linecap="round"/>
  <polygon points="120,68 132,96 108,96" fill="#f43f5e"/>
`, 'GENUINE SPARE PART', 'OEM MOTORCYCLE COMPONENT', '#e11d48');

// User Avatar SVGs (100% offline)
const makeUserAvatarSvg = (initials, bgGrad1, bgGrad2, strokeColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="avGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGrad1}"/>
      <stop offset="100%" stop-color="${bgGrad2}"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#avGrad)" stroke="${strokeColor}" stroke-width="3"/>
  <circle cx="60" cy="46" r="20" fill="#ffffff" fill-opacity="0.95"/>
  <path d="M26 102 C26 78, 42 72, 60 72 C78 72, 94 78, 94 102 Z" fill="#ffffff" fill-opacity="0.95"/>
  <circle cx="60" cy="60" r="54" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
</svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
};

const USER_AVATARS = {
  OWNER: makeUserAvatarSvg('FI', '#e11d48', '#881337', '#f43f5e'),
  MANAGER: makeUserAvatarSvg('TM', '#f59e0b', '#78350f', '#fbbf24'),
  CASHIER_1: makeUserAvatarSvg('HA', '#06b6d4', '#164e63', '#22d3ee'),
  CASHIER_2: makeUserAvatarSvg('BH', '#10b981', '#064e3b', '#34d399'),
  DEFAULT: makeUserAvatarSvg('MP', '#6366f1', '#312e81', '#818cf8'),
};

console.log('✅ Generated all SVGs');

// 1. Update imageUtils.ts
const imageUtilsContent = `/**
 * CYBERORION MOTOPRO - Intelligent Image Optimization & Motorcycle Parts Graphics Engine
 * 100% Offline, Zero External Network Dependency, High-Resolution Crisp Vector Base64
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Resizes any image file (from camera, file picker, or clipboard) client-side using an offscreen HTML5 canvas.
 * Produces a lightweight, highly-compressed Base64 JPEG (typically 20KB - 50KB instead of 3MB+).
 */
export async function resizeImage(file: File | Blob, options: ResizeOptions = {}): Promise<string> {
  const { maxWidth = 480, maxHeight = 480, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = event => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        return reject(new Error('Empty image payload'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate proportional dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl);
        }

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(resizedDataUrl);
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// 100% OFFLINE BASE64 MOTORCYCLE PARTS GRAPHICS
// Guaranteed valid XML and render instantly in every browser without network
// ---------------------------------------------------------------------------
export const PART_IMAGES = {
  PISTON_CYLINDER: "${PISTON_CYLINDER}",
  CLUTCH_PLATES: "${CLUTCH_PLATES}",
  ENGINE_OIL: "${ENGINE_OIL}",
  CHAIN_SPROCKET: "${CHAIN_SPROCKET}",
  BRAKE_SYSTEM: "${BRAKE_SYSTEM}",
  MOTORCYCLE_TYRE: "${MOTORCYCLE_TYRE}",
  ELECTRICAL_PARTS: "${ELECTRICAL_PARTS}",
  BODY_PARTS: "${BODY_PARTS}",
  HELMET_ACCESSORIES: "${HELMET_ACCESSORIES}",
  SUSPENSION_SHOCK: "${SUSPENSION_SHOCK}",
  GENERIC_SPARE: "${GENERIC_SPARE}"
};

// ---------------------------------------------------------------------------
// 100% OFFLINE USER AVATARS
// ---------------------------------------------------------------------------
export const USER_AVATARS = {
  OWNER: "${USER_AVATARS.OWNER}",
  MANAGER: "${USER_AVATARS.MANAGER}",
  CASHIER_1: "${USER_AVATARS.CASHIER_1}",
  CASHIER_2: "${USER_AVATARS.CASHIER_2}",
  DEFAULT: "${USER_AVATARS.DEFAULT}"
};

export function getUserAvatar(avatarUrl?: string, role?: string, username?: string): string {
  if (avatarUrl && avatarUrl.startsWith('data:image/')) {
    return avatarUrl;
  }
  if (!avatarUrl || avatarUrl.includes('unsplash.com') || avatarUrl.includes('placeholder')) {
    if (role === 'owner' || username === 'owner') return USER_AVATARS.OWNER;
    if (role === 'manager' || username === 'manager') return USER_AVATARS.MANAGER;
    if (username === 'cashier2') return USER_AVATARS.CASHIER_2;
    if (role === 'cashier' || username === 'cashier1') return USER_AVATARS.CASHIER_1;
    return USER_AVATARS.DEFAULT;
  }
  return avatarUrl;
}

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'CAT-ENG': PART_IMAGES.PISTON_CYLINDER,
  'CAT-BRK': PART_IMAGES.BRAKE_SYSTEM,
  'CAT-ELE': PART_IMAGES.ELECTRICAL_PARTS,
  'CAT-TYR': PART_IMAGES.MOTORCYCLE_TYRE,
  'CAT-LUB': PART_IMAGES.ENGINE_OIL,
  'CAT-BDY': PART_IMAGES.BODY_PARTS,
  'CAT-ACC': PART_IMAGES.HELMET_ACCESSORIES,
};

export const DEFAULT_MOTORCYCLE_PART_IMAGE = PART_IMAGES.GENERIC_SPARE;

/**
 * Intelligent Keyword & Category Matcher:
 * Examines product title or category to return the most accurate, realistic motorcycle part visual.
 */
export function matchPartGraphic(productName?: string, categoryId?: string): string {
  const name = (productName || '').toLowerCase();

  // Keyword-specific matches
  if (name.includes('piston') || name.includes('cylinder') || name.includes('ring')) {
    return PART_IMAGES.PISTON_CYLINDER;
  }
  if (name.includes('clutch') || name.includes('friction') || name.includes('plate')) {
    return PART_IMAGES.CLUTCH_PLATES;
  }
  if (name.includes('oil') || name.includes('lubricant') || name.includes('havoline') || name.includes('mobil') || name.includes('4t')) {
    return PART_IMAGES.ENGINE_OIL;
  }
  if (name.includes('chain') || name.includes('sprocket') || name.includes('garari')) {
    return PART_IMAGES.CHAIN_SPROCKET;
  }
  if (name.includes('brake') || name.includes('disc') || name.includes('shoe') || name.includes('pad') || name.includes('caliper')) {
    return PART_IMAGES.BRAKE_SYSTEM;
  }
  if (name.includes('tyre') || name.includes('tire') || name.includes('tube') || name.includes('servis') || name.includes('panther')) {
    return PART_IMAGES.MOTORCYCLE_TYRE;
  }
  if (name.includes('plug') || name.includes('spark') || name.includes('battery') || name.includes('coil') || name.includes('light') || name.includes('bulb') || name.includes('horn') || name.includes('ngk')) {
    return PART_IMAGES.ELECTRICAL_PARTS;
  }
  if (name.includes('shock') || name.includes('suspension') || name.includes('jump') || name.includes('fork') || name.includes('spring')) {
    return PART_IMAGES.SUSPENSION_SHOCK;
  }
  if (name.includes('tank') || name.includes('frame') || name.includes('cover') || name.includes('guard') || name.includes('fender') || name.includes('chassis') || name.includes('body')) {
    return PART_IMAGES.BODY_PARTS;
  }
  if (name.includes('helmet') || name.includes('glove') || name.includes('lock') || name.includes('accessory') || name.includes('mirror') || name.includes('indicator')) {
    return PART_IMAGES.HELMET_ACCESSORIES;
  }

  // Category fallback
  if (categoryId && CATEGORY_FALLBACK_IMAGES[categoryId]) {
    return CATEGORY_FALLBACK_IMAGES[categoryId];
  }

  return DEFAULT_MOTORCYCLE_PART_IMAGE;
}

/**
 * Returns a guaranteed valid image URL for any product:
 * 1. If product has ANY local base64 image (JPEG, PNG, WebP, SVG, GIF), return it immediately.
 * 2. If product has an external URL that might be blocked or fail (like Unsplash), returns the 100% offline crisp part graphic.
 * 3. Never returns empty or broken links.
 */
export function getProductDisplayImage(imageUrl?: string, categoryId?: string, productName?: string): string {
  // If user uploaded/assigned a real base64 image, use it directly
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }

  // If imageUrl is an external URL (Unsplash, CDN, etc.) or missing — replace with local offline graphic
  if (!imageUrl || imageUrl.includes('unsplash.com') || imageUrl.includes('placeholder') || imageUrl.trim().length === 0) {
    return matchPartGraphic(productName, categoryId);
  }

  // For any http/https URL that isn't explicitly blocked, return as-is
  return imageUrl;
}
`;

fs.writeFileSync('src/utils/imageUtils.ts', imageUtilsContent, 'utf8');
console.log('✅ Updated src/utils/imageUtils.ts');
