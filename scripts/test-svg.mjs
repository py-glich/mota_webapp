import fs from 'fs';

function makeSvg(text, bg, stroke, detail) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="20" fill="url(#grad)" stroke="${stroke}" stroke-width="3"/>
  ${detail}
  <rect x="20" y="152" width="160" height="30" rx="8" fill="#020617" opacity="0.85"/>
  <text x="100" y="172" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="#f8fafc" letter-spacing="1" text-anchor="middle">${text}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const eng = makeSvg('PISTON / CYLINDER', '#0f172a', '#e11d48', `
  <circle cx="100" cy="85" r="42" fill="#1e293b" stroke="#e11d48" stroke-width="4"/>
  <rect x="75" y="55" width="50" height="58" rx="6" fill="#334155" stroke="#f43f5e" stroke-width="3"/>
  <line x1="75" y1="68" x2="125" y2="68" stroke="#f43f5e" stroke-width="2"/>
  <line x1="75" y1="78" x2="125" y2="78" stroke="#f43f5e" stroke-width="2"/>
  <line x1="75" y1="88" x2="125" y2="88" stroke="#f43f5e" stroke-width="2"/>
  <circle cx="100" cy="115" r="8" fill="#e11d48"/>
`);

console.log('Valid base64 URI length:', eng.length);
console.log('Sample:', eng.slice(0, 80));
