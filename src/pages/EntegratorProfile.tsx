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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NotificationBell from '@/components/NotificationBell';
import { 
  ArrowLeft,
  User,
  Save,
  Loader2,
  Award,
  MapPin,
  Briefcase,
  CheckCircle2,
  Users
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Entegrator = Database['public']['Tables']['entegrator']['Row'];
type EntegratorBuyuklugu = Database['public']['Enums']['entegrator_buyuklugu'];

const FAALIYET_ALANLARI = [
  'Mekanik Tasarım', 'Robot Programlama', 'Ark Kaynak - MIG', 'Ark Kaynak - MAG',
  'Ark Kaynak - TIG', 'Punta Kaynak', 'Lazer Kaynak', 'Paletleme', 'Depaletleme',
  'Pick & Place', 'Makine Besleme', 'CNC Besleme', 'Pres Besleme', 'Montaj',
  'Vidalama', 'Yapıştırma', 'Boyama', 'Kaplama', 'Kumlama', 'Taşlama',
  'Polisaj', 'Kesme', 'Delme', 'Paketleme', 'Etiketleme', 'Kalite Kontrol',
  'Görüntü İşleme', 'Robot Servisi', 'Yedek Parça', 'Eğitim'
];

const UZMANLIK_ALANLARI = [
  'Ark Kaynağı', 'Punta Kaynağı', 'Lazer Kaynağı', 'Paletleme',
  'Depaletleme', 'Pick & Place', 'Makine Besleme', 'Montaj',
  'Vidalama', 'Boyama', 'Taşlama', 'Görüntü İşleme'
];

const SEKTORLER = [
  'Otomotiv Ana Sanayi', 'Otomotiv Yan Sanayi', 'Beyaz Eşya',
  'Genel İmalat', 'Metal İşleme', 'Plastik', 'Gıda',
  'İlaç', 'Kozmetik', 'Savunma Sanayi'
];

const MARKALAR = [
  'ABB', 'Fanuc', 'Kuka', 'Yaskawa', 'Nachi',
  'Dürr', 'Epson', 'Estun', 'Staubli', 'Universal'
];

const ILLER = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Mersin', 'Kayseri', 'Eskişehir', 'Kocaeli', 'Sakarya', 'Manisa', 'Tüm Türkiye'
];

const TECRUBE_OPTIONS = ['1 yıldan az', '1-3 yıl', '3-5 yıl', '5-10 yıl', '10+ yıl'];

const BUYUKLUK_LABELS: Record<EntegratorBuyuklugu, string> = {
  kucuk: 'Küçük',
  orta: 'Orta',
  buyuk: 'Büyük',
};

