// Replaces duplicate yorum texts in mockData.ts with unique B2B industrial content
const fs = require('fs');
const file = 'C:/Users/akbur/roboatlas/src/lib/mockData.ts';
let src = fs.readFileSync(file, 'utf8');

// Pool of 60 unique B2B industrial automation comment texts
const pool = [
  "Robotik kaynak h\u00fccresi devreye al\u0131n\u0131rken ilk hafta ark sapm\u0131yor, kaynak dikis kalitesi spesifikasyonun \u00fcst\u00fcnde (\u00b10.3\u00b5m). Parametreleri telefonla anlat\u0131ld\u0131, daha iyi belgeleme beklerdik.",
  "SCADA sisteminde \u00fcretim verisi 4 saniye gecikmeli akm\u0131\u015ft\u0131; Siemens S7-1500 taraf\u0131nda byte offset hatas\u0131 tespit edildi. \u00dcretici bunu d\u00fczeltmeden teslim etti ama remote destek 2 saatte \u00e7\u00f6zd\u00fc.",
  "Hat sonu paletleme h\u0131z\u0131 saatte 1 200 kutuda kald\u0131, teklifteki 1 400 hedefine ula\u015f\u0131lamad\u0131. Mekanik yeniden \u00e7ali\u015f\u0131larak 6 haftada hedef yakaland\u0131, ge\u00e7ikme can s\u0131kt\u0131.",
  "AGV filosu 18 arac\u0131n t\u00fcm\u00fc zamanlamaya uydu, depo trafik algoritmas\u0131 yerinde yaz\u0131ld\u0131. Devreye alma s\u00fcrecinde hi\u00e7 durmaks\u0131z\u0131n \u00fcretim devam etti \u2014 \u00e7ok ba\u015far\u0131l\u0131 bir planlama.",
  "G\u00f6r\u00fcnt\u00fc i\u015fleme sistemine 0.05\u00b5m ince hata tespiti g\u00f6revi verildi. Testlerde %99.2 do\u011fru sonu\u00e7 al\u0131nd\u0131, ancak kamera tutucusu t\u0131treme yap\u0131yordu; \u00e7elik levha eklenerek \u00e7\u00f6z\u00fcld\u00fc.",
  "PLC program\u0131 hatt\u0131 yeniden yaz\u0131l\u0131rken 3 farkl\u0131 Omron \u00fcnitesi tek merkezi haberle\u015fmeye ba\u011flanmal\u0131yd\u0131. Protokol d\u00f6n\u00fc\u015f\u00fcm\u00fc ba\u015flang\u0131\u00e7ta sorun \u00e7\u0131kard\u0131, son haliyle \u00e7ok temiz \u00e7al\u0131\u015f\u0131yor.",
  "Kestirimci bak\u0131m mod\u00fcl\u00fc 3 ayda toplam 9 planlanmam\u0131\u015f duruluyor \u00f6nledi. Titre\u015fim sens\u00f6rleri do\u011fru yerle\u015ftirilmi\u015f, analitik panel operatif a\u00e7\u0131dan anla\u015f\u0131l\u0131r.",
  "Punta kaynak robotunda ilk 200 parcada merkezleme sapmas\u0131 olu\u015ftu. Firma h\u0131zl\u0131 araya girdi ve fixture tolerans\u0131n\u0131 s\u0131f\u0131rlamakla \u00e7\u00f6zd\u00fc; bu h\u0131zdaki yan\u0131t takdire \u015fayan.",
  "Konvey\u00f6r h\u0131z e\u015fitlemesi otomotiv hatt\u0131 cikl\u00fc zamanlar\u0131yla e\u015fle\u015ftirildi. Mekanik montaj hatas\u0131z, ama elektrik \u015femalama belgeleri ge\u00e7ici CAD olarak kald\u0131 \u2014 as-built bekliyoruz.",
  "Makine besleme \u00fcnitesi 14\u201d li\u011fer d\u00f6k\u00fcm par\u00e7alar\u0131 i\u00e7in optimize edildi. \u0130lk 300 \u00e7evrimde d\u00fc\u015fenme \u00e7\u0131k\u0131\u015f\u0131 s\u0131f\u0131ra indi; kapasite garantisi eksiksiz yerine getirildi.",
  "Savunma sanayi par\u00e7as\u0131 lazer kesim entegrasyonu NATO sertifikas\u0131 gerektirdi. T\u00fcm dok\u00fcmantasyon tam ve zaman\u0131nda teslim edildi, m\u00fcfetti\u015f denetiminde s\u0131f\u0131r bulgu.",
  "G\u0131da paketleme hatt\u0131nda ISO 22000 hijyen gereksinimleri nedeniyle robot bile\u015fenleri paslanmaz \u00e7elik kaplamaya d\u00f6n\u00fc\u015ft\u00fcr\u00fcld\u00fc. \u00dcretici bu konuda deneyimli ve \u00f6nerisi isabetli \u00e7\u0131kt\u0131.",
  "Tekstil fabrikas\u0131nda boyahane lojisti\u011fi i\u00e7in AGV g\u00fczerga\u0131h\u0131 yazan yaz\u0131l\u0131m dinamik engel alg\u0131lamas\u0131 y\u00fcz\u00fcnden 2 kez yeniden \u00e7alt\u0131ld\u0131. Sonunda stabil ancak daha erken test edilebilirdi.",
  "CNC tezgah besleme robotu 4 eksenli, 18 kg y\u00fck ald\u0131. Y\u00fckleme d\u00f6ng\u00fcs\u00fc 8 saniye \u2014 teklifteki 9 saniyenin alt\u0131nda. \u00d6nerilen yak\u0131la\u015ftirma \u00e7\u0131k\u0131\u015f konumu m\u00fckemmel \u00e7al\u0131\u015ft\u0131.",
  "\u0130la\u00e7 ambalaj hatt\u0131nda s\u00fcreklilik \u00f6nemliydi; firma gece shift\u2019iyle devreye ald\u0131. Hipersteril oda sertifikas\u0131 ald\u0131k\u00e7a prosedEr adland\u0131 d\u00fc\u015f\u00fcrm\u00fc\u015ft\u00fc ama d\u00fczeltti.",
  "Elektronik kart test otomasyon sistemi \u0131skalas\u0131 fabrikas\u0131na kuruldu. Vision taraf\u0131 \u00e7al\u0131\u015f\u0131yor ancak raporlama mod\u00fcl\u00fc ka\u00e7\u0131nmas\u0131 gereken false-positive \u00fcretiyor, g\u00fcncelleme bekliyor.",
  "Plastik enjeksiyon tezgah\u0131n\u0131n robot ara\u00e7l\u0131\u011f\u0131 sprue kesici entegrasyonu beklenmedik vakum ba\u015far\u0131s\u0131zl\u0131\u011f\u0131na u\u011fradi. Tasarimi revize ettiler, kalite daha iyi.",
  "Metal b\u00fckme ve presleme h\u00fccresinde servo kaynakl\u0131 par\u00e7a poz pozlamas\u0131 \u00e7ok hassas. 6 saat m\u00fchendisin saha deste\u011fi ile yap\u0131land\u0131rma tamamland\u0131.",
  "Depo otomasyon sisteminde RF barkod okuyucu \u015ferids\u011fi firmware hatas\u0131 kaynakl\u0131 \u00e7\u00f6kme ya\u015f\u0131yordu. Firmware g\u00fcncellemesi sonras\u0131 kesintisiz \u00e7al\u0131\u015ft\u0131.",
  "Ambalaj hatt\u0131 robot pnomatik sistemi yeni \u00e7ift-katl\u0131 valf grubuyla yenilendi. G\u00fcc\u00fc d\u00fc\u015f\u00fckken yavaslayan kol sorunu \u00e7\u00f6z\u00fcld\u00fc; verimlilik %18 artt\u0131.",
  "Otomotiv karoser kaynak hatt\u0131 entegrasyonunda jig tolerans\u0131 \u00b10.1 mm'ye d\u00fc\u015f\u00fcr\u00fcld\u00fc. 3 yeni robot kola ek olarak mevcut 5 kol da yeniden kalibre edildi, hepsi tek oturumda.",
  "H\u00e4rterei f\u0131r\u0131n s\u0131cakl\u0131k SCADA izleme sistemi kuruldu. Alarm e\u015fi\u011fi yanl\u0131\u015f ayarlanm\u0131\u015ft\u0131, ilk haftada ger\u00e7ek alarm olmayan tetikleme olu\u015ftu ama h\u0131zl\u0131 d\u00fczeldi.",
  "G\u0131da d\u00fcz\u00fcltme ve k\u00fcp\u00fcrdatma hatt\u0131nda vision sistemi renk bazl\u0131 kusur tespiti yap\u0131yor. Performans beklenenden iyi; erken teslim bile ger\u00e7ekle\u015fti.",
  "Proje boyunca ger\u00e7ek zamanl\u0131 haftal\u0131k ilerleme raporu al\u0131nd\u0131. Baz\u0131 raporlar veri eksikti ama hafta i\u00e7inde tamamland\u0131.",
  "Robot yeniden programlama s\u00fcrecinde \u00fcretim 6 saat durdu, plan\u0131anan 4 saat yerine. Ek mesai bedeli tazmin edilmedi; s\u00f6zle\u015fme nettir.",
  "Devreye alma sonras\u0131 ilk ayda 3 kez teknik ekip sah\u0131ya geldi. Her defas\u0131nda sorunu uzaktan da \u00e7\u00f6zebilirlerdi ama yerinde \u00e7\u00f6zmeyi tercih ettiler.",
  "Hat durma s\u00fcresi ilk \u00e7eyrekte %2.1'den %0.4'e indi. En b\u00fcy\u00fck katk\u0131 konvey\u00f6r senkronizasyon iyile\u015ftirmesinden geldi.",
  "\u00dcretim s\u0131ras\u0131nda hattan ge\u00e7en ilk 1000 par\u00e7a s\u0131f\u0131r hurda ile tamamland\u0131. Baz\u0131 hizalama ayar\u0131 gerekti ama sonunda m\u00fckemmel.",
  "Sistem devreye al\u0131rken eski PLC ile yeni SCADA aras\u0131ndaki Modbus haberle\u015fmesi \u00e7akl\u0131yordu. \u00c7\u00f6z\u00fcm bir hafta s\u00fcrd\u00fc ama \u00e7ok kal\u0131c\u0131.",
  "Robot yolunu yeniden \u00f6\u011frenmeden \u00f6nce simlas\u00f6n \u00e7all\u0131\u015ft\u0131r\u0131ld\u0131, sah\u0131da hi\u00e7 \u00e7arp\u0131\u015fma olmad\u0131.",
  "Konvey\u00f6r bantlar\u0131 g\u0131da standartlar\u0131na uygun malzemeyle de\u011fi\u015ftirildi. Bant ek kalitesi beklentinin \u00fcst\u00fcnde.",
  "G\u00fcvenlik \u00e7iti lazer perdesiyle entegre edildi. \u0130lk testlerde tetikleme gecikmesi standart\u0131n alt\u0131ndayd\u0131; yeniden ayarland\u0131.",
  "Servo motor parametreleri fab\u0131\u00e7a sahaya gelip yerinde optimize etti. Ekstra gidip gelme hem zaman hem biz\u00e7in \u00e7aba harcatt\u0131 ama sonunda sert \u00e7al\u0131\u015ft\u0131.",
  "Fabrikas\u0131m\u0131zdaki pres beslemede vakum kavrama bas\u0131nc\u0131 tutars\u0131z \u00e7\u0131k\u0131yordu; valf temizlenerek \u00e7\u00f6z\u00fcld\u00fc, takip \u00e7ok h\u0131zl\u0131yd\u0131.",
  "Robot teach kolunu operatT\u00fcr e\u011fitimleri \u00e7ok yeterliydi. 5 operatTt\u00fcr ayn\u0131 g\u00fcn sertifika ald\u0131.",
  "Depo AGV filosuna engel tan\u0131ma kamera montaj\u0131 yap\u0131ld\u0131. S\u0131cak-respot sorunu neden iki hafta ge\u00e7ikmeye yol a\u00e7t\u0131 a\u00e7\u0131klanmad\u0131.",
  "PLC kodunda deadlock durumu ba\u015flang\u0131\u00e7ta g\u00f6zden ka\u00e7m\u0131\u015ft\u0131, 500. d\u00f6ng\u00fcde tetiklendi. Firmware g\u00fcncellemesiyle d\u00fczeldi.",
  "Hat sonu sarg\u0131 makinesi entegrasyonunda kablo yuvarlak boru \u00e7arp\u0131\u015fma sorunu vard\u0131. Mekanigin d\u00fc\u015f\u00fcnmedi\u011fi bir detay ama \u00e7abuk \u00e7\u00f6zd\u00fcler.",
  "Galvaniz kapl\u0131 band\u0131rma hatt\u0131nda s\u0131v\u0131 seviye sens\u00f6r\u00fc yanl\u0131\u015f konumlanm\u0131\u015ft\u0131. Pozisyon de\u011fi\u015ftirildi, art\u0131k sapma yok.",
  "Robotik palet sargac\u0131 100 devrimde gerilim a\u015f\u0131m\u0131 al\u0131yordu. Motor s\u00fcr\u00fccs\u00fc PID ayar\u0131 d\u00fczelttikten sonra sorunsuz.",
  "Kestirimci bak\u0131m yaz\u0131l\u0131m\u0131 bulut entegrasyonu \u00e7ok d\u00fcz\u00fcl\u00e7e yap\u0131ld\u0131; ekibimiz kendi \u00f6ng\u00f6r\u00fcsel modelini ekleyebiliyor.",
  "Sistem kabul testlerinde t\u00fcm KPI'lar ilk denemede ge\u00e7ildi. \u00c7ok az entegrat\u00f6r bunu ba\u015far\u0131r.",
  "Hatt\u0131n fizibilite a\u015famas\u0131ndan devreye almaya kadar \u00e7ok iyi dok\u00fcmantasyon sa\u011flad\u0131lar. Eski entegrat\u00f6r\u00fcm\u00fcze g\u00f6re \u00e7ok daha kurumsal.",
  "Robot yerle\u015fim plan\u0131 ilk taslakta fabrika trafik ak\u0131\u015f\u0131n\u0131 bloke ediyordu. Revize teklif h\u0131zl\u0131 geldi, ak\u0131\u015f d\u00fczeltildi.",
  "Vizyonla desteklenen \u00e7\u0131kt\u0131 s\u0131ralama sistemi aydInlatma d\u00fczenine duyarl\u0131 oldu\u011fundan gece shift\u2019inde hata oranlar\u0131 y\u00fcksekti. LED armatTt\u00fcr eklenerek \u00e7\u00f6z\u00fcld\u00fc.",
  "Siemens TIA Portal \u00fczerinde yaz\u0131lan blok k\u00fctp\u00fchanesi \u00e7ok modTt\u00fcleer; ba\u015fka hatlar\u0131m\u0131zda da kullanmay\u0131 planlIyoruz.",
  "Mak\u0131na talk\u0131m\u0131 \u00e7arp\u0131\u015fma senaryolar\u0131n\u0131 offline sim\u00fclas\u0131yon ile \u00f6nceden y\u00f6nettiler. Sahada hi\u00e7 surpriz olmad\u0131.",
  "Toz-ge\u00e7irmez kab\u0131netten \u00e7\u0131kan \u0131s\u0131 birikimine kar\u015f\u0131 havaland\u0131rma tasarlan\u0131rken proje ekibi ortam \u0131s\u0131s\u0131n\u0131 \u00f6l\u00e7medi. Sonradan fan eklendi.",
  "Hassas montaj h\u00fccresi \u0131\u015f\u0131k korumal\u0131 kafes gerektirdi. Proje s\u00fcresine eklendi ve yasal uyumluluk sa\u011fland\u0131.",
  "OPC-UA veri k\u00f6pr\u00fcs\u00fc kurulum\u0131 ilk g\u00fcn \u00e7al\u0131\u015ft\u0131. MES entegrasyonu s\u0131f\u0131r sorunla tamamland\u0131 \u2014 beklentinin \u00fczerindeydi.",
  "Mobil HMI \u00fczerinden alarm y\u00f6netimi ilk versiyonda iOS'ta d\u00fczg\u00fcn g\u00f6r\u00fcnmTt\u00fcyordu. Bir g\u00fcnce ile d\u00fczeldi, ciddi bir sorun de\u011fildi.",
  "Robotun tool de\u011fi\u015fim istasyonu \u00e7ok dar bo\u015flukla yerle\u015ftirilmi\u015fti; t\u00fc\u00e7 bak\u0131m teknis\u0131yeni ula\u015famIyordu. Revize edildi.",
  "Teslim sonras\u0131 30 g\u00fcn\u00fc\u00e7 ke\u015f\u00fcirim bak\u0131m ziyareti planland\u0131 ve eksiksiz yap\u0131ld\u0131. \u00c7ok az entegrat\u00f6r bu anlay\u0131\u015fl\u0131.",
  "Programlama ekibi farkl\u0131 kod tabanlar\u0131 ba\u015flangI\u00e7ta versiyon uyu\u015fmazl\u0131\u011f\u0131 ya\u015f\u0131yordu. Git yap\u0131land\u0131rmas\u0131ndan sonra tak\u0131m entegrasyonu \u00e7ok daha iyi.",
  "Paletleme robotu paket a\u011f\u0131rl\u0131\u011f\u0131 dengesizliklerini telafi eden dinamik tutucu vard\u0131. Saha testleri m\u00fckkemmel ge\u00e7ti.",
  "Kestirimci bak\u0131m sensT\u00f6rleri makine titresim \u00f6l\u00e7\u00fcmleri ile sinyal frekans analizi birle\u015ftiriyor. \u00c7ok ilerici bir yakla\u015f\u0131m, fabrikam\u0131z\u0131n arIza maliyeti %30 azald\u0131.",
  "Elektriksel panel yaz\u0131l\u0131m\u0131n \u00f6teki b\u00f6l\u00fcmT\u00fcnden yap\u0131lan \u0131s\u0131 iletimi kesimi hesaplanmam\u0131\u015ft\u0131; \u00fcretici alternatif montaj d\u00fczenlemesi \u00f6nerdi.",
  "Kal\u0131p transferi robotu t\u00fcm \u00f6zelli\u011fiyle devreye al\u0131nd\u0131, ama kullan\u0131c\u0131 el kitab\u0131 T\u00fcrk\u00e7e versiyonu gelecek ay gelecek.",
  "Alarm y\u00f6netimi felsefesi \u00e7ok iyi tasarlanm\u0131\u015f; kritik alarmlar birincil s\u0131n\u0131fta, bilgi alarmlar\u0131 \u00fc\u00e7\u00fcnc\u00fc s\u0131n\u0131fta gruplanm\u0131\u015f.",
];

// Find all "\"yorum\":" strings and collect indices
const yorumPattern = /"yorum"\s*:\s*"(.*?)"/gs;
let match;
const indices = [];
while ((match = yorumPattern.exec(src)) !== null) {
  indices.push({ start: match.index, end: match.index + match[0].length, full: match[0] });
}
console.log('Total yorum entries found:', indices.length);

// Replace each yorum with a unique pool entry (cycling if needed)
// Work from end to start to preserve indices
for (let i = indices.length - 1; i >= 0; i--) {
  const poolText = pool[i % pool.length];
  const escaped = poolText.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const replacement = `"yorum": "${escaped}"`;
  src = src.slice(0, indices[i].start) + replacement + src.slice(indices[i].end);
}

fs.writeFileSync(file, src, 'utf8');
console.log('Done — all', indices.length, 'yorum entries replaced with unique B2B texts.');
