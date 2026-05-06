const fs = require('fs');

const existing10Names = [
  'RoboTech Otomasyon', 'MechSys Endüstriyel Çözümler', 'AutoLine Robotik', 'SmartFab Sistemleri',
  'İleri Hareket Otomasyon', 'CoreRobotics', 'Apex Otomasyon Teknolojileri', 'VisionTech Makine',
  'Nova Robotik Sistemler', 'GigaMekatronik'
];

const new15Names = [
  'Nodus Robotik', 'Optima Otomasyon', 'CyberMekatronik', 'ProLine Sistem', 'Kinetik Endüstriyel',
  'Nexus Makine', 'Aura Robotik', 'Sentetik Otomasyon', 'Vektör Kontrol Sistemleri', 'Zenith Mekatronik',
  'Omega Endüstriyel', 'Lojik Robotik', 'Spektrum Otomasyon', 'Dinamik Proses', 'Pulsar Entegrasyon'
];

const locations = ['Kocaeli, GOSB', 'Bursa, NOSAB', 'İzmir, İTOB', 'Gaziantep OSB', 'İstanbul, DES Sanayi', 'Ankara, OSTİM', 'Manisa, MOSB', 'Sakarya, 1. OSB', 'Kayseri, OSB'];
const expertise = ['Scada Sistemleri', 'PLC Programlama', 'Görüntü İşleme', 'Robotik Kaynak', 'AGV Sistemleri', 'Makine Besleme', 'Hat Sonu Paletleme', 'Kestirimci Bakım', 'CNC Besleme', 'Punta Kaynak'];
const sectors = ['Otomotiv Ana Sanayi', 'Otomotiv Yan Sanayi', 'Gıda', 'İlaç', 'Beyaz Eşya', 'Metal İşleme', 'Plastik', 'Savunma Sanayi'];
const projects = [
  'Hat Sonu Paletleme Otomasyonu', 'Gıda Paketleme Revizyonu', 'Otomotiv Pres Hattı Entegrasyonu',
  'Görüntü İşlemeli Kalite Kontrol Hücresi', 'Scada Tabanlı Tesis İzleme Sistemi', 'Robotik Ark Kaynak Hücresi',
  'Depo İçi AGV Lojistik Entegrasyonu', 'CNC Makine Besleme Robotu', 'İlaç Montaj ve Etiketleme Hattı',
  'Plastik Enjeksiyon Al-Bırak Otomasyonu'
];

