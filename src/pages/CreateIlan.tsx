import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, FileText, Send } from 'lucide-react';

const FAALIYET_ALANLARI = [
  'Mekanik Tasarım',
  'Mekanik Üretim',
  'Elektrik İşçiliği',
  'Elektrik İşleri',
  'Elektrik Ekipmanları',
  'Otomasyon Ekipmanları',
  'Otomasyon İşleri',
  'Robot Programlama',
  'Robot Devreye Alma',
  'Robot Kurulum',
  'Robot Montaj',
  'Robot Taşıma',
  'Üretim Hattı Taşıma',
  'PLC Programlama',
  'Ark Kaynak Ekipmanı Devreye Alma',
  'Ark Kaynak Ekipmanı Montajı',
  'Punta Kaynak Ekipmanı Devreye Alma',
  'Punta Kaynak Ekipmanı Montajı',
  'Timer Ayarı',
  'Ark Kaynak Kalitesi Çalışması',
  'Punta Kaynak Kalitesi Çalışması',
  'Robot Eğitimi',
  'Robot Bakımı',
  'Yedek Parça Satışı',
  'Mekanik Arıza Robot Servisi',
  'Elektrik Arıza Robot Servisi',
  'Otomasyon Arıza Servisi',
  'Robot Programlama Arıza Servisi',
];

const UZMANLIK_ALANLARI = [
  'Ark Kaynağı',
  'Punta Kaynağı',
  'Sealing',
  'Boya',
  'Makine/Tezgah Besleme',
  'Montaj',
  'Vidalama',
  'Al/Bırak (Pick&Place)',
  'Paletleme',
  'Kutulama',
  'Su Jeti',
  'Pres Besleme',
];

const SEKTORLER = [
  'Otomotiv Ana Sanayi',
  'Otomotiv Yan Sanayi (Tier 1)',
  'Otomotiv Yan Sanayi (Tier 2)',
  'Gıda',
  'İlaç',
  'İnşaat',
  'Havacılık',
  'Metal',
  'Hızlı Tüketim Ürünleri (temizlik malzemeleri, bebek bezi, vs.)',
  'Savunma Sanayi',
];

const ILLER = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Mersin', 'Kayseri', 'Eskişehir', 'Trabzon', 'Samsun', 'Denizli', 'Sakarya',
  'Kocaeli', 'Tekirdağ', 'Muğla', 'Balıkesir', 'Manisa', 'Tüm Türkiye',
];

const TECRUBE_OPTIONS = [
  '1 yıldan az',
  '1-3 yıl',
  '3-5 yıl',
  '5-10 yıl',
  '10+ yıl',
];

