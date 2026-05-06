import type { MockEntegrator } from './mockData';

export interface AIMatchResult {
  entegrator: MockEntegrator;
  score: number;          // 0–100
  matchReasonLines: string[]; // structured criteria log lines
  matchedKeywords: string[];
}

// ─── Keyword taxonomy ───────────────────────────────────────────────────────

const EXPERTISE_KEYWORDS: Record<string, string[]> = {
  'CNC Besleme':         ['cnc', 'tezgah', 'talaşlı', 'frezeleme', 'tornalama', 'makine besleme'],
  'Robotik Kaynak':      ['kaynak', 'welding', 'ark kaynak', 'punta', 'mig', 'tig'],
  'Hat Sonu Paletleme':  ['paletleme', 'palet', 'istif', 'kutu', 'ambalaj', 'kutulama'],
  'AGV Sistemleri':      ['agv', 'otonom', 'forklift', 'lojistik', 'taşıma', 'depo', 'amr'],
  'Görüntü İşleme':      ['görüntü', 'kamera', 'vision', 'kalite kontrol', 'kusur', 'optik'],
  'Scada Sistemleri':    ['scada', 'izleme', 'monitoring', 'kontrol merkezi', 'alarm'],
  'PLC Programlama':     ['plc', 'siemens', 'omron', 'allen bradley', 'programlama', 'otomasyon'],
  'Makine Besleme':      ['besleme', 'konveyör', 'bantlı', 'pres besleme', 'transfer'],
  'Kestirimci Bakım':    ['bakım', 'arıza', 'kestirimci', 'predictive', 'sensör', 'titreşim'],
  'Punta Kaynak':        ['punta', 'spot welding', 'kaynak nokta'],
};

const LOCATION_KEYWORDS: Record<string, string[]> = {
  'İzmir':    ['izmir', 'İzmir', 'ege', 'aliağa', 'itob'],
  'Bursa':    ['bursa', 'Bursa', 'nosab', 'nilüfer', 'gemlik'],
  'Kocaeli':  ['kocaeli', 'Kocaeli', 'izmit', 'gosb', 'dilovası', 'gebze'],
  'İstanbul': ['istanbul', 'İstanbul', 'des sanayi', 'tuzla', 'ikitelli'],
  'Ankara':   ['ankara', 'Ankara', 'ostim', 'sincan'],
  'Gaziantep':['gaziantep', 'Gaziantep', 'osb'],
  'Manisa':   ['manisa', 'Manisa', 'mosb'],
  'Sakarya':  ['sakarya', 'Sakarya', 'adapazarı'],
  'Kayseri':  ['kayseri', 'Kayseri'],
};

const QUALITY_KEYWORDS: string[]  = ['kalite', 'hassas', 'hassasiyet', 'yüksek kalite', 'kaliteli', 'mükemmel', 'sıfır hata'];
const SPEED_KEYWORDS: string[]    = ['hızlı', 'zamanında', 'süreç', 'teslimat', 'hız', 'dakik', 'gecikme yok'];
const RELATION_KEYWORDS: string[] = ['iletişim', 'destek', 'ilgili', 'samimi', 'çözüm odaklı', 'partner', 'güvenilir'];
const SIZE_KEYWORDS: Record<string, string[]> = {
  kucuk: ['küçük', 'butik', 'esnek', 'küçük ölçekli'],
  orta:  ['orta', 'orta ölçekli', 'büyüme'],
  buyuk: ['büyük', 'kurumsal', 'geniş ekip', 'büyük kapasite'],
};

// ─── Tokenizer ───────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ş/g, 's')
    .replace(/ç/g, 'c').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/İ/g, 'i');
}

function queryContains(query: string, keywords: string[]): boolean {
  const q = normalize(query);
  return keywords.some(k => q.includes(normalize(k)));
}

// ─── Main scorer ─────────────────────────────────────────────────────────────

