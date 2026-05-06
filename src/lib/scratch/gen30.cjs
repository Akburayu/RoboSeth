const fs = require('fs');

const names = [
  'Akıncı Robotik','Tekform Endüstri','Atlas Otomasyon','Sentek Mühendislik','Protek Sistemleri',
  'VeriBot Teknoloji','NovaTek Makine','Optimum Otomasyon','TurboLine Robotics','DigitaFab',
  'PrecisBot','Anadolu Otomasyon','Mekatek Sistemleri','İnofab Robotik','SigoTek',
  'Delta Endüstriyel','Volt Entegrasyon','KineTek Makine','Apex Robotik','StellarFab',
  'CoreLine Otomasyon','Quantum Makine','FlexBot Sistemleri','OmegaTek Endüstri','NanoLine',
  'IndusPro Robotik','BioTek Otomasyon','FirmaTek Makine','AlphaTek Endüstri','ZenBot Sistemleri'
];

const locations = [
  'Bursa, NOSAB','Gebze, GOSB','Manisa, MOSB','Ankara, OSTİM','İzmir, Kemalpaşa OSB',
  'Kocaeli, Dilovası OSB','Gaziantep, OSB','Sakarya, OSGEB','Konya, OSB','Adana, HABER OSB',
  'Eskişehir, ESGEB','Tekirdağ, ÇERKEZKÖY OSB','Denizli, OSB','İstanbul, İkitelli OSB','Kayseri, OSB',
  'Samsun, OSB','Malatya, OSB','Trabzon, OSB','Antalya, OSB','Mersin, OSB',
  'Balıkesir, OSB','Çorum, OSB','Elazığ, OSB','Erzurum, OSB','Van, OSB',
  'Hatay, OSB','Muğla, OSB','Nevşehir, OSB','Afyon, OSB','Isparta, OSB'
];

const sizes = ['kucuk','kucuk','orta','orta','buyuk'];
const sectors = ['Otomotiv','Gıda','Savunma Sanayi','Tekstil','Talaşlı İmalat','İlaç','Elektronik','Metal','Plastik','Ambalaj'];
const expertises = [
  'Makine Besleme, PLC Programlama','Ark Kaynağı, Robotik Kaynak','Görüntü İşleme, Kalite Kontrol',
  'Hat Sonu Paletleme, AGV Sistemleri','Kestirimci Bakım, Scada Sistemleri','PLC Programlama, Scada Sistemleri',
  'AGV Sistemleri, Makine Besleme','Robotik Kaynak, Görüntü İşleme','Hat Sonu Paletleme, Kestirimci Bakım',
  'Makine Besleme, Ark Kaynağı, PLC Programlama','Görüntü İşleme, PLC Programlama, Scada Sistemleri',
  'AGV Sistemleri, Robotik Kaynak, Hat Sonu Paletleme','Kestirimci Bakım, Makine Besleme',
  'Scada Sistemleri, PLC Programlama, AGV Sistemleri','Ark Kaynağı, Kestirimci Bakım, Görüntü İşleme',
  'Hat Sonu Paletleme, Makine Besleme','Robotik Kaynak, PLC Programlama',
  'Görüntü İşleme, AGV Sistemleri','Scada Sistemleri, Kestirimci Bakım',
  'PLC Programlama, Ark Kaynağı, Hat Sonu Paletleme','Makine Besleme, Görüntü İşleme',
  'AGV Sistemleri, Scada Sistemleri','Kestirimci Bakım, Robotik Kaynak',
  'Hat Sonu Paletleme, PLC Programlama','Görüntü İşleme, Makine Besleme, Ark Kaynağı',
  'Robotik Kaynak, AGV Sistemleri','Scada Sistemleri, Hat Sonu Paletleme',
  'PLC Programlama, Kestirimci Bakım','Ark Kaynağı, Görüntü İşleme, PLC Programlama',
  'Makine Besleme, Scada Sistemleri'
];