export default function CreateIlan() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [firmaId, setFirmaId] = useState<string | null>(null);

  // Form state
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [faaliyetAlanlari, setFaaliyetAlanlari] = useState<string[]>([]);
  const [uzmanlikAlanlari, setUzmanlikAlanlari] = useState<string[]>([]);
  const [sektor, setSektor] = useState('');
  const [tecrube, setTecrube] = useState('');
  const [iller, setIller] = useState<string[]>([]);
  const [butceMin, setButceMin] = useState<number | ''>('');
  const [butceMax, setButceMax] = useState<number | ''>('');
  const [sonTarih, setSonTarih] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    if (userRole && userRole !== 'firma') {
      toast({
        title: 'Erişim Engellendi',
        description: 'Bu sayfa sadece firma hesapları için.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }
  }, [user, userRole, authLoading, navigate, toast]);

  // Fetch firma ID when user is available
  useEffect(() => {
    const fetchFirmaId = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('firma')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Firma fetch error:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setFirmaId(data[0].id);
      }
    };

    fetchFirmaId();
  }, [user]);

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firmaId) {
      toast({
        title: 'Hata',
        description: 'Firma bilgisi bulunamadı.',
        variant: 'destructive',
      });
      return;
    }

    if (!baslik.trim()) {
      toast({
        title: 'Başlık Gerekli',
        description: 'Lütfen ilan başlığını girin.',
        variant: 'destructive',
      });
      return;
    }

    if (faaliyetAlanlari.length === 0) {
      toast({
        title: 'Faaliyet Alanı Seçin',
        description: 'En az bir faaliyet alanı seçmelisiniz.',
        variant: 'destructive',
      });
      return;
    }

    if (!sonTarih) {
      toast({
        title: 'Son Başvuru Tarihi Gerekli',
        description: 'Lütfen son başvuru tarihini seçin.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('ilanlar').insert({
        firma_id: firmaId,
        baslik: baslik.trim(),
        aciklama: aciklama.trim() || null,
        aranan_faaliyet_alanlari: faaliyetAlanlari.join(', '),
        aranan_uzmanlik: uzmanlikAlanlari.length > 0 ? uzmanlikAlanlari.join(', ') : null,
        aranan_sektor: sektor || null,
        aranan_tecrube: tecrube || null,
        hizmet_verilen_iller: iller.length > 0 ? iller.join(', ') : null,
        butce_min: butceMin ? Number(butceMin) : null,
        butce_max: butceMax ? Number(butceMax) : null,
        son_tarih: sonTarih || null,
      });

      if (error) throw error;

      toast({
        title: 'İlan Oluşturuldu',
        description: 'İlanınız başarıyla yayınlandı.',
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-firma/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-firma to-firma/70 bg-clip-text text-transparent">
              Yeni İlan Oluştur
            </h1>
            <p className="text-muted-foreground mt-1">
              Entegratörlerden teklif almak için ilan yayınlayın
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-firma/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-firma" />
                İlan Bilgileri
              </CardTitle>
              <CardDescription>
                İlanınızın detaylarını girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Başlık */}
              <div className="space-y-2">
                <Label htmlFor="baslik">İlan Başlığı *</Label>
                <Input
                  id="baslik"
                  value={baslik}
                  onChange={(e) => setBaslik(e.target.value)}
                  placeholder="Örn: Robot Kaynak Hattı Kurulumu"
                  maxLength={200}
                />
              </div>

              {/* Açıklama */}
              <div className="space-y-2">
                <Label htmlFor="aciklama">Açıklama</Label>
                <Textarea
                  id="aciklama"
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  placeholder="Proje detaylarını açıklayın..."
                  rows={4}
                />
              </div>

              {/* Faaliyet Alanları */}
              <div className="space-y-2">
                <Label>Aranan Faaliyet Alanları *</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg bg-muted/30">
                  {FAALIYET_ALANLARI.map((alan) => (
                    <label key={alan} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={faaliyetAlanlari.includes(alan)}
                        onCheckedChange={() => toggleArrayItem(faaliyetAlanlari, setFaaliyetAlanlari, alan)}
                      />
                      <span className="text-sm">{alan}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Uzmanlık Alanları */}
              <div className="space-y-2">
                <Label>Aranan Uzmanlık Alanları</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-muted/30">
                  {UZMANLIK_ALANLARI.map((alan) => (
                    <label key={alan} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={uzmanlikAlanlari.includes(alan)}
                        onCheckedChange={() => toggleArrayItem(uzmanlikAlanlari, setUzmanlikAlanlari, alan)}
                      />
                      <span className="text-sm">{alan}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sektör ve Tecrübe */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sektör</Label>
                  <Select value={sektor} onValueChange={setSektor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sektör seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEKTORLER.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Tecrübe</Label>
                  <Select value={tecrube} onValueChange={setTecrube}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tecrübe seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {TECRUBE_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* İller */}
              <div className="space-y-2">
                <Label>Hizmet Beklenen İller</Label>
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-3 border rounded-lg bg-muted/30">
                  {ILLER.map((il) => (
                    <label key={il} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={iller.includes(il)}
                        onCheckedChange={() => toggleArrayItem(iller, setIller, il)}
                      />
                      <span className="text-sm">{il}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bütçe */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="butceMin">Minimum Bütçe (₺)</Label>
                  <Input
                    id="butceMin"
                    type="number"
                    value={butceMin}
                    onChange={(e) => setButceMin(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Örn: 50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="butceMax">Maksimum Bütçe (₺)</Label>
                  <Input
                    id="butceMax"
                    type="number"
                    value={butceMax}
                    onChange={(e) => setButceMax(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Örn: 150000"
                  />
                </div>
              </div>

              {/* Son Tarih */}
              <div className="space-y-2">
                <Label htmlFor="sonTarih">Son Başvuru Tarihi *</Label>
                <Input
                  id="sonTarih"
                  type="date"
                  value={sonTarih}
                  onChange={(e) => setSonTarih(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full bg-firma hover:bg-firma/90 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Yayınlanıyor...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    İlanı Yayınla
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
