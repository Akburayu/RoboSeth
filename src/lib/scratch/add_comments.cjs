const fs = require('fs');

let content = fs.readFileSync('C:/Users/akbur/roboatlas/src/lib/mockData.ts', 'utf-8');

const commentsTemplate = [
  { text: 'Robotik kaynak hattımızın kurulumunda çok profesyonel çalıştılar, devreye alma süreci sorunsuzdu.', author: 'Ahmet Y. - Fabrika Müdürü' },
  { text: 'Scada entegrasyonunda ufak gecikmeler oldu ama sonuç oldukça başarılı.', author: 'Selin K. - Üretim Sorumlusu' },
  { text: 'Hat sonu paletleme projesinde vizyonumuzu genişlettiler, döngü sürelerimiz ciddi şekilde düştü.', author: 'Mehmet B. - Hat Yöneticisi' },
  { text: 'Eksiksiz bir proje teslimatı yapıldı. İletişimleri kuvvetliydi.', author: 'Ayşe T. - Proje Yöneticisi' },
  { text: 'Tasarım aşamasından itibaren çok yardımcı oldular, vizyoner bir ekip.', author: 'Caner D. - Ar-Ge Sorumlusu' },
  { text: 'Görüntü işleme tabanlı kalite kontrol sisteminde sıfır hata ile devreye alma sağlandı.', author: 'Elif M. - Kalite Müdürü' },
  { text: 'Mekanik konstrüksiyon sağlam, ancak yazılım tarafında biraz daha hızlı aksiyon alınabilirdi.', author: 'Kemal Y. - Bakım Şefi' },
  { text: 'Beklediğimizden çok daha verimli bir proses tasarımı sundular.', author: 'Zeynep H. - Proses Mühendisi' },
  { text: 'Zorlu bir AGV entegrasyonunu minimum kesinti ile tamamladılar. Kesinlikle tavsiye ederim.', author: 'Burak C. - Lojistik Müdürü' },
  { text: 'Müşteri ilişkileri çok iyi, satış sonrası destekte çok hızlılar.', author: 'Tuğba A. - Satınalma Uzmanı' }
];

function getRandomComments(kalite, musteri, surec) {
  const count = Math.floor(Math.random() * 3) + 1; // 1 to 3
  const selected = commentsTemplate.sort(() => 0.5 - Math.random()).slice(0, count);
  return selected.map(c => {
    // Generate a random date within the past year
    const d = new Date(Date.now() - Math.floor(Math.random() * 31536000000));
    return `{
      kalite_puan: ${kalite},
      musteri_iliskisi_puan: ${musteri},
      surec_yonetimi_puan: ${surec},
      yorum: '${c.text}',
      created_at: '${d.toISOString()}',
      author: '${c.author}'
    }`;
  });
}

// Update the TS interface
content = content.replace(
  'surec: number;\n  }',
  'surec: number;\n  };\n  yorum_listesi?: Array<{kalite_puan: number, musteri_iliskisi_puan: number, surec_yonetimi_puan: number, yorum: string, created_at: string, author?: string}>;'
);

// Find each integrator block and insert yorum_listesi
// We can use a regex to find detayli_puanlar block and insert right after it
content = content.replace(/detayli_puanlar:\s*\{\s*kalite:\s*([\d.]+),\s*musteri_iliskisi:\s*([\d.]+),\s*surec:\s*([\d.]+)\s*\},/g, (match, k, m, s) => {
  const commentsStr = getRandomComments(k, m, s).join(',\\n      ');
  return `${match}\n    yorum_listesi: [\n      ${commentsStr}\n    ],`;
});

fs.writeFileSync('C:/Users/akbur/roboatlas/src/lib/mockData.ts', content.replace(/\\\\n/g, '\\n'), 'utf-8');
console.log('Successfully added comments to existing records.');