const activities = [
  'Robot Programlama, PLC Programlama, Mekanik Tasarım',
  'Ark Kaynak Ekipmanı Devreye Alma, Robot Montaj, Elektrik İşleri',
  'Robot Devreye Alma, Görüntü İşleme Entegrasyonu, Kalite Sistemi',
  'AGV Sistemleri Kurulum, Depo Otomasyonu, PLC Programlama',
  'Scada Geliştirme, Kestirimci Bakım Sistemleri, Sensör Entegrasyonu',
  'Punta Kaynak Ekipmanı Montajı, Robot Eğitimi, Yedek Parça',
  'Hat Sonu Paletleme, Konveyör Sistemleri, Makine Besleme',
  'Elektrik Arıza Robot Servisi, Otomasyon Arıza Servisi, Robot Bakımı',
  'Mekanik Üretim, Robot Taşıma, Üretim Hattı Taşıma',
  'PLC Programlama, Robot Programlama, Scada Sistemleri'
];

const references = [
  'Otomotiv montaj hattı kurulumu, Pres besleme robotu entegrasyonu',
  'Gıda paketleme hattı otomasyonu, Hat sonu paletleme sistemi',
  'Savunma sanayi parça kaynak hücresi, Lazer kesim entegrasyonu',
  'Tekstil fabrikası AGV filosu, Depo otomasyon yazılımı',
  'CNC tezgah besleme robotu, Görüntü işleme kalite sistemi',
  'Scada izleme altyapısı, Kestirimci bakım sensör ağı',
  'İlaç ambalaj hattı robotu, Steril ortam otomasyon sistemi',
  'Metal kesim ve bükme hücre entegrasyonu, Punta kaynak robotu',
  'Plastik enjeksiyon tezgah besleme, Hat sonu kutulama sistemi',
  'Elektronik kart test otomasyonu, Vision destekli kalite kontrol'
];

