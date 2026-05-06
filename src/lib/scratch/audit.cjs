const fs = require('fs');
const content = fs.readFileSync('C:/Users/akbur/roboatlas/src/lib/mockData.ts', 'utf8');

// Count entries
const entCount = (content.match(/entegrator_adi:/g) || []).length;
console.log('Total entegrators in raw array:', entCount);

// Check for any hardcoded top-level puan: X.X (not inside yorum_listesi)
const hardcodedPuan = (content.match(/^    puan: [\d.]+,/gm) || []);
console.log('Hardcoded top-level puan lines:', hardcodedPuan.length, hardcodedPuan);

// Check calculateAverages exists
console.log('calculateAverages:', content.includes('calculateAverages') ? 'EXISTS' : 'MISSING');

// Check map usage
console.log('rawEntegratorler.map:', content.includes('rawEntegratorler.map') ? 'EXISTS' : 'MISSING');

// Count yorum_listesi occurrences
const yorumCount = (content.match(/yorum_listesi:/g) || []).length;
console.log('yorum_listesi entries:', yorumCount, '(should equal', entCount, ')');

// Verify math for first entegrator
const firstBlock = content.match(/entegrator_adi: 'RoboTech.*?yorum_listesi: \[([\s\S]*?)\],/);
if (firstBlock) {
  const block = firstBlock[1];
  const kaliteMatches = block.match(/"kalite_puan": ([\d.]+)/g) || [];
  const vals = kaliteMatches.map(m => parseFloat(m.split(': ')[1]));
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  console.log('\nRoboTech kalite puanlar:', vals, '=> ort:', avg.toFixed(1));
}
