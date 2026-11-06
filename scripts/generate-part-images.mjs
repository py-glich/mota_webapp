import fs from 'fs';

function buildSvg(title, subtitle, accentColor, innerSvg) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141c2e"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#080c16"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accentColor}"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background Card -->
  <rect width="240" height="240" rx="24" fill="url(#bgGrad)" stroke="#1e293b" stroke-width="2"/>
  <rect x="12" y="12" width="216" height="216" rx="18" fill="none" stroke="${accentColor}" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="8,6"/>

  <!-- Centered Technical Illustration -->
  <g transform="translate(0, -6)">
    ${innerSvg}
  </g>

  <!-- Title Badge Footer -->
  <g transform="translate(16, 184)">
    <rect width="208" height="42" rx="10" fill="#020617" fill-opacity="0.9" stroke="${accentColor}" stroke-opacity="0.4" stroke-width="1"/>
    <text x="104" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#ffffff" letter-spacing="1.2" text-anchor="middle">${title}</text>
    <text x="104" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="8.5" font-weight="700" fill="${accentColor}" letter-spacing="0.8" text-anchor="middle">${subtitle}</text>
  </g>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// 1. PISTON & CYLINDER
const PISTON_CYLINDER = buildSvg('CYLINDER & PISTON', 'ENGINE ASSEMBLY', '#e11d48', `
  <rect x="70" y="38" width="100" height="96" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="3"/>
  <line x1="62" y1="52" x2="178" y2="52" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="68" x2="178" y2="68" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="84" x2="178" y2="84" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="100" x2="178" y2="100" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <line x1="62" y1="116" x2="178" y2="116" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  <circle cx="120" cy="85" r="32" fill="#0f172a" stroke="#ffffff" stroke-width="3"/>
  <circle cx="120" cy="85" r="16" fill="#f43f5e"/>
  <circle cx="120" cy="85" r="8" fill="#ffffff"/>
`);

// 2. CLUTCH PLATE SET
const CLUTCH_PLATES = buildSvg('CLUTCH PLATE SET', '5-PIECE FRICTION KIT', '#f97316', `
  <circle cx="120" cy="88" r="54" fill="none" stroke="#f97316" stroke-width="6"/>
  <circle cx="120" cy="88" r="42" fill="#1e293b" stroke="#fb923c" stroke-width="4"/>
  <circle cx="120" cy="88" r="22" fill="#0f172a" stroke="#fed7aa" stroke-width="3"/>
  <!-- Teeth -->
  <path d="M120 28 L120 38 M120 138 L120 148 M60 88 L70 88 M170 88 L180 88 M78 46 L85 53 M155 123 L162 130 M78 130 L85 123 M155 53 L162 46" stroke="#f97316" stroke-width="5" stroke-linecap="round"/>
  <circle cx="120" cy="88" r="6" fill="#ffffff"/>
`);

// 3. 4T LUBRICANT CANISTER
const ENGINE_OIL = buildSvg('4T MOTORCYCLE OIL', '20W-50 / 10W-40', '#10b981', `
  <path d="M90 42 L150 42 L162 70 L162 142 L78 142 L78 70 Z" fill="#1e293b" stroke="#10b981" stroke-width="4" stroke-linejoin="round"/>
  <rect x="106" y="28" width="28" height="14" rx="3" fill="#34d399" stroke="#059669" stroke-width="2"/>
  <rect x="88" y="74" width="64" height="52" rx="6" fill="#0f172a" stroke="#059669" stroke-width="2"/>
  <path d="M120 86 C120 86 102 108 102 118 C102 128 110 134 120 134 C130 134 138 128 138 118 C138 108 120 86 120 86 Z" fill="#34d399"/>
  <circle cx="120" cy="122" r="4" fill="#ffffff"/>
`);

// 4. CHAIN SPROCKET KIT
const CHAIN_SPROCKET = buildSvg('CHAIN SPROCKET KIT', 'DRIVE & ROLLER CHAIN', '#3b82f6', `
  <circle cx="106" cy="82" r="44" fill="#1e293b" stroke="#3b82f6" stroke-width="5"/>
  <circle cx="106" cy="82" r="24" fill="#0f172a" stroke="#60a5fa" stroke-width="3"/>
  <circle cx="106" cy="82" r="10" fill="#ffffff"/>
  <!-- Small front sprocket -->
  <circle cx="154" cy="112" r="22" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="154" cy="112" r="6" fill="#ffffff"/>
  <!-- Chain loop line -->
  <path d="M106 38 L154 90 M106 126 L154 134" stroke="#93c5fd" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,4"/>
`);

// 5. BRAKE SYSTEM & SHOE
const BRAKE_SYSTEM = buildSvg('BRAKE SHOE / DISC', 'HYDRAULIC & DRUM', '#06b6d4', `
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
`);

// 6. MOTORCYCLE TYRE
const MOTORCYCLE_TYRE = buildSvg('TYRE & TUBE', 'ALL-WEATHER TREAD', '#64748b', `
  <circle cx="120" cy="88" r="58" fill="none" stroke="#334155" stroke-width="18"/>
  <circle cx="120" cy="88" r="58" fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="8,8"/>
  <circle cx="120" cy="88" r="38" fill="#1e293b" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="120" cy="88" r="16" fill="#0f172a" stroke="#ffffff" stroke-width="3"/>
  <line x1="120" y1="50" x2="120" y2="72" stroke="#38bdf8" stroke-width="3"/>
  <line x1="120" y1="104" x2="120" y2="126" stroke="#38bdf8" stroke-width="3"/>
  <line x1="82" y1="88" x2="104" y2="88" stroke="#38bdf8" stroke-width="3"/>
  <line x1="136" y1="88" x2="158" y2="88" stroke="#38bdf8" stroke-width="3"/>
`);

