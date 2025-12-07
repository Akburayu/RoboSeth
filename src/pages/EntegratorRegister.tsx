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
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, FileText, ClipboardList, CreditCard, ArrowLeft, ArrowRight, Upload, Check, Loader2, X, Star } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

interface PlanInfo {
  name: string;
  price: number;
  features: string[];
  highlighted?: boolean;
}

const PLANS: Record<'basic' | 'premium', PlanInfo> = {
  basic: { 
    name: 'Basic', 
    price: 0, 
    features: ['Temel profil', 'İlan görüntüleme', 'Teklif gönderme', 'Email desteği'] 
  },
  premium: { 
    name: 'Premium', 
    price: 0, 
    features: ['Öne çıkan profil', 'Sınırsız teklif', 'Öncelikli listeleme', '7/24 destek', 'Rozet görünümü'],
    highlighted: true
  },
};

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

const MARKALAR = [
  'ABB',
  'Fanuc',
  'Kuka',
  'Yaskawa',
  'Nachi',
  'Dürr',
  'Epson',
  'Estun',
  'Staubli',
  'Universal',
  'Diğer',
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

interface UploadedFile {
  file: File | null;
  path: string | null;
  uploading: boolean;
}

export default function EntegratorRegister() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 2: Belgeler (4 belge - firma ile aynı)
  const [documents, setDocuments] = useState<{
    ticaret_sicil: UploadedFile;
    faaliyet_belgesi: UploadedFile;
    imza_sirkuleri: UploadedFile;
    vergi_levhasi: UploadedFile;
  }>({
    ticaret_sicil: { file: null, path: null, uploading: false },
    faaliyet_belgesi: { file: null, path: null, uploading: false },
    imza_sirkuleri: { file: null, path: null, uploading: false },
    vergi_levhasi: { file: null, path: null, uploading: false },
  });

  // Step 3: Form fields
  const [entegratorAdi, setEntegratorAdi] = useState('');
  const [email, setEmail] = useState('');
  const [faaliyetAlanlari, setFaaliyetAlanlari] = useState<string[]>([]);
  const [uzmanlikAlanlari, setUzmanlikAlanlari] = useState<string[]>([]);
  const [referans, setReferans] = useState('');
  const [kacKisi, setKacKisi] = useState<number | ''>('');
  const [tecrube, setTecrube] = useState('');
  const [sektor, setSektor] = useState('');
  const [iletisimSosyalMedya, setIletisimSosyalMedya] = useState('');
  const [konum, setKonum] = useState('');
  const [hizmetVerilenIller, setHizmetVerilenIller] = useState<string[]>([]);
  const [markalar, setMarkalar] = useState<string[]>([]);

  // Step 4: Plan
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic');

  // Check if user is logged in and has entegrator role
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast({
        title: 'Giriş Gerekli',
        description: 'Bu sayfaya erişmek için giriş yapmalısınız.',
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    if (userRole && userRole !== 'entegrator') {
      toast({
        title: 'Erişim Engellendi',
        description: 'Bu sayfa sadece entegratör hesapları için.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, userRole, authLoading, navigate, toast]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: keyof typeof documents
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Geçersiz Dosya Türü',
        description: 'Sadece PDF, JPG ve PNG dosyaları yükleyebilirsiniz.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Dosya Çok Büyük',
        description: 'Dosya boyutu 10MB\'dan küçük olmalıdır.',
        variant: 'destructive',
      });
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], file, uploading: true },
    }));

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${docType}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('entegrator-documents')
      .upload(filePath, file);

    if (error) {
      toast({
        title: 'Yükleme Hatası',
        description: error.message,
        variant: 'destructive',
      });
      setDocuments((prev) => ({
        ...prev,
        [docType]: { file: null, path: null, uploading: false },
      }));
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: { file, path: filePath, uploading: false },
    }));

    toast({
      title: 'Dosya Yüklendi',
      description: `${file.name} başarıyla yüklendi.`,
    });
  };

  const removeDocument = async (docType: keyof typeof documents) => {
    const doc = documents[docType];
    if (doc.path) {
      await supabase.storage.from('entegrator-documents').remove([doc.path]);
    }
    setDocuments((prev) => ({
      ...prev,
      [docType]: { file: null, path: null, uploading: false },
    }));
  };

  const toggleArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const allDocsUploaded = Object.values(documents).every((doc) => doc.path !== null);
        if (!allDocsUploaded) {
          toast({
            title: 'Belgeler Eksik',
            description: 'Lütfen tüm belgeleri yükleyin.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 2:
        if (!entegratorAdi.trim() || entegratorAdi.length < 2) {
          toast({
            title: 'Geçersiz İsim',
            description: 'Entegratör adı en az 2 karakter olmalıdır.',
            variant: 'destructive',
          });
          return false;
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast({
            title: 'Geçersiz E-posta',
            description: 'Lütfen geçerli bir e-posta adresi girin.',
            variant: 'destructive',
          });
          return false;
        }
        if (faaliyetAlanlari.length === 0) {
          toast({
            title: 'Faaliyet Alanı Seçin',
            description: 'En az bir faaliyet alanı seçmelisiniz.',
            variant: 'destructive',
          });
          return false;
        }
        if (uzmanlikAlanlari.length === 0) {
          toast({
            title: 'Uzmanlık Alanı Seçin',
            description: 'En az bir uzmanlık alanı seçmelisiniz.',
            variant: 'destructive',
          });
          return false;
        }
        if (!tecrube) {
          toast({
            title: 'Tecrübe Seçin',
            description: 'Lütfen tecrübe sürenizi seçin.',
            variant: 'destructive',
          });
          return false;
        }
        if (hizmetVerilenIller.length === 0) {
          toast({
            title: 'İl Seçin',
            description: 'En az bir hizmet verilen il seçmelisiniz.',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase.from('entegrator').insert({
        user_id: user.id,
        entegrator_adi: entegratorAdi,
        faaliyet_alanlari: faaliyetAlanlari.join(', '),
        uzmanlik_alani: uzmanlikAlanlari.join(', '),
        referans: referans || null,
        kac_kisi: kacKisi ? Number(kacKisi) : null,
        tecrube,
        sektor: sektor || null,
        iletisim_sosyal_medya: iletisimSosyalMedya || null,
        konum: konum || null,
        hizmet_verilen_iller: hizmetVerilenIller.join(', '),
        belgesi1: documents.ticaret_sicil.path,
        belgesi2: documents.faaliyet_belgesi.path,
        belgesi3: documents.imza_sirkuleri.path,
        puan: 0,
        email: email,
      });

      if (error) throw error;

      toast({
        title: 'Kayıt Tamamlandı!',
        description: `Hoş geldiniz! ${selectedPlan === 'premium' ? 'Premium' : 'Basic'} üyeliğiniz aktif.`,
      });

      navigate('/entegrator/dashboard');
    } catch (error: any) {
      toast({
        title: 'Kayıt Hatası',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Belgeler', icon: FileText },
    { number: 2, title: 'Bilgiler', icon: ClipboardList },
    { number: 3, title: 'Plan', icon: CreditCard },
  ];

  const progressValue = ((currentStep - 1) / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-entegrator/5 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-entegrator to-entegrator/70 bg-clip-text text-transparent">
            Entegratör Kaydı
          </h1>
          <p className="text-muted-foreground mt-2">
            Profilininizi tamamlamak için aşağıdaki adımları izleyin
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col items-center ${
                  currentStep >= step.number ? 'text-entegrator' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    currentStep > step.number
                      ? 'bg-entegrator text-white'
                      : currentStep === step.number
                      ? 'bg-entegrator/20 border-2 border-entegrator'
                      : 'bg-muted'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="border-entegrator/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return StepIcon ? <StepIcon className="h-5 w-5 text-entegrator" /> : null;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
<CardDescription>
              {currentStep === 1 && 'Gerekli belgelerinizi yükleyin'}
              {currentStep === 2 && 'Profil bilgilerinizi doldurun'}
              {currentStep === 3 && 'Üyelik planınızı seçin'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Belgeler (4 belge - firma ile aynı) */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {[
                  { key: 'ticaret_sicil', label: 'Ticaret Sicil Gazetesi' },
                  { key: 'faaliyet_belgesi', label: 'Faaliyet Belgesi' },
                  { key: 'imza_sirkuleri', label: 'İmza Sirküleri' },
                  { key: 'vergi_levhasi', label: 'Vergi Levhası' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{label} *</div>
                      {documents[key as keyof typeof documents].file ? (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          {documents[key as keyof typeof documents].file?.name}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-1">
                          PDF, JPG veya PNG (max 10MB)
                        </div>
                      )}
                    </div>
                    
                    {documents[key as keyof typeof documents].uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-entegrator" />
                    ) : documents[key as keyof typeof documents].file ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocument(key as keyof typeof documents)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, key as keyof typeof documents)}
                          className="hidden"
                        />
                        <div className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">
                          <Upload className="h-4 w-4" />
                          Yükle
                        </div>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Bilgiler */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="entegratorAdi">Entegratör Adı *</Label>
                  <Input
                    id="entegratorAdi"
                    value={entegratorAdi}
                    onChange={(e) => setEntegratorAdi(e.target.value)}
                    placeholder="Şirketinizin tam adı"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta Adresi *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="entegrator@ornek.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Bildirimler bu e-posta adresine gönderilecektir.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Markalar</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {MARKALAR.map((marka) => (
                      <label key={marka} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={markalar.includes(marka)}
                          onCheckedChange={() => toggleArrayItem(markalar, setMarkalar, marka)}
                        />
                        <span className="text-sm">{marka}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Faaliyet Alanları *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
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

                <div className="space-y-2">
                  <Label>Uzmanlık Alanları *</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kacKisi">Çalışan Sayısı</Label>
                    <Input
                      id="kacKisi"
                      type="number"
                      value={kacKisi}
                      onChange={(e) => setKacKisi(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Örn: 15"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tecrube">Tecrübe *</Label>
                    <Select value={tecrube} onValueChange={setTecrube}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {TECRUBE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sektor">Sektör</Label>
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
                  <Label>Hizmet Verilen İller *</Label>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                    {ILLER.map((il) => (
                      <label key={il} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={hizmetVerilenIller.includes(il)}
                          onCheckedChange={() => toggleArrayItem(hizmetVerilenIller, setHizmetVerilenIller, il)}
                        />
                        <span className="text-sm">{il}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="konum">Konum</Label>
                  <Input
                    id="konum"
                    value={konum}
                    onChange={(e) => setKonum(e.target.value)}
                    placeholder="Örn: İstanbul, Kadıköy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referans">Referanslar</Label>
                  <Textarea
                    id="referans"
                    value={referans}
                    onChange={(e) => setReferans(e.target.value)}
                    placeholder="Çalıştığınız firmalar ve projeler..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sosyalMedya">İletişim / Sosyal Medya</Label>
                  <Input
                    id="sosyalMedya"
                    value={iletisimSosyalMedya}
                    onChange={(e) => setIletisimSosyalMedya(e.target.value)}
                    placeholder="LinkedIn, website vb."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Plan */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {(Object.keys(PLANS) as Array<'basic' | 'premium'>).map((planKey) => (
                    <button
                      key={planKey}
                      onClick={() => setSelectedPlan(planKey)}
                      className={`p-6 rounded-xl border-2 transition-all text-left relative ${
                        selectedPlan === planKey
                          ? 'border-entegrator bg-entegrator/10 shadow-lg'
                          : 'border-border hover:border-entegrator/50 hover:bg-entegrator/5'
                      } ${PLANS[planKey].highlighted ? 'ring-2 ring-entegrator/50' : ''}`}
                    >
                      {PLANS[planKey].highlighted && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-entegrator text-white text-xs rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Önerilen
                        </div>
                      )}
                      <div className="font-bold text-xl mb-2">{PLANS[planKey].name}</div>
                      <ul className="space-y-1">
                        {PLANS[planKey].features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3 w-3 text-entegrator" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Şu an için üyelikler ücretsizdir. Ödeme sistemi yakında aktif olacaktır.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} className="gap-2 bg-entegrator hover:bg-entegrator/90">
              İleri
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="gap-2 bg-entegrator hover:bg-entegrator/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Tamamla
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
