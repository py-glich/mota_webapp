/**
 * CYBERORION MOTOPRO - Intelligent Image Optimization & Motorcycle Parts Fallback Engine
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Resizes any image file (from camera or computer) client-side using an offscreen HTML5 canvas.
 * Produces a lightweight, highly-compressed Base64 JPEG (typically 20KB - 50KB instead of 3MB+).
 */
export async function resizeImage(file: File, options: ResizeOptions = {}): Promise<string> {
  const { maxWidth = 480, maxHeight = 480, quality = 0.82 } = options;

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

        // Draw onto canvas for smooth anti-aliased resizing
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl); // Fallback to raw dataUrl if canvas context unavailable
        }

        // Fill background with dark motorcycle shop theme in case of PNG transparency
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as clean, compact JPEG
        try {
          const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(resizedDataUrl);
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * SVG-based crisp motorcycle parts visual fallbacks per category.
 * Zero external network dependency; renders instantly under all network conditions.
 */
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  // Engine & Transmission
  'CAT-ENG': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230f172a"/><circle cx="100" cy="100" r="55" fill="none" stroke="%23e11d48" stroke-width="6"/><circle cx="100" cy="100" r="30" fill="%231e293b" stroke="%23f43f5e" stroke-width="4"/><path d="M100 25 L100 45 M100 155 L100 175 M25 100 L45 100 M155 100 L175 100 M47 47 L61 61 M139 139 L153 153 M47 153 L61 139 M139 61 L153 47" stroke="%23e11d48" stroke-width="6" stroke-linecap="round"/><text x="100" y="110" font-family="sans-serif" font-size="12" font-weight="900" fill="%23ffffff" text-anchor="middle">ENGINE</text></svg>`,

  // Brakes & Cables
  'CAT-BRK': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230f172a"/><circle cx="100" cy="100" r="60" fill="none" stroke="%230284c7" stroke-width="8"/><circle cx="100" cy="100" r="35" fill="%231e293b" stroke="%2338bdf8" stroke-width="4"/><circle cx="100" cy="65" r="4" fill="%23ffffff"/><circle cx="100" cy="135" r="4" fill="%23ffffff"/><circle cx="65" cy="100" r="4" fill="%23ffffff"/><circle cx="135" cy="100" r="4" fill="%23ffffff"/><circle cx="75" cy="75" r="4" fill="%23ffffff"/><circle cx="125" cy="125" r="4" fill="%23ffffff"/><circle cx="75" cy="125" r="4" fill="%23ffffff"/><circle cx="125" cy="75" r="4" fill="%23ffffff"/><text x="100" y="106" font-family="sans-serif" font-size="12" font-weight="900" fill="%23ffffff" text-anchor="middle">BRAKES</text></svg>`,

  // Electrical & Lighting
  'CAT-ELE': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230f172a"/><circle cx="100" cy="100" r="50" fill="%231e293b" stroke="%23eab308" stroke-width="4"/><polygon points="105,45 80,105 100,105 95,155 125,95 105,95" fill="%23eab308"/><text x="100" y="175" font-family="sans-serif" font-size="11" font-weight="900" fill="%23fde047" text-anchor="middle">ELECTRICAL</text></svg>`,

  // Tires & Tubes
  'CAT-TYR': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230f172a"/><circle cx="100" cy="100" r="65" fill="none" stroke="%23334155" stroke-width="16"/><circle cx="100" cy="100" r="65" fill="none" stroke="%2364748b" stroke-width="4" stroke-dasharray="6,8"/><circle cx="100" cy="100" r="40" fill="%231e293b" stroke="%230ea5e9" stroke-width="4"/><text x="100" y="106" font-family="sans-serif" font-size="13" font-weight="900" fill="%23ffffff" text-anchor="middle">TYRES</text></svg>`,

  // Lubricants & Oils
  'CAT-LUB': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230f172a"/><path d="M100 45 C100 45 65 95 65 125 C65 145 80 160 100 160 C120 160 135 145 135 125 C135 95 100 45 100 45 Z" fill="%2310b981" stroke="%23059669" stroke-width="3"/><path d="M90 115 C90 105 100 90 100 90 C100 90 110 105 110 115 C110 120 105 125 100 125 C95 125 90 120 90 115 Z" fill="%23ffffff" opacity="0.4"/><text x="100" y="180" font-family="sans-serif" font-size="11" font-weight="900" fill="%2334d399" text-anchor="middle">4T LUBRICANT</text></svg>`,

  // Body Parts & Frame
  'CAT-BDY': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230f172a"/><path d="M40 120 L80 60 L140 60 L160 90 L120 120 Z" fill="%231e293b" stroke="%238b5cf6" stroke-width="5" stroke-linejoin="round"/><circle cx="65" cy="130" r="16" fill="none" stroke="%238b5cf6" stroke-width="4"/><circle cx="145" cy="130" r="16" fill="none" stroke="%238b5cf6" stroke-width="4"/><text x="100" y="165" font-family="sans-serif" font-size="12" font-weight="900" fill="%23a78bfa" text-anchor="middle">BODY PARTS</text></svg>`,

  // Accessories & Safety
  'CAT-ACC': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230f172a"/><path d="M50 110 C50 70 80 50 100 50 C135 50 155 75 155 110 C155 130 140 145 115 145 L75 145 C60 145 50 130 50 110 Z" fill="%231e293b" stroke="%23f97316" stroke-width="5"/><path d="M75 90 L135 90 C140 90 145 95 140 108 L115 115 L75 110 Z" fill="%230f172a" stroke="%23fb923c" stroke-width="3"/><text x="100" y="170" font-family="sans-serif" font-size="12" font-weight="900" fill="%23fb923c" text-anchor="middle">HELMET & GEAR</text></svg>`,
};

export const DEFAULT_MOTORCYCLE_PART_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230f172a"/><circle cx="70" cy="125" r="28" fill="%231e293b" stroke="%23e11d48" stroke-width="5"/><circle cx="145" cy="125" r="28" fill="%231e293b" stroke="%23e11d48" stroke-width="5"/><path d="M70 125 L100 80 L130 80 L145 125 M100 80 L80 125" stroke="%23ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M125 70 L135 60 L145 60" stroke="%23e11d48" stroke-width="4" stroke-linecap="round"/><text x="100" y="175" font-family="sans-serif" font-size="11" font-weight="900" fill="%23fda4af" text-anchor="middle">SPARE PART</text></svg>`;

/**
 * Returns a guaranteed valid image URL for any product:
 * If product has an imageUrl, returns it.
 * Otherwise, returns the crisp SVG graphic tailored to that product's category.
 */
export function getProductDisplayImage(imageUrl?: string, categoryId?: string): string {
  if (imageUrl && imageUrl.trim().length > 0) {
    return imageUrl;
  }
  if (categoryId && CATEGORY_FALLBACK_IMAGES[categoryId]) {
    return CATEGORY_FALLBACK_IMAGES[categoryId];
  }
  return DEFAULT_MOTORCYCLE_PART_IMAGE;
}
