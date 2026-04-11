import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

const getBuyuklukLabels = (t: (key: string) => string): Record<EntegratorBuyuklugu, string> => ({
  kucuk: t('profile.scaleSmall'),
  orta: t('profile.scaleMedium'),
  buyuk: t('profile.scaleLarge'),
});

export default function EntegratorProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        title: t('common.error'),
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
        title: t('common.success'),
        description: t('profile.profileUpdated'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
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
          <p className="text-muted-foreground">{t('profile.entegratorNotFound')}</p>
          <Button onClick={() => navigate('/entegrator/register')} className="mt-4">
            {t('profile.createEntegratorRegistration')}
          </Button>
        </Card>
      </div>
    );
  }

  const BUYUKLUK_LABELS = getBuyuklukLabels(t);

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
                  {t('profile.entegratorProfile')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('profile.editProfile')}
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
                  <p className="text-xs text-muted-foreground">{t('common.employee')}</p>
                </div>
                <div>
                  <Badge variant="secondary" className="text-sm">
                    {BUYUKLUK_LABELS[entegrator.entegrator_buyuklugu || 'kucuk']}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{t('common.scale')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('entegratorRegister.entegratorName')}</Label>
                <Input value={entegrator.entegrator_adi} disabled className="bg-muted" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="konum">{t('entegratorRegister.location')}</Label>
                  <Input
                    id="konum"
                    value={konum}
                    onChange={(e) => setKonum(e.target.value)}
                    placeholder={t('entegratorRegister.locationPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kacKisi">{t('register.employeeCount')}</Label>
                  <Input
                    id="kacKisi"
                    type="number"
                    value={kacKisi}
                    onChange={(e) => setKacKisi(e.target.value ? Number(e.target.value) : '')}
                    placeholder={t('register.employeeCountPlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sektor">{t('filters.sector')}</Label>
                <Select value={sektor} onValueChange={setSektor}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('profile.selectSector')} />
                  </SelectTrigger>
                  <SelectContent>
                    {SEKTORLER.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tecrube">{t('filters.experience')}</Label>
                <Select value={tecrube} onValueChange={setTecrube}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('profile.selectExperience')} />
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
                {t('filters.activityAreas')}
              </CardTitle>
              <CardDescription>{t('profile.selectServices')}</CardDescription>
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
                {t('filters.expertiseAreas')}
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
                {t('filters.serviceProvinces')}
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
              <CardTitle>{t('profile.referencesAndContact')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referans">{t('entegratorRegister.references')}</Label>
                <Textarea
                  id="referans"
                  value={referans}
                  onChange={(e) => setReferans(e.target.value)}
                  placeholder={t('profile.referencesPlaceholder')}
                  rows={4}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="iletisim">{t('profile.contactInfo')}</Label>
                <Textarea
                  id="iletisim"
                  value={iletisim}
                  onChange={(e) => setIletisim(e.target.value)}
                  placeholder={t('profile.contactPlaceholder')}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {t('profile.contactNote')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Belgeler */}
          <Card>
            <CardHeader>
              <CardTitle>{t('register.uploadedDocuments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { belge: entegrator.belgesi1, name: t('register.ticaretSicil') },
                  { belge: entegrator.belgesi2, name: t('register.faaliyetBelgesi') },
                  { belge: entegrator.belgesi3, name: t('register.imzaSirkuleri') },
                  { belge: (entegrator as any).belgesi4, name: t('register.vergiLevhasi') },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {item.belge ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-foreground">{item.name}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        <span className="text-muted-foreground">{item.name} - {t('register.notUploaded')}</span>
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
                {t('common.saving')}...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('register.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
