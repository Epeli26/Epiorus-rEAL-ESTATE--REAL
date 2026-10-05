const fs = require('fs');
const path = require('path');
const content = fs.readFileSync('public/data/properties.js', 'utf8');
const matches = [...content.matchAll(/"(\/[a-zA-Z0-9_\-]+\/[^"]+\.(?:jpg|jpeg|png|webp))"/gi)].map(m => m[1]);
const unique = [...new Set(matches)];
console.log('Total image refs:', matches.length, 'Unique:', unique.length);
let missing = [];
let caseMismatch = [];
for (const ref of unique) {
  const rel = ref.replace(/^\//, '');
  const full = path.join('public', rel);
  const dir = path.dirname(full);
  const base = path.basename(full);
  if (!fs.existsSync(dir)) { missing.push(ref + ' (dir missing)'); continue; }
  const files = fs.readdirSync(dir);
  if (!files.includes(base)) {
    const ci = files.find(f => f.toLowerCase() === base.toLowerCase());
    if (ci) caseMismatch.push(ref + '  ACTUAL: ' + ci);
    else missing.push(ref);
  }
}
console.log('Missing count:', missing.length);
missing.slice(0, 80).forEach(m => console.log('MISSING:', m));
console.log('Case mismatch count:', caseMismatch.length);
caseMismatch.slice(0, 80).forEach(m => console.log('CASE:', m));
