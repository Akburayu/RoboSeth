const fs = require('fs');
const existing10Names = ['RoboTech Otomasyon', 'MechSys Endüstriyel Çözümler', 'AutoLine Robotik', 'SmartFab Sistemleri', 'İleri Hareket Otomasyon', 'CoreRobotics', 'Apex Otomasyon Teknolojileri', 'VisionTech Makine', 'Nova Robotik Sistemler', 'GigaMekatronik'];
const new15Names = ['Nodus Robotik', 'Optima Otomasyon', 'CyberMekatronik', 'ProLine Sistem', 'Kinetik Endüstriyel', 'Nexus Makine', 'Aura Robotik', 'Sentetik Otomasyon', 'Vektör Kontrol Sistemleri', 'Zenith Mekatronik', 'Omega Endüstriyel', 'Lojik Robotik', 'Spektrum Otomasyon', 'Dinamik Proses', 'Pulsar Entegrasyon'];
const locations = ['Kocaeli, GOSB', 'Bursa, NOSAB', 'İzmir, İTOB', 'Gaziantep OSB', 'İstanbul, DES Sanayi', 'Ankara, OSTİM', 'Manisa, MOSB', 'Sakarya, 1. OSB', 'Kayseri, OSB'];
const expertise = ['Scada Sistemleri', 'PLC Programlama', 'Görüntü İşleme', 'Robotik Kaynak', 'AGV Sistemleri', 'Makine Besleme', 'Hat Sonu Paletleme', 'Kestirimci Bakım', 'CNC Besleme', 'Punta Kaynak'];
const sectors = ['Otomotiv Ana Sanayi', 'Otomotiv Yan Sanayi', 'Gıda', 'İlaç', 'Beyaz Eşya', 'Metal İşleme', 'Plastik', 'Savunma Sanayi'];
const buyukluk = ['kucuk', 'orta', 'buyuk'];
const authors = ['Ahmet Y. - Fabrika Müdürü', 'Selin K. - Üretim Sorumlusu', 'Mehmet B. - Hat Yöneticisi', 'Ayşe T. - Proje Yöneticisi', 'Caner D. - Ar-Ge Sorumlusu', 'Elif M. - Kalite Müdürü', 'Kemal Y. - Bakım Şefi', 'Zeynep H. - Proses Mühendisi', 'Burak C. - Lojistik Müdürü', 'Tuğba A. - Satınalma Uzmanı', 'Serkan T. - Tesis Yöneticisi', 'Cemre S. - Otomasyon Mühendisi', 'Hakan L. - Robotik Sorumlusu', 'Merve P. - Planlama Yöneticisi'];

function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomElements(arr, count) { const shuffled = [...arr].sort(() => 0.5 - Math.random()); return shuffled.slice(0, count); }

function getScoreText(score, type) {
  if (type === 'kalite') {
    if (score >= 4.5) return randomElement(['Üretim kalitesi mükemmel, sistem sıfır hata ile çalışıyor.', 'Çok sağlam ve yüksek hassasiyetli bir sistem kurdular.', 'Donanım seçimi ve mekanik konstrüksiyon son derece kaliteliydi.']);
    if (score >= 3.8) return randomElement(['Kalite standartlarımızı karşıladılar.', 'İyi tasarlanmış bir otomasyon hücresi teslim edildi.', 'Kabul edilebilir bir işçilik vardı, genel olarak memnunuz.']);
    return randomElement(['Devreye alma sonrası bazı kalite problemleri yaşadık.', 'Mekanik yapı beklediğimiz dayanıklılıkta değildi.', 'Bazı kaynak ve montaj hataları yüzünden revizyon gerekti.']);
  }
  if (type === 'surec') {
    if (score >= 4.5) return randomElement(['Süreç baştan sona kusursuz planlanmıştı.', 'Zamanında teslimat yapıldı, süreç harikaydı.', 'Aşamaları çok şeffaf yönettiler, hiçbir sürpriz yaşamadık.']);
    if (score >= 3.8) return randomElement(['Takvime genel olarak uyuldu.', 'Kurulum aşamasında planlama iyiydi.', 'Küçük sarkmalar olsa da süreci toparlamayı bildiler.']);
    return randomElement(['Proje teslimatı planlanandan uzun sürdü.', 'Süreç yönetiminde bazı aksaklıklar ve planlama hataları yaşandı.', 'Devreye alma süreci oldukça yorucu ve sancılı geçti.']);
  }
  if (type === 'musteri') {
    if (score >= 4.5) return randomElement(['Her an ulaşabildik, çok çözüm odaklı bir ekip.', 'İletişimleri ve ilgileri harikaydı, taleplerimiz anında yanıt buldu.', 'Bize bir müşteri değil, bir partner gibi yaklaştılar.']);
    if (score >= 3.8) return randomElement(['Sorunlara karşı yapıcı yaklaştılar.', 'Destek taleplerimize makul sürelerde dönüş yaptılar.', 'İletişimleri oldukça profesyoneldi.']);
    return randomElement(['Satış sonrası destekte daha hızlı dönüş beklerdik.', 'İletişim kopuklukları projenin bazı anlarında yorucu oldu.', 'Taleplerimizi teknik ekibe aktarmakta güçlük çektik.']);
  }
}

const allNames = [...existing10Names, ...new15Names];
const mockEntegratorler = allNames.map((name, i) => {
  const id = 'e1a1b1c1-1111-2222-3333-4444555566' + (i+1).toString().padStart(2, '0');
  const numComments = Math.floor(Math.random() * 3) + 1;
  const comments = [];
  let sumKalite = 0, sumMusteri = 0, sumSurec = 0;
  
  for(let j=0; j<numComments; j++) {
    const kalite = Number((Math.random() * 2 + 3).toFixed(1)); 
    const musteri = Number((Math.random() * 2 + 3).toFixed(1));
    const surec = Number((Math.random() * 2 + 3).toFixed(1));
    sumKalite += kalite; sumMusteri += musteri; sumSurec += surec;
    const proj = randomElement(['Hat sonu paletleme', 'Gıda paketleme', 'Robotik kaynak', 'AGV entegrasyonu', 'Scada ve PLC revizyonu', 'Pres hattı besleme']);
    const intro = proj + ' projemizde çalıştık. ';
    const text = intro + getScoreText(kalite, 'kalite') + ' ' + getScoreText(surec, 'surec') + ' ' + getScoreText(musteri, 'musteri');
    const d = new Date(Date.now() - Math.floor(Math.random() * 31536000000));
    comments.push({kalite_puan: kalite, musteri_iliskisi_puan: musteri, surec_yonetimi_puan: surec, yorum: text, created_at: d.toISOString(), author: randomElement(authors)});
  }
  
  const avgKalite = Number((sumKalite / numComments).toFixed(1));
  const avgMusteri = Number((sumMusteri / numComments).toFixed(1));
  const avgSurec = Number((sumSurec / numComments).toFixed(1));
  const genelPuan = Number(((avgKalite + avgMusteri + avgSurec) / 3).toFixed(1));
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
    '      kalite: ' + avgKalite + ',\n' +
    '      musteri_iliskisi: ' + avgMusteri + ',\n' +
    '      surec: ' + avgSurec + '\n' +
    '    },\n' +
    '    yorum_listesi: ' + JSON.stringify(comments, null, 6).replace(/\\n/g, '\\n    ') + ',\n' +
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