function scoreEntegrator(
  entegrator: MockEntegrator,
  query: string,
): { score: number; matchedKeywords: string[]; reasons: string[] } {
  const matched: string[] = [];
  const reasons: string[] = [];
  let score = 0;

  const ent = entegrator as any;
  const ratings = ent.detayli_puanlar ?? {};
  const yorumlar: any[] = ent.yorum_listesi ?? [];
  const allText = [
    ent.uzmanlik_alani ?? '',
    ent.faaliyet_alanlari ?? '',
    ent.sektor ?? '',
    ent.konum ?? '',
    ...yorumlar.map((y: any) => y.yorum ?? ''),
  ].join(' ');

  // 1. Expertise match — up to 40 pts
  for (const [skill, kwds] of Object.entries(EXPERTISE_KEYWORDS)) {
    if (queryContains(query, kwds) && normalize(allText).includes(normalize(skill))) {
      score += 20;
      matched.push(skill);
      reasons.push(`"${skill}" uzmanlığına sahip`);
    }
  }

  // 2. Location match — up to 20 pts
  for (const [city, kwds] of Object.entries(LOCATION_KEYWORDS)) {
    if (queryContains(query, kwds)) {
      const loc = normalize(ent.konum ?? '');
      const hiz = normalize(ent.hizmet_verilen_iller ?? '');
      if (loc.includes(normalize(city)) || hiz.includes(normalize(city))) {
        score += 20;
        matched.push(city);
        reasons.push(`${city} bölgesinde hizmet veriyor`);
      }
    }
  }

  // 3. Quality emphasis — up to 15 pts
  if (queryContains(query, QUALITY_KEYWORDS) && (ratings.kalite ?? 0) >= 4.2) {
    score += 15;
    reasons.push(`Kalite puanı yüksek (${(ratings.kalite ?? 0).toFixed(1)})`);
  }

  // 4. Speed / process emphasis — up to 15 pts
  if (queryContains(query, SPEED_KEYWORDS) && (ratings.surec ?? 0) >= 4.2) {
    score += 15;
    reasons.push(`Süreç yönetimi puanı yüksek (${(ratings.surec ?? 0).toFixed(1)})`);
  }

  // 5. Customer relations — up to 10 pts
  if (queryContains(query, RELATION_KEYWORDS) && (ratings.musteri_iliskisi ?? 0) >= 4.2) {
    score += 10;
    reasons.push(`Müşteri ilişkileri puanı yüksek (${(ratings.musteri_iliskisi ?? 0).toFixed(1)})`);
  }

  // 6. Size preference — up to 10 pts
  for (const [size, kwds] of Object.entries(SIZE_KEYWORDS)) {
    if (queryContains(query, kwds) && ent.entegrator_buyuklugu === size) {
      score += 10;
      reasons.push(
        size === 'kucuk' ? 'Küçük, esnek yapılı bir firma'
        : size === 'orta' ? 'Orta ölçekli, dengeli kapasiteli firma'
        : 'Geniş kadrolu, kurumsal yapıda firma'
      );
    }
  }

  // 7. Sector keyword bonus — up to 10 pts
  const sectorWords = normalize(ent.sektor ?? '').split(' ');
  const qNorm = normalize(query);
  if (sectorWords.some(w => w.length > 3 && qNorm.includes(w))) {
    score += 10;
    reasons.push(`${ent.sektor} sektöründe deneyimli`);
  }

  // 8. Positive comment content bonus — up to 10 pts
  const positiveReviewHits = yorumlar.filter(y => {
    const txt = normalize(y.yorum ?? '');
    return QUALITY_KEYWORDS.some(k => txt.includes(normalize(k))) ||
           SPEED_KEYWORDS.some(k => txt.includes(normalize(k)));
  });
  if (positiveReviewHits.length > 0) {
    score += Math.min(positiveReviewHits.length * 5, 10);
    reasons.push(`${positiveReviewHits.length} yorumda olumlu referans var`);
  }

  return { score: Math.min(score, 100), matchedKeywords: matched, reasons };
}

// ─── Build match reason lines (structured log format) ────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  uzmanlik:  'UZMANLIK',
  konum:     'KONUM',
  kalite:    'KALİTE',
  surec:     'SÜREÇ',
  musteri:   'MÜŞTERİ',
  kapasite:  'KAPASİTE',
  sektor:    'SEKTÖR',
  referans:  'REFERANS',
};

function buildMatchReasonLines(
  entegrator: MockEntegrator,
  reasons: string[],
  score: number,
): string[] {
  const ent = entegrator as any;
  const yorumSayisi = (ent.yorum_listesi ?? []).length;
  const genelPuan = (ent.puan ?? 0).toFixed(1);

  const lines: string[] = reasons.slice(0, 4).map(r => {
    if (r.includes('uzman') || r.includes('Besleme') || r.includes('Kaynak') || r.includes('Palet') || r.includes('AGV') || r.includes('Görüntü') || r.includes('Scada') || r.includes('PLC') || r.includes('Bakım') || r.includes('Punta'))
      return `[${CATEGORY_LABELS.uzmanlik}] ${r}`;
    if (r.includes('bölge') || r.includes('hizmet'))
      return `[${CATEGORY_LABELS.konum}] ${r}`;
    if (r.includes('Kalite'))
      return `[${CATEGORY_LABELS.kalite}] ${r}`;
    if (r.includes('Süreç'))
      return `[${CATEGORY_LABELS.surec}] ${r}`;
    if (r.includes('lişki') || r.includes('Müşteri'))
      return `[${CATEGORY_LABELS.musteri}] ${r}`;
    if (r.includes('kapasite') || r.includes('ölçekli') || r.includes('kurumsal') || r.includes('esnek'))
      return `[${CATEGORY_LABELS.kapasite}] ${r}`;
    if (r.includes('sektör'))
      return `[${CATEGORY_LABELS.sektor}] ${r}`;
    if (r.includes('yorum') || r.includes('referans'))
      return `[${CATEGORY_LABELS.referans}] ${r}`;
    return r;
  });

  lines.push(`[META] Genel performans puanı: ${genelPuan}/5.00 · Müşteri referansı: ${yorumSayisi} · Uyumluluk indeksi: ${(score / 100).toFixed(2)}`);
  return lines;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function runAIMatch(
  query: string,
  entegratorler: MockEntegrator[],
  topN = 5,
): AIMatchResult[] {
  if (!query.trim()) return [];

  const scored = entegratorler
    .map(e => {
      const { score, matchedKeywords, reasons } = scoreEntegrator(e, query);
      return {
        entegrator: e,
        score,
        matchedKeywords,
        matchReasonLines: buildMatchReasonLines(
          e,
          reasons.length ? reasons : ['Genel arama kriterleriyle eşleşiyor'],
          score,
        ),
      };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  return scored;
}