const buyukluk = ['kucuk', 'orta', 'buyuk'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
function randomRating() {
  return (Math.random() * (5.0 - 3.2) + 3.2).toFixed(1);
}

const allNames = [...existing10Names, ...new15Names];
const mockEntegratorler = allNames.map((name, i) => {
  const id = `e1a1b1c1-1111-2222-3333-4444555566${(i+1).toString().padStart(2, '0')}`;
  const kalite = parseFloat(randomRating());
  const musteri = parseFloat(randomRating());
  const surec = parseFloat(randomRating());
  const avgPuan = ((kalite + musteri + surec) / 3).toFixed(1);
  const expYears = Math.floor(Math.random() * 23) + 3; // 3 ile 25 yıl arası
  
  return `  {
    id: '${id}',
    entegrator_adi: '${name}',
    entegrator_buyuklugu: '${randomElement(buyukluk)}',
    faaliyet_alanlari: '${randomElements(expertise, 3).join(', ')}',
    hizmet_verilen_iller: 'Tüm Türkiye',
    iletisim_sosyal_medya: 'info@${name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.com.tr',
    kac_kisi: ${Math.floor(Math.random() * 150) + 10},
    konum: '${randomElement(locations)}',
    puan: ${avgPuan},
    detayli_puanlar: {
      kalite: ${kalite},
      musteri_iliskisi: ${musteri},
      surec: ${surec}
    },
    referans: '${randomElements(projects, 2).join(', ')}.',
    sektor: '${randomElement(sectors)}',
    tecrube: '${expYears} yıl',
    uzmanlik_alani: '${randomElements(expertise, 2).join(', ')}',
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: 'onaylandi',
    created_at: new Date().toISOString(),
    email: 'info@${name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.com.tr',
    user_id: null,
    yorumlar: null,
  }`;
});

const fileContent = `import type { Database } from '@/integrations/supabase/types';

type Entegrator = Database['public']['Tables']['entegrator']['Row'];
type Firma = Database['public']['Tables']['firma']['Row'];

export type MockEntegrator = Entegrator & {
  detayli_puanlar?: {
    kalite: number;
    musteri_iliskisi: number;
    surec: number;
  }
};

export const mockEntegratorler: MockEntegrator[] = [
${mockEntegratorler.join(',\\n')}
];

export const mockFirmalar: Firma[] = [
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556601',
    firma_adi: 'Anatolia Otomotiv A.Ş.',
    firma_olcegi: 'buyuk',
    firma_tanitim_yazisi: 'Otomotiv ana sanayi için yüksek hassasiyetli şasi ve gövde parçaları üreten köklü bir kuruluş.',
    kredi: 150,
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: 'onaylandi',
    belgesi4: 'onaylandi',
    created_at: new Date().toISOString(),
    email: 'satinalma@anatoliaotomotiv.com',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556602',
    firma_adi: 'Başaran Gıda Sanayi',
    firma_olcegi: 'orta',
    firma_tanitim_yazisi: 'Atıştırmalık ürünler ve unlu mamuller üreten, günde 100 ton kapasiteli üretim tesisi.',
    kredi: 80,
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: null,
    belgesi4: null,
    created_at: new Date().toISOString(),
    email: 'info@basarangida.com',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556603',
    firma_adi: 'Demirkan Metal İşleme',
    firma_olcegi: 'kucuk',
    firma_tanitim_yazisi: 'CNC torna ve freze işlemleriyle savunma sanayi ve otomotiv sektörüne talaşlı imalat hizmeti veriyoruz.',
    kredi: 30,
    belgesi1: 'onaylandi',
    belgesi2: null,
    belgesi3: null,
    belgesi4: null,
    created_at: new Date().toISOString(),
    email: 'iletisim@demirkanmetal.com',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556604',
    firma_adi: 'YurtPlastik Ambalaj',
    firma_olcegi: 'orta',
    firma_tanitim_yazisi: 'Endüstriyel plastik palet ve taşıma kutuları üretiminde öncü.',
    kredi: 50,
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: 'onaylandi',
    belgesi4: null,
    created_at: new Date().toISOString(),
    email: 'info@yurtplastik.com.tr',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556605',
    firma_adi: 'Ege Elektronik Üretim',
    firma_olcegi: 'buyuk',
    firma_tanitim_yazisi: 'Tüketici elektroniği, PCB dizgi ve test süreçlerinde yüksek teknoloji altyapısına sahip üretim merkezi.',
    kredi: 120,
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: 'onaylandi',
    belgesi4: 'onaylandi',
    created_at: new Date().toISOString(),
    email: 'satinalma@egeelektronik.com',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556606',
    firma_adi: 'Güven İlaç Sanayi',
    firma_olcegi: 'global',
    firma_tanitim_yazisi: 'Uluslararası standartlarda steril ilaç üretimi yapan global vizyona sahip sağlık firması.',
    kredi: 500,
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: 'onaylandi',
    belgesi4: 'onaylandi',
    created_at: new Date().toISOString(),
    email: 'tender@guvenilac.com.tr',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556607',
    firma_adi: 'Zirve Beyaz Eşya',
    firma_olcegi: 'buyuk',
    firma_tanitim_yazisi: 'Ankastre fırın, ocak ve davlumbaz üretiminde Türkiye pazarının parlayan yıldızı.',
    kredi: 90,
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: 'onaylandi',
    belgesi4: null,
    created_at: new Date().toISOString(),
    email: 'info@zirvebeyazesya.com',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556608',
    firma_adi: 'Marmara Havacılık',
    firma_olcegi: 'buyuk',
    firma_tanitim_yazisi: 'Havacılık yapısal parçaları için kompozit ve alüminyum alaşımlı komponent üretimi.',
    kredi: 200,
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: 'onaylandi',
    belgesi4: 'onaylandi',
    created_at: new Date().toISOString(),
    email: 'supplychain@marmarahavacilik.com',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556609',
    firma_adi: 'ÇelikKutu Ambalaj',
    firma_olcegi: 'kucuk',
    firma_tanitim_yazisi: 'Metal teneke kutu üretiminde butik ve hızlı çözümler sunan üretim atölyesi.',
    kredi: 15,
    belgesi1: 'onaylandi',
    belgesi2: null,
    belgesi3: null,
    belgesi4: null,
    created_at: new Date().toISOString(),
    email: 'info@celikkutu.com',
    user_id: null,
  },
  {
    id: 'f2b2c2d2-1111-2222-3333-444455556610',
    firma_adi: 'Asya Savunma Sistemleri',
    firma_olcegi: 'orta',
    firma_tanitim_yazisi: 'Zırhlı araç sistemleri için alt parçalar üreten, milli teknoloji hamlesi destekçisi.',
    kredi: 60,
    belgesi1: 'onaylandi',
    belgesi2: 'onaylandi',
    belgesi3: 'onaylandi',
    belgesi4: 'onaylandi',
    created_at: new Date().toISOString(),
    email: 'ihale@asyasavunma.com',
    user_id: null,
  }
];
`;

fs.writeFileSync('C:/Users/akbur/roboatlas/src/lib/mockData.ts', fileContent.replace(/\\n/g, '\n'), 'utf-8');
console.log('Successfully wrote 25 records to mockData.ts');
