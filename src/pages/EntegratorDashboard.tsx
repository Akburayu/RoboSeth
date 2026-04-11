import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Calendar,
  DollarSign,
  Loader2,
  Search,
  Send,
  CheckCircle2,
  Building2,
  Award,
  Filter,
  User,
  LogOut,
  ChevronDown,
  X,
  Gavel,
  TrendingDown,
  TrendingUp,
  Users,
  Lock,
  Shield,
  Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Filter options from EntegratorRegister
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

interface Ilan {
  id: string;
  firma_id: string;
  baslik: string | null;
  aciklama: string | null;
  aranan_faaliyet_alanlari: string | null;
  aranan_uzmanlik: string | null;
  aranan_sektor: string | null;
  aranan_tecrube: string | null;
  hizmet_verilen_iller: string | null;
  butce_min: number | null;
  butce_max: number | null;
  son_tarih: string | null;
  created_at: string | null;
  firma?: {
    firma_adi: string;
  };
}

interface Teklif {
  id: string;
  ilan_id: string;
}

export default function EntegratorDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entegratorId, setEntegratorId] = useState<string | null>(null);
  const [myTeklifler, setMyTeklifler] = useState<Set<string>>(new Set());

  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterFaaliyetAlanlari, setFilterFaaliyetAlanlari] = useState<string[]>([]);
  const [filterUzmanlikAlanlari, setFilterUzmanlikAlanlari] = useState<string[]>([]);
  const [filterSektor, setFilterSektor] = useState('');
  const [filterTecrube, setFilterTecrube] = useState('');
  const [filterIller, setFilterIller] = useState<string[]>([]);

  // Teklif modal state
  const [teklifModalOpen, setTeklifModalOpen] = useState(false);
  const [selectedIlan, setSelectedIlan] = useState<Ilan | null>(null);
  const [teklifTutari, setTeklifTutari] = useState<number | ''>('');
  const [teklifMesaj, setTeklifMesaj] = useState('');
  const [submittingTeklif, setSubmittingTeklif] = useState(false);

  // İhale state
  const [ihaleler, setIhaleler] = useState<any[]>([]);
  const [ihalelerLoading, setIhalelerLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    // Allow guest mode without authentication
    if (isGuestMode) {
      fetchIlanlar();
      fetchIhaleler();
      return;
    }
    
    if (!user) {
      navigate('/');
      return;
    }

    if (userRole && userRole !== 'entegrator') {
      toast({
        title: t('auth.accessDenied'),
        description: t('auth.entegratorOnly'),
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    fetchEntegratorId();
    fetchIlanlar();
    fetchIhaleler();
  }, [user, userRole, authLoading, navigate, toast, isGuestMode]);

  useEffect(() => {
    if (entegratorId) {
      fetchMyTeklifler();
    }
  }, [entegratorId]);

  const fetchEntegratorId = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('entegrator')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0) {
      setEntegratorId(data[0].id);
    }
  };

  const fetchIlanlar = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ilanlar')
        .select(`
          *,
          firma:firma_id (firma_adi)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIlanlar(data || []);
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

  const fetchIhaleler = async () => {
    setIhalelerLoading(true);
    try {
      const { data, error } = await supabase
        .from('ihaleler')
        .select('*')
        .eq('durum', 'aktif')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIhaleler(data || []);
    } catch (error: any) {
      console.error('Error fetching ihaleler:', error);
    } finally {
      setIhalelerLoading(false);
    }
  };

  const fetchMyTeklifler = async () => {
    if (!entegratorId) return;
    try {
      const { data, error } = await supabase
        .from('teklifler')
        .select('ilan_id')
        .eq('entegrator_id', entegratorId);

      if (error) throw error;
      
      const teklifIlanIds = new Set(data?.map(t => t.ilan_id) || []);
      setMyTeklifler(teklifIlanIds);
    } catch (error: any) {
      console.error('Error fetching teklifler:', error);
    }
  };

  const handleTeklifClick = (ilan: Ilan) => {
    if (myTeklifler.has(ilan.id)) {
      toast({
        title: t('listings.alreadyProposed'),
        description: t('listings.alreadyProposedDesc'),
      });
      return;
    }
    setSelectedIlan(ilan);
    setTeklifTutari('');
    setTeklifMesaj('');
    setTeklifModalOpen(true);
  };

  const submitTeklif = async () => {
    if (!selectedIlan || !entegratorId) return;

    if (!teklifTutari) {
      toast({
        title: t('listings.proposalAmountRequired'),
        description: t('listings.proposalAmountRequiredDesc'),
        variant: 'destructive',
      });
      return;
    }

    setSubmittingTeklif(true);
    try {
      const { error } = await supabase.from('teklifler').insert({
        ilan_id: selectedIlan.id,
        entegrator_id: entegratorId,
        teklif_tutari: Number(teklifTutari),
        mesaj: teklifMesaj.trim() || null,
      });

      if (error) throw error;

      // Send email notification via edge function
      try {
        await supabase.functions.invoke('send-proposal-notification', {
          body: {
            ilan_id: selectedIlan.id,
            entegrator_id: entegratorId,
            teklif_tutari: Number(teklifTutari),
            mesaj: teklifMesaj.trim() || null,
          },
        });
        console.log('Proposal notification sent successfully');
      } catch (notifError) {
        console.error('Failed to send notification email:', notifError);
        // Don't fail the whole operation if email fails
      }

      setMyTeklifler(prev => new Set([...prev, selectedIlan.id]));
      setTeklifModalOpen(false);
      
      toast({
        title: t('listings.proposalSuccess'),
        description: t('listings.proposalSuccessDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingTeklif(false);
    }
  };

  const toggleFilterArrayItem = (array: string[], setArray: (arr: string[]) => void, item: string) => {
    if (array.includes(item)) {
      setArray(array.filter((i) => i !== item));
    } else {
      setArray([...array, item]);
    }
  };

  const clearFilters = () => {
    setFilterFaaliyetAlanlari([]);
    setFilterUzmanlikAlanlari([]);
    setFilterSektor('');
    setFilterTecrube('');
    setFilterIller([]);
  };

  const activeFilterCount = 
    filterFaaliyetAlanlari.length + 
    filterUzmanlikAlanlari.length + 
    (filterSektor ? 1 : 0) + 
    (filterTecrube ? 1 : 0) + 
    filterIller.length;

  const filteredIlanlar = ilanlar.filter((ilan) => {
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        ilan.baslik?.toLowerCase().includes(query) ||
        ilan.aciklama?.toLowerCase().includes(query) ||
        ilan.aranan_faaliyet_alanlari?.toLowerCase().includes(query) ||
        ilan.aranan_uzmanlik?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Faaliyet alanları filter
    if (filterFaaliyetAlanlari.length > 0) {
      const ilanFaaliyetler = ilan.aranan_faaliyet_alanlari?.split(', ') || [];
      const hasMatchingFaaliyet = filterFaaliyetAlanlari.some(f => ilanFaaliyetler.includes(f));
      if (!hasMatchingFaaliyet) return false;
    }

    // Uzmanlık alanları filter
    if (filterUzmanlikAlanlari.length > 0) {
      const ilanUzmanliklar = ilan.aranan_uzmanlik?.split(', ') || [];
      const hasMatchingUzmanlik = filterUzmanlikAlanlari.some(u => ilanUzmanliklar.includes(u));
      if (!hasMatchingUzmanlik) return false;
    }

    // Sektör filter
    if (filterSektor && ilan.aranan_sektor !== filterSektor) {
      return false;
    }

    // Tecrübe filter
    if (filterTecrube && ilan.aranan_tecrube !== filterTecrube) {
      return false;
    }

    // İller filter
    if (filterIller.length > 0) {
      const ilanIller = ilan.hizmet_verilen_iller?.split(', ') || [];
      const hasMatchingIl = filterIller.some(il => ilanIller.includes(il) || ilanIller.includes('Tüm Türkiye'));
      if (!hasMatchingIl) return false;
    }

    return true;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max) return `₺${min.toLocaleString()} - ₺${max.toLocaleString()}`;
    if (min) return `₺${min.toLocaleString()}+`;
    if (max) return `₺${max.toLocaleString()}'e kadar`;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Guest Mode Banner */}
      {isGuestMode && (
        <div className="bg-amber-500/10 border-b border-amber-500/30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-700 dark:text-accent">
              <Eye className="h-5 w-5" />
              <span className="font-medium">{t('index.guestMode')}</span>
              <span className="text-sm">- {t('index.guestModeViewOnly')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigate('/')}
                className="border-amber-500 text-amber-700 hover:bg-amber-500/20"
              >
                {t('auth.login')}
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate('/')}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {t('auth.register')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-entegrator">{t('dashboard.entegratorTitle')}</h1>
              <p className="text-sm text-muted-foreground">{t('dashboard.entegratorSubtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              {!isGuestMode && (
                <>
                  <NotificationBell />
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/entegrator/profile')}
                    title={t('nav.profile')}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await signOut();
                      navigate('/');
                    }}
                    title={t('auth.logout')}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                  {entegratorId && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {t('common.profileActive')}
                    </Badge>
                  )}
                </>
              )}
              {isGuestMode && (
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/')}
                >
                  {t('nav.home')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('dashboard.searchListings')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterOpen(!filterOpen)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {t('common.filter')}
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className={`h-4 w-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filter Panel */}
          <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
            <CollapsibleContent>
              <Card className="p-4 border-entegrator/20">
                <div className="space-y-4">
                  {/* Faaliyet Alanları */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('filters.activityAreas')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg bg-muted/30">
                      {FAALIYET_ALANLARI.map((alan) => (
                        <label key={alan} className="flex items-center gap-2 cursor-pointer text-xs">
                          <Checkbox
                            checked={filterFaaliyetAlanlari.includes(alan)}
                            onCheckedChange={() => toggleFilterArrayItem(filterFaaliyetAlanlari, setFilterFaaliyetAlanlari, alan)}
                          />
                          <span className="truncate">{alan}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Uzmanlık Alanları */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('filters.expertiseAreas')}</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-24 overflow-y-auto p-2 border rounded-lg bg-muted/30">
                      {UZMANLIK_ALANLARI.map((alan) => (
                        <label key={alan} className="flex items-center gap-2 cursor-pointer text-xs">
                          <Checkbox
                            checked={filterUzmanlikAlanlari.includes(alan)}
                            onCheckedChange={() => toggleFilterArrayItem(filterUzmanlikAlanlari, setFilterUzmanlikAlanlari, alan)}
                          />
                          <span className="truncate">{alan}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sektör ve Tecrübe */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('filters.sector')}</Label>
                      <Select value={filterSektor} onValueChange={setFilterSektor}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('filters.selectSector')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('common.all')}</SelectItem>
                          {SEKTORLER.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t('filters.experience')}</Label>
                      <Select value={filterTecrube} onValueChange={setFilterTecrube}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('filters.selectExperience')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('common.all')}</SelectItem>
                          {TECRUBE_OPTIONS.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* İller */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('listings.requiredProvinces')}</Label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-24 overflow-y-auto p-2 border rounded-lg bg-muted/30">
                      {ILLER.map((il) => (
                        <label key={il} className="flex items-center gap-2 cursor-pointer text-xs">
                          <Checkbox
                            checked={filterIller.includes(il)}
                            onCheckedChange={() => toggleFilterArrayItem(filterIller, setFilterIller, il)}
                          />
                          <span className="truncate">{il}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {activeFilterCount > 0 && (
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                        <X className="h-4 w-4" />
                        {t('common.clearFilters')}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Tabs for İlanlar and İhaleler */}
        <Tabs defaultValue="ilanlar" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="ilanlar" className="gap-2">
              <Briefcase className="h-4 w-4" />
              {t('dashboard.listings')} ({filteredIlanlar.length})
            </TabsTrigger>
            <TabsTrigger value="ihaleler" className="gap-2">
              <Gavel className="h-4 w-4" />
              {t('dashboard.auctions')} ({ihaleler.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ilanlar">
            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredIlanlar.length} {t('common.found')}
              {activeFilterCount > 0 && ` (${activeFilterCount} ${t('common.activeFilters')})`}
            </div>

            {/* İlanlar */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-entegrator" />
              </div>
            ) : filteredIlanlar.length === 0 ? (
              <Card className="p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('listings.noListings')}</p>
              </Card>
            ) : (
          <div className="grid gap-4">
            {filteredIlanlar.map((ilan) => (
              <Card 
                key={ilan.id} 
                className="hover:shadow-lg transition-shadow border-entegrator/10 hover:border-entegrator/30"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Main Content */}
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {ilan.baslik || t('listings.unnamedListing')}
                          </h3>
                          {ilan.firma && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Building2 className="h-3 w-3" />
                              {ilan.firma.firma_adi}
                            </div>
                          )}
                        </div>
                        {myTeklifler.has(ilan.id) && (
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t('listings.proposalSent')}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      {ilan.aciklama && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {ilan.aciklama}
                        </p>
                      )}

                      {/* Faaliyet Alanları */}
                      {ilan.aranan_faaliyet_alanlari && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Briefcase className="h-3 w-3" />
                            {t('listings.requiredActivityAreas')}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {ilan.aranan_faaliyet_alanlari.split(', ').slice(0, 4).map((alan, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {alan}
                              </Badge>
                            ))}
                            {ilan.aranan_faaliyet_alanlari.split(', ').length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{ilan.aranan_faaliyet_alanlari.split(', ').length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Uzmanlık */}
                      {ilan.aranan_uzmanlik && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Award className="h-3 w-3" />
                            {t('listings.requiredExpertise')}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {ilan.aranan_uzmanlik.split(', ').slice(0, 3).map((uzm, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {uzm}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Info Row */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {ilan.aranan_tecrube && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {ilan.aranan_tecrube}
                          </div>
                        )}
                        {ilan.hizmet_verilen_iller && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ilan.hizmet_verilen_iller.split(', ').slice(0, 2).join(', ')}
                            {ilan.hizmet_verilen_iller.split(', ').length > 2 && '...'}
                          </div>
                        )}
                        {formatBudget(ilan.butce_min, ilan.butce_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatBudget(ilan.butce_min, ilan.butce_max)}
                          </div>
                        )}
                        {ilan.son_tarih && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Son: {formatDate(ilan.son_tarih)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="lg:w-40 shrink-0">
                      {isGuestMode ? (
                          <Button
                            className="w-full gap-2"
                            variant="outline"
                            onClick={() => {
                              toast({
                                title: t('common.membershipRequired'),
                                description: t('common.membershipRequiredDesc'),
                              });
                            navigate('/');
                          }}
                        >
                          <Lock className="h-4 w-4" />
                          {t('common.membershipRequired')}
                        </Button>
                      ) : (
                        <Button
                          className={`w-full gap-2 ${
                            myTeklifler.has(ilan.id)
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-entegrator hover:bg-entegrator/90'
                          }`}
                          onClick={() => handleTeklifClick(ilan)}
                          disabled={myTeklifler.has(ilan.id)}
                        >
                          {myTeklifler.has(ilan.id) ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              {t('listings.proposalSent')}
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              {t('listings.sendProposal')}
                            </>
                          )}
                        </Button>
                      )}
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        {formatDate(ilan.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="ihaleler">
            {/* İhaleler */}
            {ihalelerLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-entegrator" />
              </div>
            ) : ihaleler.length === 0 ? (
              <Card className="p-12 text-center">
                <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('dashboard.noAuctionsYet')}</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {ihaleler.map((ihale) => {
                  const IHALE_ICONS: Record<string, any> = {
                    'acik_eksiltme': TrendingDown,
                    'ingiliz': TrendingUp,
                    'hollanda': Gavel,
                    'japon': Users,
                    'turlu_kapali': Lock,
                    'muhurlu_kapali': Shield,
                  };
                  const IHALE_COLORS: Record<string, string> = {
                    'acik_eksiltme': 'bg-blue-500',
                    'ingiliz': 'bg-green-500',
                    'hollanda': 'bg-orange-500',
                    'japon': 'bg-yellow-500',
                    'turlu_kapali': 'bg-red-500',
                    'muhurlu_kapali': 'bg-purple-500',
                  };
                  const getIhaleLabels = (turu: string) => {
                    const labels: Record<string, string> = {
                      'acik_eksiltme': t('auctions.acikEksiltme'),
                      'ingiliz': t('auctions.ingiliz'),
                      'hollanda': t('auctions.hollanda'),
                      'japon': t('auctions.japon'),
                      'turlu_kapali': t('auctions.turluKapali'),
                      'muhurlu_kapali': t('auctions.muhurluKapali'),
                    };
                    return labels[turu] || turu;
                  };
                  const IconComponent = IHALE_ICONS[ihale.ihale_turu] || Gavel;

                  const getTimeRemaining = (deadline: string) => {
                    const now = new Date();
                    const end = new Date(deadline);
                    const diff = end.getTime() - now.getTime();
                    if (diff <= 0) return t('auctions.timeExpired');
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    if (days > 0) return t('auctions.daysHours', { days, hours });
                    return `${hours} ${t('auctions.hours')}`;
                  };

                  return (
                    <Card 
                      key={ihale.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        if (isGuestMode) {
                          toast({
                            title: t('index.guestModeLoginRequired'),
                            description: t('index.guestModeLoginRequiredDesc'),
                          });
                          return;
                        }
                        navigate(`/ihale/${ihale.id}`);
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${IHALE_COLORS[ihale.ihale_turu] || 'bg-gray-500'}`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{ihale.baslik}</h3>
                              <Badge variant="outline" className="mt-1">
                                  {getIhaleLabels(ihale.ihale_turu)}
                                </Badge>
                              </div>
                              <Badge variant="secondary" className="shrink-0">
                                <Clock className="h-3 w-3 mr-1" />
                                {getTimeRemaining(ihale.deadline)}
                              </Badge>
                            </div>
                            {ihale.aciklama && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {ihale.aciklama}
                              </p>
                            )}
                            {isGuestMode ? (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast({
                                    title: t('index.guestModeLoginRequired'),
                                    description: t('index.guestModeLoginRequiredDesc'),
                                  });
                                  navigate('/');
                                }}
                              >
                                <Lock className="h-4 w-4" />
                                {t('common.membershipRequired')}
                              </Button>
                            ) : (
                              <Button size="sm" className="bg-entegrator hover:bg-entegrator/90">
                                {t('auctions.viewDetails')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Teklif Modal */}
      <Dialog open={teklifModalOpen} onOpenChange={setTeklifModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('listings.sendProposal')}</DialogTitle>
            <DialogDescription>
              {selectedIlan?.baslik || t('listings.unnamedListing')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="teklifTutari">{t('listings.proposalAmount')} (₺) *</Label>
              <Input
                id="teklifTutari"
                type="number"
                value={teklifTutari}
                onChange={(e) => setTeklifTutari(e.target.value ? Number(e.target.value) : '')}
                placeholder="75000"
              />
              {selectedIlan && formatBudget(selectedIlan.butce_min, selectedIlan.butce_max) && (
                <p className="text-xs text-muted-foreground">
                  {t('listings.budget')}: {formatBudget(selectedIlan.butce_min, selectedIlan.butce_max)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="teklifMesaj">{t('listings.proposalMessage')}</Label>
              <Textarea
                id="teklifMesaj"
                value={teklifMesaj}
                onChange={(e) => setTeklifMesaj(e.target.value)}
                placeholder={t('listings.proposalMessagePlaceholder')}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTeklifModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={submitTeklif}
              disabled={submittingTeklif || !teklifTutari}
              className="bg-entegrator hover:bg-entegrator/90"
            >
              {submittingTeklif ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('common.processing')}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('listings.sendProposal')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
