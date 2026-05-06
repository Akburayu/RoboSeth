const fs = require('fs');

let content = fs.readFileSync('C:/Users/akbur/roboatlas/src/lib/mockData.ts', 'utf8');

// 1. Change the array declaration
content = content.replace('export const mockEntegratorler: MockEntegrator[] = [', 'const rawEntegratorler: any[] = [');

// 2. Remove hardcoded puan and detayli_puanlar
content = content.replace(/    puan:\s*[\d.]+,\n    detayli_puanlar:\s*\{[\s\S]*?\},\n/g, '');

// 3. Insert the calculation logic at the end of the array
const calcCode = `];

const calculateAverages = (yorumlar: any[]) => {
  if (!yorumlar || yorumlar.length === 0) {
    return { kalite: 0, musteri_iliskisi: 0, surec: 0, genel: 0 };
  }
  
  let totalK = 0, totalM = 0, totalS = 0;
  yorumlar.forEach(y => {
    totalK += y.kalite_puan;
    totalM += y.musteri_iliskisi_puan;
    totalS += y.surec_yonetimi_puan;
  });
  
  const count = yorumlar.length;
  const kalite = Number((totalK / count).toFixed(1));
  const musteri_iliskisi = Number((totalM / count).toFixed(1));
  const surec = Number((totalS / count).toFixed(1));
  const genel = Number(((kalite + musteri_iliskisi + surec) / 3).toFixed(1));
  
  return { kalite, musteri_iliskisi, surec, genel };
};

export const mockEntegratorler: MockEntegrator[] = rawEntegratorler.map(ent => {
  const avgs = calculateAverages(ent.yorum_listesi || []);
  return {
    ...ent,
    puan: avgs.genel,
    detayli_puanlar: {
      kalite: avgs.kalite,
      musteri_iliskisi: avgs.musteri_iliskisi,
      surec: avgs.surec
    }
  } as MockEntegrator;
});

export const mockFirmalar`;

content = content.replace('];\n\nexport const mockFirmalar', calcCode);

fs.writeFileSync('C:/Users/akbur/roboatlas/src/lib/mockData.ts', content, 'utf8');
console.log('Refactored mockData.ts successfully');