const yorumSets = [
  [
    {kalite_puan:4.8,musteri_iliskisi_puan:4.5,surec_yonetimi_puan:4.7,yorum:"Robotik kaynak hücresinin mekanik kalitesi beklentilerimizin ötesindeydi. Devreye alma sürecinde mühendisleri sahada 7/24 destek verdi.",created_at:"2025-11-10T08:20:00.000Z",author:"Kadir A. - Üretim Direktörü"},
    {kalite_puan:4.6,musteri_iliskisi_puan:4.8,surec_yonetimi_puan:4.4,yorum:"İletişim mükemmeldi, her aşamada gelişme raporu aldık. Ufak bir kablo yeniden yönlendirme gecikmesi dışında proje takvime uydu.",created_at:"2025-08-22T14:10:00.000Z",author:"Emre S. - Proje Yöneticisi"}
  ],
  [
    {kalite_puan:3.8,musteri_iliskisi_puan:3.5,surec_yonetimi_puan:3.2,yorum:"AGV güzergah optimizasyonu defalarca revize edilmek zorunda kalındı. Saha ekibi deneyimliydi ama proje yönetiminde ciddi boşluklar vardı.",created_at:"2025-09-05T09:00:00.000Z",author:"Fatih Y. - Lojistik Müdürü"},
    {kalite_puan:4.0,musteri_iliskisi_puan:3.8,surec_yonetimi_puan:3.5,yorum:"Sistem sonunda istikrarlı çalışmaya başladı. Başlangıçtaki sorunlar çözüldükten sonra verimlilik hedefimize ulaştık.",created_at:"2025-12-01T11:30:00.000Z",author:"Selin T. - Tesis Yöneticisi"},
    {kalite_puan:4.2,musteri_iliskisi_puan:4.0,surec_yonetimi_puan:3.8,yorum:"Teknik ekip bilgiliydi ancak raporlama döngüsü netleşene kadar zaman kaybedildi. Uzun vadede doğru bir seçimdi.",created_at:"2026-01-15T16:45:00.000Z",author:"Mert K. - Operasyon Şefi"}
  ],
  [
    {kalite_puan:5.0,musteri_iliskisi_puan:4.9,surec_yonetimi_puan:5.0,yorum:"Scada sistemi sıfır hata ile devreye alındı. Canlı izleme paneli fabrikamızın en kritik yatırımlarından biri haline geldi.",created_at:"2025-07-18T10:00:00.000Z",author:"Alp D. - Fabrika Müdürü"},
    {kalite_puan:4.9,musteri_iliskisi_puan:5.0,surec_yonetimi_puan:4.8,yorum:"Kestirimci bakım modülü sayesinde 3 ayda toplam 12 planlanmamış duruş önlendi. Yatırımın geri dönüşü 6 ayda gerçekleşti.",created_at:"2025-10-30T07:55:00.000Z",author:"Berna Ç. - Bakım Direktörü"}
  ],
  [
    {kalite_puan:4.3,musteri_iliskisi_puan:4.6,surec_yonetimi_puan:4.1,yorum:"Paletleme robotunun kol hassasiyeti gıda standartlarını rahatlıkla karşıladı. Kurulum sonrası eğitim süreci oldukça kapsamlıydı.",created_at:"2025-06-12T13:20:00.000Z",author:"Hüseyin Y. - Kalite Şefi"},
    {kalite_puan:4.5,musteri_iliskisi_puan:4.3,surec_yonetimi_puan:4.2,yorum:"Hat sonu paketleme kapasitemiz %40 arttı. Proje biraz uzasa da mühendislik kalitesi takdire şayandı.",created_at:"2025-04-08T08:30:00.000Z",author:"Zeynep A. - Üretim Müdürü"}
  ],
  [
    {kalite_puan:3.5,musteri_iliskisi_puan:3.0,surec_yonetimi_puan:3.2,yorum:"Makine besleme sisteminde ilk aylarda yüksek fire oranı yaşandı. Revizyon sonrası düzeldi ama süreç sancılıydı.",created_at:"2026-02-20T09:15:00.000Z",author:"Cenk B. - Mühendis"},
    {kalite_puan:3.8,musteri_iliskisi_puan:3.5,surec_yonetimi_puan:3.0,yorum:"Proje teslim tarihi iki kez ertelendi. Sonuç iş görür ama beklentilerimizin altında kaldı.",created_at:"2026-03-10T14:00:00.000Z",author:"Oya M. - Satın Alma Müdürü"}
  ],
  [
    {kalite_puan:4.7,musteri_iliskisi_puan:4.4,surec_yonetimi_puan:4.6,yorum:"Görüntü işleme sistemi 0.01mm toleransı yakalıyor. Savunma sanayi gereksinimlerimiz için birebir uygun.",created_at:"2025-05-22T11:00:00.000Z",author:"Sercan D. - Kalite Direktörü"},
    {kalite_puan:4.5,musteri_iliskisi_puan:4.6,surec_yonetimi_puan:4.3,yorum:"Entegrasyon sürecinde doküman yönetimi çok profesyoneldi. Her revizyon izlenebilir ve onaylı şekilde işlendi.",created_at:"2025-08-14T15:30:00.000Z",author:"Nilgün T. - Proje Koordinatörü"}
  ],
  [
    {kalite_puan:4.1,musteri_iliskisi_puan:4.4,surec_yonetimi_puan:3.9,yorum:"PLC programlama tarafı sağlamdı, ancak HMI arayüzü operatör eğitimi gerektirdi. Sonuçta verimlilik artışı gerçekleşti.",created_at:"2025-12-05T10:45:00.000Z",author:"Ahmet K. - Shift Amiri"},
    {kalite_puan:4.3,musteri_iliskisi_puan:4.2,surec_yonetimi_puan:4.0,yorum:"Destek ekibi sorulara hızlı dönüş yaptı. Yedek parça tedariki zaman zaman gecikse de operasyon durmadı.",created_at:"2026-01-28T08:00:00.000Z",author:"Leyla S. - Bakım Şefi"}
  ],
  [
    {kalite_puan:4.9,musteri_iliskisi_puan:5.0,surec_yonetimi_puan:4.8,yorum:"Tekstil hattındaki robot programlama teslimi zamanında ve eksiksiz yapıldı. Üretim verimliliğimiz ilk haftada %25 arttı.",created_at:"2025-03-18T07:30:00.000Z",author:"Çetin A. - Genel Müdür"},
    {kalite_puan:4.8,musteri_iliskisi_puan:4.7,surec_yonetimi_puan:4.9,yorum:"Proje yönetimi olağanüstüydü. MS Project bazlı ilerleme raporları her Pazartesi masaydaydı.",created_at:"2025-07-07T09:00:00.000Z",author:"Pınar Y. - Operasyon Direktörü"}
  ],
  [
    {kalite_puan:3.6,musteri_iliskisi_puan:4.0,surec_yonetimi_puan:3.4,yorum:"Ark kaynak hücresi işlevsel ama kaynak parametrelerini optimize etmek bizim ekibimize kaldı. Devreye alma desteği yetersizdi.",created_at:"2026-01-05T13:00:00.000Z",author:"Gürkan D. - Kaynak Şefi"},
    {kalite_puan:3.9,musteri_iliskisi_puan:4.1,surec_yonetimi_puan:3.7,yorum:"İletişim iyiydi ama teslimatta eksik bileşenler vardı. Tamamlanması 3 hafta ek süre aldı.",created_at:"2026-02-14T10:30:00.000Z",author:"Esin Ç. - Tedarik Zinciri Müdürü"}
  ],
  [
    {kalite_puan:4.6,musteri_iliskisi_puan:4.3,surec_yonetimi_puan:4.5,yorum:"Konveyör ve paletleme entegrasyonu sorunsuz gerçekleşti. Özellikle yazılım tarafındaki çözümleri çok esnekti.",created_at:"2025-09-25T14:00:00.000Z",author:"Barış T. - Sistem Entegrasyon Müdürü"},
    {kalite_puan:4.4,musteri_iliskisi_puan:4.5,surec_yonetimi_puan:4.3,yorum:"Test ve kabul aşamaları titizlikle yürütüldü. Tesis geçiş süreci minimum üretim kaybıyla tamamlandı.",created_at:"2025-11-30T16:00:00.000Z",author:"Sinem A. - Kalite Güvence Direktörü"}
  ]
];

