const fs = require('fs');

const pairs = JSON.parse(fs.readFileSync('comments_pairs.json', 'utf8'));

const existing10Names = ['RoboTech Otomasyon', 'MechSys Endustriyel Cozumler', 'AutoLine Robotik', 'SmartFab Sistemleri', 'Ileri Hareket Otomasyon', 'CoreRobotics', 'Apex Otomasyon Teknolojileri', 'VisionTech Makine', 'Nova Robotik Sistemler', 'GigaMekatronik'];
const new15Names = ['Nodus Robotik', 'Optima Otomasyon', 'CyberMekatronik', 'ProLine Sistem', 'Kinetik Endustriyel', 'Nexus Makine', 'Aura Robotik', 'Sentetik Otomasyon', 'Vektor Kontrol Sistemleri', 'Zenith Mekatronik', 'Omega Endustriyel', 'Lojik Robotik', 'Spektrum Otomasyon', 'Dinamik Proses', 'Pulsar Entegrasyon'];
const allNames = [...existing10Names, ...new15Names];

const locations = ['Kocaeli, GOSB', 'Bursa, NOSAB', 'Izmir, ITOB', 'Gaziantep OSB', 'Istanbul, DES Sanayi', 'Ankara, OSTIM', 'Manisa, MOSB', 'Sakarya, 1. OSB', 'Kayseri, OSB'];
const expertise = ['Scada Sistemleri', 'PLC Programlama', 'Goruntu Isleme', 'Robotik Kaynak', 'AGV Sistemleri', 'Makine Besleme', 'Hat Sonu Paletleme', 'Kestirimci Bakim', 'CNC Besleme', 'Punta Kaynak'];
const sectors = ['Otomotiv Ana Sanayi', 'Otomotiv Yan Sanayi', 'Gida', 'Ilac', 'Beyaz Esya', 'Metal Isleme', 'Plastik', 'Savunma Sanayi'];
const buyukluk = ['kucuk', 'orta', 'buyuk'];
function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomElements(arr, count) { const shuffled = [...arr].sort(() => 0.5 - Math.random()); return shuffled.slice(0, count); }

const mockEntegratorler = allNames.map((name, i) => {
  const id = 'e1a1b1c1-1111-2222-3333-4444555566' + (i+1).toString().padStart(2, '0');
  const commentsData = pairs[i];
  
  const c1Date = new Date(Date.now() - Math.floor(Math.random() * 15000000000));
  const c2Date = new Date(Date.now() - 15000000000 - Math.floor(Math.random() * 15000000000));
  
  const finalComments = [
    {
      kalite_puan: commentsData[0].k,
      musteri_iliskisi_puan: commentsData[0].m,
      surec_yonetimi_puan: commentsData[0].s,
      yorum: commentsData[0].text,
      created_at: c1Date.toISOString(),
      author: commentsData[0].author
    },
    {
      kalite_puan: commentsData[1].k,
      musteri_iliskisi_puan: commentsData[1].m,
      surec_yonetimi_puan: commentsData[1].s,
      yorum: commentsData[1].text,
      created_at: c2Date.toISOString(),
      author: commentsData[1].author
    }
  ];

  const avgK = Number(((commentsData[0].k + commentsData[1].k) / 2).toFixed(2));
  const avgM = Number(((commentsData[0].m + commentsData[1].m) / 2).toFixed(2));
  const avgS = Number(((commentsData[0].s + commentsData[1].s) / 2).toFixed(2));
  
  const genelPuan = Number(((avgK + avgM + avgS) / 3).toFixed(1));
  const expYears = Math.floor(Math.random() * 23) + 3;

  return '  {\n' +
    '    id: \'' + id + '\',\n' +
    '    entegrator_adi: \'' + name + '\',\n' +
    '    entegrator_buyuklugu: \'' + randomElement(buyukluk) + '\',\n' +
    '    faaliyet_alanlari: \'' + randomElements(expertise, 3).join(', ') + '\',\n' +
    '    hizmet_verilen_iller: \'Tüm Türkiye\',\n' +
    '    iletisim_sosyal_medya: \'info@' + name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.tr\',\n' +
    '    kac_kisi: ' + (Math.floor(Math.random() * 150) + 10) + ',\n' +
    '    konum: \'' + randomElement(locations) + '\',\n' +
    '    puan: ' + genelPuan + ',\n' +
    '    detayli_puanlar: {\n' +
    '      kalite: ' + avgK + ',\n' +
    '      musteri_iliskisi: ' + avgM + ',\n' +
    '      surec: ' + avgS + '\n' +
    '    },\n' +
    '    yorum_listesi: ' + JSON.stringify(finalComments, null, 6).replace(/\n/g, '\n    ') + ',\n' +
    '    referans: \'' + randomElements(expertise, 2).join(' Entegrasyonu, ') + '.\',\n' +
    '    sektor: \'' + randomElement(sectors) + '\',\n' +
    '    tecrube: \'' + expYears + ' yıl\',\n' +
    '    uzmanlik_alani: \'' + randomElements(expertise, 2).join(', ') + '\',\n' +
    '    belgesi1: \'onaylandi\',\n' +
    '    belgesi2: \'onaylandi\',\n' +
    '    belgesi3: \'onaylandi\',\n' +
    '    created_at: new Date().toISOString(),\n' +
    '    email: \'info@' + name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '.com.tr\',\n' +
    '    user_id: null,\n' +
    '    yorumlar: null,\n' +
    '  }';
});

let original = fs.readFileSync('C:/Users/akbur/roboatlas/src/lib/mockData.ts', 'utf8');
const firmalarBlock = original.substring(original.indexOf('export const mockFirmalar'));

const fileContent = 'import type { Database } from \'@/integrations/supabase/types\';\n\n' +
'type Entegrator = Database[\'public\'][\'Tables\'][\'entegrator\'][\'Row\'];\n' +
'type Firma = Database[\'public\'][\'Tables\'][\'firma\'][\'Row\'];\n\n' +
'export type MockEntegrator = Entegrator & {\n' +
'  detayli_puanlar?: {\n' +
'    kalite: number;\n' +
'    musteri_iliskisi: number;\n' +
'    surec: number;\n' +
'  };\n' +
'  yorum_listesi?: Array<{kalite_puan: number, musteri_iliskisi_puan: number, surec_yonetimi_puan: number, yorum: string, created_at: string, author?: string}>;\n' +
'};\n\n' +
'export const mockEntegratorler: MockEntegrator[] = [\n' +
mockEntegratorler.join(',\n') + '\n' +
'];\n\n' + firmalarBlock;

fs.writeFileSync('C:/Users/akbur/roboatlas/src/lib/mockData.ts', fileContent, 'utf-8');
console.log('Math done.');