export default function EntegratorProfile() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [entegrator, setEntegrator] = useState<Entegrator | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [faaliyetAlanlari, setFaaliyetAlanlari] = useState<string[]>([]);
  const [uzmanlikAlanlari, setUzmanlikAlanlari] = useState<string[]>([]);
  const [sektor, setSektor] = useState('');
  const [tecrube, setTecrube] = useState('');
  const [hizmetIller, setHizmetIller] = useState<string[]>([]);
  const [konum, setKonum] = useState('');
  const [kacKisi, setKacKisi] = useState<number | ''>('');
  const [referans, setReferans] = useState('');
  const [iletisim, setIletisim] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    if (userRole && userRole !== 'entegrator') {
      navigate('/');
      return;
    }

    fetchEntegratorProfile();
  }, [user, userRole, authLoading, navigate]);

  const fetchEntegratorProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entegrator')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setEntegrator(data);
        setFaaliyetAlanlari(data.faaliyet_alanlari?.split(', ') || []);
        setUzmanlikAlanlari(data.uzmanlik_alani?.split(', ') || []);
        setSektor(data.sektor || '');
        setTecrube(data.tecrube || '');
        setHizmetIller(data.hizmet_verilen_iller?.split(', ') || []);
        setKonum(data.konum || '');
        setKacKisi(data.kac_kisi || '');
        setReferans(data.referans || '');
        setIletisim(data.iletisim_sosyal_medya || '');
      }
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

  const handleSave = async () => {
    if (!entegrator) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('entegrator')
        .update({
          faaliyet_alanlari: faaliyetAlanlari.join(', ') || null,
          uzmanlik_alani: uzmanlikAlanlari.join(', ') || null,
          sektor: sektor || null,
          tecrube: tecrube || null,
          hizmet_verilen_iller: hizmetIller.join(', ') || null,
          konum: konum.trim() || null,
          kac_kisi: kacKisi ? Number(kacKisi) : null,
          referans: referans.trim() || null,
          iletisim_sosyal_medya: iletisim.trim() || null,
        })
        .eq('id', entegrator.id);

      if (error) throw error;

      toast({
        title: 'Başarılı',
        description: 'Profil bilgileriniz güncellendi.',
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter(i => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-entegrator" />
      </div>
    );
  }

  if (!entegrator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Entegratör profili bulunamadı.</p>
          <Button onClick={() => navigate('/entegrator/register')} className="mt-4">
            Entegratör Kaydı Oluştur
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/entegrator/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-entegrator flex items-center gap-2">
                  <User className="h-6 w-6" />
                  Entegratör Profili
                </h1>
                <p className="text-sm text-muted-foreground">
                  Profil bilgilerinizi düzenleyin
                </p>
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Stats Card - Without rating (hidden from entegrator) */}
          <Card className="border-entegrator/20 bg-gradient-to-br from-entegrator/5 to-entegrator/10">
            <CardContent className="py-6">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    {entegrator.kac_kisi || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Çalışan</p>
                </div>
                <div>
                  <Badge variant="secondary" className="text-sm">
                    {BUYUKLUK_LABELS[entegrator.entegrator_buyuklugu || 'kucuk']}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Ölçek</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Temel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Entegratör Adı</Label>
                <Input value={entegrator.entegrator_adi} disabled className="bg-muted" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="konum">Konum</Label>
                  <Input
                    id="konum"
                    value={konum}
                    onChange={(e) => setKonum(e.target.value)}
                    placeholder="Örn: İstanbul, Türkiye"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kacKisi">Çalışan Sayısı</Label>
                  <Input
                    id="kacKisi"
                    type="number"
                    value={kacKisi}
                    onChange={(e) => setKacKisi(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Örn: 25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sektor">Sektör</Label>
                <Select value={sektor} onValueChange={setSektor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sektör seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEKTORLER.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tecrube">Tecrübe</Label>
                <Select value={tecrube} onValueChange={setTecrube}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tecrübe seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECRUBE_OPTIONS.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Faaliyet Alanları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Faaliyet Alanları
              </CardTitle>
              <CardDescription>Sunduğunuz hizmetleri seçin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {FAALIYET_ALANLARI.map(alan => (
                  <label key={alan} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={faaliyetAlanlari.includes(alan)}
                      onCheckedChange={() => toggleArrayItem(faaliyetAlanlari, setFaaliyetAlanlari, alan)}
                    />
                    <span className="text-sm">{alan}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Uzmanlık Alanları */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Uzmanlık Alanları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {UZMANLIK_ALANLARI.map(alan => (
                  <label key={alan} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={uzmanlikAlanlari.includes(alan)}
                      onCheckedChange={() => toggleArrayItem(uzmanlikAlanlari, setUzmanlikAlanlari, alan)}
                    />
                    <span className="text-sm">{alan}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hizmet Verilen İller */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Hizmet Verilen İller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {ILLER.map(il => (
                  <label key={il} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={hizmetIller.includes(il)}
                      onCheckedChange={() => toggleArrayItem(hizmetIller, setHizmetIller, il)}
                    />
                    <span className="text-sm">{il}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Referanslar ve İletişim */}
          <Card>
            <CardHeader>
              <CardTitle>Referanslar ve İletişim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referans">Referanslar</Label>
                <Textarea
                  id="referans"
                  value={referans}
                  onChange={(e) => setReferans(e.target.value)}
                  placeholder="Çalıştığınız firmalar, tamamladığınız projeler..."
                  rows={4}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="iletisim">İletişim Bilgileri</Label>
                <Textarea
                  id="iletisim"
                  value={iletisim}
                  onChange={(e) => setIletisim(e.target.value)}
                  placeholder="Telefon, e-posta, web sitesi, sosyal medya hesapları..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Bu bilgiler firmalar tarafından kredi karşılığı görüntülenebilir
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Belgeler */}
          <Card>
            <CardHeader>
              <CardTitle>Yüklü Belgeler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { belge: entegrator.belgesi1, name: 'Ticaret Sicil Gazetesi' },
                  { belge: entegrator.belgesi2, name: 'Faaliyet Belgesi' },
                  { belge: entegrator.belgesi3, name: 'İmza Sirküleri' },
                  { belge: (entegrator as any).belgesi4, name: 'Vergi Levhası' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {item.belge ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-foreground">{item.name}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        <span className="text-muted-foreground">{item.name} - Yüklenmedi</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-entegrator hover:bg-entegrator/90 gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