const years = [2,3,5,5,7,8,10,10,12,14,15,16,18,18,20,20,22,25,3,6,9,11,13,17,4,7,19,8,15,12];
const headcounts = [5,8,12,15,20,25,30,35,40,45,50,60,70,80,90,100,110,120,130,140,15,28,42,55,65,35,85,22,48,75];

let objects = '';
for (let i = 0; i < 30; i++) {
  const idx = i;
  const id = `e1a1b1c1-2222-3333-4444-${String(555500000026 + i).padStart(12,'0')}`;
  const ySet = yorumSets[i % yorumSets.length];
  const size = sizes[i % sizes.length];
  const yrCount = years[i];
  const kisiCount = headcounts[i];
  const sep = i < 29 ? ',' : '';

  objects += `  {
    id: '${id}',
    entegrator_adi: '${names[i]}',
    entegrator_buyuklugu: '${size}',
    faaliyet_alanlari: '${activities[i % activities.length]}',
    hizmet_verilen_iller: 'Tüm Türkiye',
    iletisim_sosyal_medya: 'info@${names[i].toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'')}.com.tr',
    kac_kisi: ${kisiCount},
    konum: '${locations[i]}',
    yorum_listesi: ${JSON.stringify(ySet, null, 6)},
    referans: '${references[i % references.length]}',
    sektor: '${sectors[i % sectors.length]}',
    tecrube: '${yrCount} yıl',
    uzmanlik_alani: '${expertises[i]}',
    belgesi1: 'onaylandi',
    belgesi2: '${i % 3 !== 0 ? 'onaylandi' : 'beklemede'}',
    belgesi3: '${i % 5 !== 0 ? 'onaylandi' : null}',
    created_at: new Date().toISOString(),
    email: 'info@${names[i].toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9]/g,'')}.com.tr',
    user_id: null,
    yorumlar: null,
  }${sep}\n`;
}

// Read existing file
const filePath = 'C:/Users/akbur/roboatlas/src/lib/mockData.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find the last closing brace of the array (before `];`)
// Insert new objects before the closing `}`
content = content.replace(/  \}\n\];(\s*\nconst calculateAverages)/, `  },\n${objects}];\n$1`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done — 30 new integrators appended.');