// 7. ELECTRICAL & SPARK PLUG
const ELECTRICAL_PARTS = buildSvg('SPARK PLUG / IGNITION', 'ELECTRICAL SYSTEM', '#eab308', `
  <rect x="110" y="32" width="20" height="26" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
  <rect x="104" y="58" width="32" height="42" rx="4" fill="#334155" stroke="#facc15" stroke-width="3"/>
  <line x1="104" y1="72" x2="136" y2="72" stroke="#ca8a04" stroke-width="2"/>
  <line x1="104" y1="86" x2="136" y2="86" stroke="#ca8a04" stroke-width="2"/>
  <rect x="112" y="100" width="16" height="34" fill="#1e293b" stroke="#eab308" stroke-width="2.5"/>
  <polygon points="120,52 108,86 118,86 114,116 132,80 122,80" fill="#facc15" stroke="#ca8a04" stroke-width="1.5"/>
`);

// 8. BODY PARTS & FRAME
const BODY_PARTS = buildSvg('BODY & CHASSIS', 'FRAME / TANK / COVERS', '#8b5cf6', `
  <path d="M56 104 C64 68 114 62 144 68 C174 74 186 96 172 116 C158 136 84 136 56 104 Z" fill="#1e293b" stroke="#a78bfa" stroke-width="4"/>
  <path d="M88 74 C112 72 134 76 154 84" stroke="#c4b5fd" stroke-width="3" stroke-linecap="round"/>
  <circle cx="82" cy="120" r="14" fill="#0f172a" stroke="#8b5cf6" stroke-width="3"/>
  <circle cx="158" cy="120" r="14" fill="#0f172a" stroke="#8b5cf6" stroke-width="3"/>
  <line x1="82" y1="120" x2="158" y2="120" stroke="#a78bfa" stroke-width="3"/>
`);

// 9. HELMET & ACCESSORIES
const HELMET_ACCESSORIES = buildSvg('HELMET & ACCESSORIES', 'RIDER GEAR & SPARES', '#ec4899', `
  <path d="M68 114 C68 68 102 50 128 50 C166 50 188 76 188 114 C188 136 170 148 144 148 L96 148 C78 148 68 136 68 114 Z" fill="#1e293b" stroke="#f472b6" stroke-width="4"/>
  <path d="M96 90 L166 90 C172 90 178 96 172 110 L146 118 L96 112 Z" fill="#0f172a" stroke="#fb7185" stroke-width="3"/>
  <circle cx="94" cy="116" r="6" fill="#f43f5e"/>
`);

// 10. SUSPENSION / SHOCK ABSORBER
const SUSPENSION_SHOCK = buildSvg('SHOCK ABSORBERS', 'SUSPENSION SYSTEM', '#14b8a6', `
  <rect x="110" y="32" width="20" height="24" rx="10" fill="#1e293b" stroke="#2dd4bf" stroke-width="3"/>
  <rect x="114" y="56" width="12" height="74" fill="#0f172a" stroke="#5eead4" stroke-width="2"/>
  <!-- Spring coils -->
  <path d="M102 68 Q138 74 102 80 Q138 86 102 92 Q138 98 102 104 Q138 110 102 116 Q138 122 102 128" fill="none" stroke="#14b8a6" stroke-width="5" stroke-linecap="round"/>
  <rect x="110" y="130" width="20" height="20" rx="6" fill="#1e293b" stroke="#2dd4bf" stroke-width="3"/>
`);

// 11. GENERIC SPARE PART
const GENERIC_SPARE = buildSvg('GENUINE SPARE PART', 'OEM MOTORCYCLE COMPONENT', '#e11d48', `
  <circle cx="120" cy="86" r="48" fill="#1e293b" stroke="#e11d48" stroke-width="5"/>
  <circle cx="120" cy="86" r="26" fill="#0f172a" stroke="#ffffff" stroke-width="3"/>
  <path d="M120 38 L120 54 M120 118 L120 134 M72 86 L88 86 M152 86 L168 86" stroke="#f43f5e" stroke-width="6" stroke-linecap="round"/>
  <polygon points="120,68 132,96 108,96" fill="#f43f5e"/>
`);

const dict = {
  PISTON_CYLINDER,
  CLUTCH_PLATES,
  ENGINE_OIL,
  CHAIN_SPROCKET,
  BRAKE_SYSTEM,
  MOTORCYCLE_TYRE,
  ELECTRICAL_PARTS,
  BODY_PARTS,
  HELMET_ACCESSORIES,
  SUSPENSION_SHOCK,
  GENERIC_SPARE
};

console.log('Generated base64 graphics:');
for (const [k, v] of Object.entries(dict)) {
  console.log(`- ${k}: ${v.length} chars, prefix: ${v.slice(0, 40)}`);
}

fs.writeFileSync('scripts/part-images.json', JSON.stringify(dict, null, 2));
console.log('Saved to scripts/part-images.json');
