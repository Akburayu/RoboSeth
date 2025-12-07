import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Star, 
  Users, 
  MapPin, 
  Briefcase, 
  Filter, 
  Search,
  ChevronDown,
  Building2,
  Award,
  Clock,
  Loader2,
  X,
  CreditCard,
  CheckCircle2,
  Eye,
  Phone,
  FileText,
  User,
  LogOut,
  Gavel,
  Lock
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { Textarea } from '@/components/ui/textarea';
import { IhaleTuruModal } from '@/components/ihale/IhaleTuruModal';
import { IhaleOlusturModal } from '@/components/ihale/IhaleOlusturModal';

type Entegrator = Database['public']['Tables']['entegrator']['Row'];

interface EntegratorRatings {
  kalite_avg: number;
  musteri_iliskisi_avg: number;
  surec_yonetimi_avg: number;
  rating_count: number;
}

interface RatingComment {
  kalite_puan: number;
  musteri_iliskisi_puan: number;
  surec_yonetimi_puan: number;
  yorum: string | null;
  created_at: string;
}

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

// Fixed cost for revealing contacts
const REVEAL_COST = 1;

// Demo data for guest mode
const DEMO_ENTEGRATORLER: Entegrator[] = [
  {
    id: 'demo-1',
    entegrator_adi: 'TechRobot Sistemleri',
    uzmanlik_alani: 'Ark Kaynağı, Punta Kaynağı, Robot Programlama',
    faaliyet_alanlari: 'Robot Programlama, Robot Devreye Alma, PLC Programlama',
    sektor: 'Otomotiv Ana Sanayi',
    tecrube: '5-10 yıl',
    kac_kisi: 25,
    konum: 'İstanbul',
    hizmet_verilen_iller: 'İstanbul, Bursa, Kocaeli',
    referans: 'Ford Otosan, Toyota Türkiye, Tofaş projelerinde aktif çalışmalar',
    puan: 4.8,
    email: null,
    belgesi1: null,
    belgesi2: null,
    belgesi3: null,
    created_at: null,
    entegrator_buyuklugu: 'orta',
    iletisim_sosyal_medya: null,
    user_id: null,
    yorumlar: null,
  },
  {
    id: 'demo-2',
    entegrator_adi: 'Otomasyon Pro',
    uzmanlik_alani: 'Makine/Tezgah Besleme, Paletleme, Al/Bırak (Pick&Place)',
    faaliyet_alanlari: 'Otomasyon İşleri, Robot Kurulum, Robot Montaj',
    sektor: 'Gıda',
    tecrube: '10+ yıl',
    kac_kisi: 45,
    konum: 'Bursa',
    hizmet_verilen_iller: 'Bursa, İstanbul, Ankara, Tüm Türkiye',
    referans: 'Ülker, Eti, Nestle paketleme hatları otomasyonu',
    puan: 4.5,
    email: null,
    belgesi1: null,
    belgesi2: null,
    belgesi3: null,
    created_at: null,
    entegrator_buyuklugu: 'buyuk',
    iletisim_sosyal_medya: null,
    user_id: null,
    yorumlar: null,
  },
  {
    id: 'demo-3',
    entegrator_adi: 'Endüstri 4.0 Çözümleri',
    uzmanlik_alani: 'Sealing, Boya, Montaj',
    faaliyet_alanlari: 'Elektrik İşleri, Otomasyon Ekipmanları, Robot Bakımı',
    sektor: 'Otomotiv Yan Sanayi (Tier 1)',
    tecrube: '3-5 yıl',
    kac_kisi: 12,
    konum: 'Kocaeli',
    hizmet_verilen_iller: 'Kocaeli, İstanbul, Sakarya',
    referans: 'Magna, Faurecia, Bosch yan sanayi projeleri',
    puan: 4.2,
    email: null,
    belgesi1: null,
    belgesi2: null,
    belgesi3: null,
    created_at: null,
    entegrator_buyuklugu: 'kucuk',
    iletisim_sosyal_medya: null,
    user_id: null,
    yorumlar: null,
  },
  {
    id: 'demo-4',
    entegrator_adi: 'Kaynak Teknolojileri A.Ş.',
    uzmanlik_alani: 'Ark Kaynağı, Punta Kaynağı',
    faaliyet_alanlari: 'Ark Kaynak Ekipmanı Devreye Alma, Ark Kaynak Kalitesi Çalışması, Timer Ayarı',
    sektor: 'Metal',
    tecrube: '10+ yıl',
    kac_kisi: 35,
    konum: 'Ankara',
    hizmet_verilen_iller: 'Ankara, Eskişehir, Konya, Tüm Türkiye',
    referans: 'ASELSAN, ROKETSAN, TAI savunma sanayi projeleri',
    puan: 4.9,
    email: null,
    belgesi1: null,
    belgesi2: null,
    belgesi3: null,
    created_at: null,
    entegrator_buyuklugu: 'orta',
    iletisim_sosyal_medya: null,
    user_id: null,
    yorumlar: null,
  },
  {
    id: 'demo-5',
    entegrator_adi: 'Smart Factory Systems',
    uzmanlik_alani: 'Kutulama, Paletleme, Vidalama',
    faaliyet_alanlari: 'Robot Programlama, Otomasyon İşleri, Yedek Parça Satışı',
    sektor: 'Hızlı Tüketim Ürünleri (temizlik malzemeleri, bebek bezi, vs.)',
    tecrube: '5-10 yıl',
    kac_kisi: 18,
    konum: 'İzmir',
    hizmet_verilen_iller: 'İzmir, Manisa, Denizli',
    referans: 'P&G, Unilever, Henkel üretim hatları',
    puan: 4.6,
    email: null,
    belgesi1: null,
    belgesi2: null,
    belgesi3: null,
    created_at: null,
    entegrator_buyuklugu: 'orta',
    iletisim_sosyal_medya: null,
    user_id: null,
    yorumlar: null,
  },
  {
    id: 'demo-6',
    entegrator_adi: 'RoboServis Türkiye',
    uzmanlik_alani: 'Robot Programlama, Robot Bakımı',
    faaliyet_alanlari: 'Mekanik Arıza Robot Servisi, Elektrik Arıza Robot Servisi, Robot Eğitimi',
    sektor: 'Otomotiv Yan Sanayi (Tier 2)',
    tecrube: '1-3 yıl',
    kac_kisi: 8,
    konum: 'Gaziantep',
    hizmet_verilen_iller: 'Gaziantep, Adana, Mersin, Kayseri',
    referans: 'Bölgesel tekstil ve metal işleme tesisleri',
    puan: 4.0,
    email: null,
    belgesi1: null,
    belgesi2: null,
    belgesi3: null,
    created_at: null,
    entegrator_buyuklugu: 'kucuk',
    iletisim_sosyal_medya: null,
    user_id: null,
    yorumlar: null,
  },
];

// Demo ratings for guest mode
const DEMO_RATINGS: Record<string, EntegratorRatings> = {
  'demo-1': { kalite_avg: 4.8, musteri_iliskisi_avg: 4.6, surec_yonetimi_avg: 4.7, rating_count: 12 },
  'demo-2': { kalite_avg: 4.5, musteri_iliskisi_avg: 4.3, surec_yonetimi_avg: 4.4, rating_count: 8 },
  'demo-3': { kalite_avg: 4.2, musteri_iliskisi_avg: 4.0, surec_yonetimi_avg: 4.1, rating_count: 5 },
  'demo-4': { kalite_avg: 4.9, musteri_iliskisi_avg: 4.8, surec_yonetimi_avg: 4.9, rating_count: 15 },
  'demo-5': { kalite_avg: 4.6, musteri_iliskisi_avg: 4.5, surec_yonetimi_avg: 4.4, rating_count: 9 },
  'demo-6': { kalite_avg: 4.0, musteri_iliskisi_avg: 3.9, surec_yonetimi_avg: 4.0, rating_count: 3 },
};

// Demo comments for guest mode
const DEMO_COMMENTS: Record<string, RatingComment[]> = {
  'demo-1': [
    { kalite_puan: 5, musteri_iliskisi_puan: 5, surec_yonetimi_puan: 5, yorum: 'Mükemmel bir ekip. Projemizi zamanında ve bütçe dahilinde tamamladılar.', created_at: '2024-11-15T10:30:00Z' },
    { kalite_puan: 5, musteri_iliskisi_puan: 4, surec_yonetimi_puan: 5, yorum: 'Robot programlama konusunda çok tecrübeliler. Tavsiye ederim.', created_at: '2024-10-20T14:00:00Z' },
    { kalite_puan: 4, musteri_iliskisi_puan: 5, surec_yonetimi_puan: 4, yorum: 'İletişimleri çok iyi, sorunları hızlı çözdüler.', created_at: '2024-09-05T09:15:00Z' },
  ],
  'demo-2': [
    { kalite_puan: 5, musteri_iliskisi_puan: 4, surec_yonetimi_puan: 5, yorum: 'Paketleme hattımızı başarıyla otomatize ettiler.', created_at: '2024-11-01T16:45:00Z' },
    { kalite_puan: 4, musteri_iliskisi_puan: 4, surec_yonetimi_puan: 4, yorum: 'Güvenilir ve profesyonel bir firma.', created_at: '2024-08-22T11:20:00Z' },
  ],
  'demo-4': [
    { kalite_puan: 5, musteri_iliskisi_puan: 5, surec_yonetimi_puan: 5, yorum: 'Savunma sanayi standartlarında kaliteli iş çıkarıyorlar.', created_at: '2024-11-10T08:00:00Z' },
    { kalite_puan: 5, musteri_iliskisi_puan: 5, surec_yonetimi_puan: 5, yorum: 'Kaynak kalitesi mükemmel. Her zaman tercih ederiz.', created_at: '2024-10-15T13:30:00Z' },
    { kalite_puan: 5, musteri_iliskisi_puan: 4, surec_yonetimi_puan: 5, yorum: 'Teknik bilgileri çok güçlü.', created_at: '2024-09-28T10:00:00Z' },
  ],
  'demo-5': [
    { kalite_puan: 5, musteri_iliskisi_puan: 5, surec_yonetimi_puan: 4, yorum: 'Kutulama sistemimizi yenilediler, verimlilik %40 arttı.', created_at: '2024-10-30T15:00:00Z' },
  ],
};

// Completely mask name - show only asterisks
function maskName(name: string): string {
  if (!name) return '******';
  return '******';
}

interface RevealedContact {
  entegrator_adi: string;
  iletisim: string | null;
  konum: string | null;
}

interface RatingFormData {
  kalite: number;
  musteriIliskisi: number;
  surecYonetimi: number;
  yorum: string;
}

interface Filters {
  search: string;
  faaliyetAlanlari: string[];
  uzmanlikAlanlari: string[];
  sektorler: string[];
  iller: string[];
  tecrubeler: string[];
  minKisi: number;
  maxKisi: number;
  minPuan: number;
}

const initialFilters: Filters = {
  search: '',
  faaliyetAlanlari: [],
  uzmanlikAlanlari: [],
  sektorler: [],
  iller: [],
  tecrubeler: [],
  minKisi: 0,
  maxKisi: 500,
  minPuan: 0,
};

export default function FirmaDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [entegratorler, setEntegratorler] = useState<Entegrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Credit and reveal state
  const [firmaCredits, setFirmaCredits] = useState<number>(0);
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [selectedEntegrator, setSelectedEntegrator] = useState<Entegrator | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [revealedContactInfo, setRevealedContactInfo] = useState<RevealedContact | null>(null);
  
  // Rating system state
  const [entegratorRatings, setEntegratorRatings] = useState<Record<string, EntegratorRatings>>({});
  const [firmaId, setFirmaId] = useState<string | null>(null);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingEntegrator, setRatingEntegrator] = useState<Entegrator | null>(null);
  const [existingRating, setExistingRating] = useState<{ kalite: number; musteriIliskisi: number; surecYonetimi: number; yorum: string } | null>(null);
  const [ratingForm, setRatingForm] = useState<RatingFormData>({ kalite: 0, musteriIliskisi: 0, surecYonetimi: 0, yorum: '' });
  const [submittingRating, setSubmittingRating] = useState(false);
  
  // Comments modal state
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [commentsEntegrator, setCommentsEntegrator] = useState<Entegrator | null>(null);
  const [entegratorComments, setEntegratorComments] = useState<Record<string, RatingComment[]>>({});

  // İhale modal state
  const [ihaleTuruModalOpen, setIhaleTuruModalOpen] = useState(false);
  const [ihaleOlusturModalOpen, setIhaleOlusturModalOpen] = useState(false);
  const [selectedIhaleTuru, setSelectedIhaleTuru] = useState<string>('');

  // Kredi satın alma modal state
  const [krediModalOpen, setKrediModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    // Guest mode - use demo data only, no database access
    if (isGuestMode) {
      setLoading(true);
      // Use demo data for guest mode
      setEntegratorler(DEMO_ENTEGRATORLER);
      setEntegratorRatings(DEMO_RATINGS);
      setEntegratorComments(DEMO_COMMENTS);
      setFirmaCredits(5); // Demo credits
      setLoading(false);
      return;
    }
    
    if (!user) {
      navigate('/');
      return;
    }

    if (userRole && userRole !== 'firma') {
      toast({
        title: t('auth.accessDenied'),
        description: t('auth.firmaOnly'),
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    fetchEntegratorler();
    fetchFirmaCredits();
    fetchRevealedContacts();
    fetchFirmaId();
    fetchAllRatings();
  }, [user, userRole, authLoading, navigate, toast, isGuestMode]);

  const fetchEntegratorler = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entegrator')
        .select('*')
        .order('puan', { ascending: false });

      if (error) throw error;
      setEntegratorler(data || []);
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

  const fetchFirmaCredits = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('firma')
        .select('kredi')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setFirmaCredits(data?.kredi || 0);
    } catch (error: any) {
      console.error('Error fetching credits:', error);
    }
  };

  const fetchRevealedContacts = async () => {
    if (!user) return;
    try {
      // Get firma ID first
      const { data: firma } = await supabase
        .from('firma')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!firma) return;

      const { data, error } = await supabase
        .from('revealed_contacts')
        .select('entegrator_id')
        .eq('firma_id', firma.id);

      if (error) throw error;
      
      const revealedIds = new Set(data?.map(r => r.entegrator_id) || []);
      setRevealedContacts(revealedIds);
    } catch (error: any) {
      console.error('Error fetching revealed contacts:', error);
    }
  };

  const fetchFirmaId = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('firma')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (data) setFirmaId(data.id);
    } catch (error: any) {
      console.error('Error fetching firma ID:', error);
    }
  };

  const fetchAllRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('firma_ratings')
        .select('entegrator_id, kalite_puan, musteri_iliskisi_puan, surec_yonetimi_puan, yorum, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data) return;

      // Calculate averages per entegrator and collect comments
      const ratingsMap: Record<string, { kalite: number[]; musteri: number[]; surec: number[] }> = {};
      const commentsMap: Record<string, RatingComment[]> = {};
      
      data.forEach((r) => {
        if (!ratingsMap[r.entegrator_id]) {
          ratingsMap[r.entegrator_id] = { kalite: [], musteri: [], surec: [] };
          commentsMap[r.entegrator_id] = [];
        }
        ratingsMap[r.entegrator_id].kalite.push(r.kalite_puan);
        ratingsMap[r.entegrator_id].musteri.push(r.musteri_iliskisi_puan);
        ratingsMap[r.entegrator_id].surec.push(r.surec_yonetimi_puan);
        
        commentsMap[r.entegrator_id].push({
          kalite_puan: r.kalite_puan,
          musteri_iliskisi_puan: r.musteri_iliskisi_puan,
          surec_yonetimi_puan: r.surec_yonetimi_puan,
          yorum: r.yorum,
          created_at: r.created_at,
        });
      });

      const calculated: Record<string, EntegratorRatings> = {};
      Object.entries(ratingsMap).forEach(([id, scores]) => {
        calculated[id] = {
          kalite_avg: scores.kalite.reduce((a, b) => a + b, 0) / scores.kalite.length,
          musteri_iliskisi_avg: scores.musteri.reduce((a, b) => a + b, 0) / scores.musteri.length,
          surec_yonetimi_avg: scores.surec.reduce((a, b) => a + b, 0) / scores.surec.length,
          rating_count: scores.kalite.length,
        };
      });

      setEntegratorRatings(calculated);
      setEntegratorComments(commentsMap);
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
    }
  };

  const openCommentsModal = (entegrator: Entegrator) => {
    setCommentsEntegrator(entegrator);
    setCommentsModalOpen(true);
  };

  const openRatingModal = async (entegrator: Entegrator) => {
    setRatingEntegrator(entegrator);
    setRatingForm({ kalite: 0, musteriIliskisi: 0, surecYonetimi: 0, yorum: '' });
    setExistingRating(null);

    // Check if there's an existing rating
    if (firmaId) {
      const { data } = await supabase
        .from('firma_ratings')
        .select('kalite_puan, musteri_iliskisi_puan, surec_yonetimi_puan, yorum')
        .eq('firma_id', firmaId)
        .eq('entegrator_id', entegrator.id)
        .maybeSingle();

      if (data) {
        setExistingRating({
          kalite: data.kalite_puan,
          musteriIliskisi: data.musteri_iliskisi_puan,
          surecYonetimi: data.surec_yonetimi_puan,
          yorum: data.yorum || '',
        });
        setRatingForm({
          kalite: data.kalite_puan,
          musteriIliskisi: data.musteri_iliskisi_puan,
          surecYonetimi: data.surec_yonetimi_puan,
          yorum: data.yorum || '',
        });
      }
    }

    setRatingModalOpen(true);
  };

  const submitRating = async () => {
    if (!firmaId || !ratingEntegrator) return;
    if (ratingForm.kalite === 0 || ratingForm.musteriIliskisi === 0 || ratingForm.surecYonetimi === 0) {
      toast({
        title: t('rating.incompleteRating'),
        description: t('rating.rateAllCategories'),
        variant: 'destructive',
      });
      return;
    }

    setSubmittingRating(true);
    try {
      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('firma_ratings')
          .update({
            kalite_puan: ratingForm.kalite,
            musteri_iliskisi_puan: ratingForm.musteriIliskisi,
            surec_yonetimi_puan: ratingForm.surecYonetimi,
            yorum: ratingForm.yorum || null,
          })
          .eq('firma_id', firmaId)
          .eq('entegrator_id', ratingEntegrator.id);

        if (error) throw error;
        toast({ title: t('common.success'), description: t('rating.ratingUpdated') });
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('firma_ratings')
          .insert({
            firma_id: firmaId,
            entegrator_id: ratingEntegrator.id,
            kalite_puan: ratingForm.kalite,
            musteri_iliskisi_puan: ratingForm.musteriIliskisi,
            surec_yonetimi_puan: ratingForm.surecYonetimi,
            yorum: ratingForm.yorum || null,
          });

        if (error) throw error;
        toast({ title: t('common.success'), description: t('rating.ratingSaved') });
      }

      setRatingModalOpen(false);
      fetchAllRatings();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingRating(false);
    }
  };

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-1">
      <Label className="text-sm">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const RatingDisplay = ({ avg, label }: { avg: number; label: string }) => (
    <div className="flex items-center gap-1" title={label}>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="text-xs font-medium">{avg.toFixed(1)}</span>
    </div>
  );

  const handleRevealClick = (entegrator: Entegrator) => {
    // If already revealed, show contact info directly
    if (revealedContacts.has(entegrator.id)) {
      setRevealedContactInfo({
        entegrator_adi: entegrator.entegrator_adi,
        iletisim: entegrator.iletisim_sosyal_medya,
        konum: entegrator.konum
      });
      setContactModalOpen(true);
      return;
    }
    
    // Otherwise show confirm modal
    setSelectedEntegrator(entegrator);
    setRevealModalOpen(true);
  };

  const confirmReveal = async () => {
    if (!selectedEntegrator) return;
    
    setRevealing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: t('contact.sessionError'),
          description: t('contact.pleaseLoginAgain'),
          variant: 'destructive',
        });
        return;
      }

      const response = await supabase.functions.invoke('reveal-contact', {
        body: { entegrator_id: selectedEntegrator.id }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      if (result.error) {
        if (result.error === 'Yetersiz kredi') {
          toast({
            title: t('credits.insufficientCredits'),
            description: t('credits.insufficientCreditsDesc', { required: result.required, available: result.available }),
            variant: 'destructive',
          });
        } else {
          throw new Error(result.error);
        }
        return;
      }

      // Success!
      setRevealedContacts(prev => new Set([...prev, selectedEntegrator.id]));
      setFirmaCredits(result.remaining_credits);
      setRevealModalOpen(false);
      
      // Show the contact info
      setRevealedContactInfo(result.contact);
      setContactModalOpen(true);

      if (!result.already_revealed) {
        toast({
          title: t('credits.contactRevealed'),
          description: t('credits.creditSpent', { cost: result.cost, remaining: result.remaining_credits }),
        });
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRevealing(false);
    }
  };

  const getRevealCost = (): number => {
    return REVEAL_COST;
  };

  const toggleFilter = (
    filterKey: keyof Pick<Filters, 'faaliyetAlanlari' | 'uzmanlikAlanlari' | 'sektorler' | 'iller' | 'tecrubeler'>,
    value: string
  ) => {
    setFilters((prev) => {
      const current = prev[filterKey];
      if (current.includes(value)) {
        return { ...prev, [filterKey]: current.filter((v) => v !== value) };
      }
      return { ...prev, [filterKey]: [...current, value] };
    });
  };


  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.faaliyetAlanlari.length > 0) count++;
    if (filters.uzmanlikAlanlari.length > 0) count++;
    if (filters.sektorler.length > 0) count++;
    if (filters.iller.length > 0) count++;
    if (filters.tecrubeler.length > 0) count++;
    if (filters.tecrubeler.length > 0) count++;
    if (filters.minPuan > 0) count++;
    if (filters.minKisi > 0 || filters.maxKisi < 500) count++;
    return count;
  }, [filters]);

  const filteredEntegratorler = useMemo(() => {
    return entegratorler.filter((e) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = e.entegrator_adi?.toLowerCase().includes(searchLower);
        const uzmanlikMatch = e.uzmanlik_alani?.toLowerCase().includes(searchLower);
        const faaliyetMatch = e.faaliyet_alanlari?.toLowerCase().includes(searchLower);
        if (!nameMatch && !uzmanlikMatch && !faaliyetMatch) return false;
      }

      // Faaliyet alanları filter
      if (filters.faaliyetAlanlari.length > 0) {
        const eAlanlar = e.faaliyet_alanlari?.split(', ') || [];
        if (!filters.faaliyetAlanlari.some((f) => eAlanlar.includes(f))) return false;
      }

      // Uzmanlık alanları filter
      if (filters.uzmanlikAlanlari.length > 0) {
        const eUzmanlik = e.uzmanlik_alani?.split(', ') || [];
        if (!filters.uzmanlikAlanlari.some((u) => eUzmanlik.includes(u))) return false;
      }

      // Sektör filter
      if (filters.sektorler.length > 0) {
        if (!e.sektor || !filters.sektorler.includes(e.sektor)) return false;
      }

      // İller filter
      if (filters.iller.length > 0) {
        const eIller = e.hizmet_verilen_iller?.split(', ') || [];
        if (!filters.iller.some((il) => eIller.includes(il))) return false;
      }

      // Tecrübe filter
      if (filters.tecrubeler.length > 0) {
        if (!e.tecrube || !filters.tecrubeler.includes(e.tecrube)) return false;
      }

      // Kişi sayısı filter
      if (filters.minKisi > 0 || filters.maxKisi < 500) {
        const kisi = e.kac_kisi || 0;
        if (kisi < filters.minKisi || kisi > filters.maxKisi) return false;
      }

      // Puan filter
      if (filters.minPuan > 0) {
        if ((e.puan || 0) < filters.minPuan) return false;
      }

      return true;
    });
  }, [entegratorler, filters]);

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      {children}
    </div>
  );

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Faaliyet Alanları */}
      <FilterSection title={t('filters.activityAreas')}>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {FAALIYET_ALANLARI.map((alan) => (
            <label key={alan} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.faaliyetAlanlari.includes(alan)}
                onCheckedChange={() => toggleFilter('faaliyetAlanlari', alan)}
              />
              <span className="text-sm">{alan}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Uzmanlık Alanları */}
      <FilterSection title={t('filters.expertiseAreas')}>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {UZMANLIK_ALANLARI.map((alan) => (
            <label key={alan} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.uzmanlikAlanlari.includes(alan)}
                onCheckedChange={() => toggleFilter('uzmanlikAlanlari', alan)}
              />
              <span className="text-sm">{alan}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Sektör */}
      <FilterSection title={t('filters.sector')}>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {SEKTORLER.map((sektor) => (
            <label key={sektor} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.sektorler.includes(sektor)}
                onCheckedChange={() => toggleFilter('sektorler', sektor)}
              />
              <span className="text-sm">{sektor}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* İller */}
      <FilterSection title={t('filters.serviceProvinces')}>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {ILLER.map((il) => (
            <label key={il} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.iller.includes(il)}
                onCheckedChange={() => toggleFilter('iller', il)}
              />
              <span className="text-sm">{il}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Tecrübe */}
      <FilterSection title={t('filters.experience')}>
        <div className="grid grid-cols-1 gap-2">
          {TECRUBE_OPTIONS.map((tecrube) => (
            <label key={tecrube} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.tecrubeler.includes(tecrube)}
                onCheckedChange={() => toggleFilter('tecrubeler', tecrube)}
              />
              <span className="text-sm">{tecrube}</span>
            </label>
          ))}
        </div>
      </FilterSection>


      {/* Minimum Puan */}
      <FilterSection title={`${t('filters.minScore')}: ${filters.minPuan}`}>
        <Slider
          value={[filters.minPuan]}
          onValueChange={(v) => setFilters((prev) => ({ ...prev, minPuan: v[0] }))}
          max={5}
          step={0.5}
          className="mt-2"
        />
      </FilterSection>

      {/* Çalışan Sayısı */}
      <FilterSection title={`${t('filters.employeeCount')}: ${filters.minKisi} - ${filters.maxKisi}`}>
        <Slider
          value={[filters.minKisi, filters.maxKisi]}
          onValueChange={(v) => setFilters((prev) => ({ ...prev, minKisi: v[0], maxKisi: v[1] }))}
          max={500}
          step={10}
          className="mt-2"
        />
      </FilterSection>

      {/* Clear Filters */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        <X className="h-4 w-4 mr-2" />
        {t('common.clearFilters')}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Guest Mode Banner - Cannot be dismissed */}
      {isGuestMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-lg">Demo Modu</span>
                <span className="hidden sm:inline text-white/90 ml-2">- Bu sayfa sadece tanıtım amaçlıdır. Gerçek veriler gösterilmemektedir.</span>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => navigate('/')}
              className="bg-white text-amber-600 hover:bg-white/90 font-semibold shadow-md"
            >
              Üye Ol ve Gerçek Verileri Gör
            </Button>
          </div>
        </div>
      )}

      {/* Header - with top padding for fixed guest banner */}
      <header className={`border-b bg-card ${isGuestMode ? 'mt-14' : ''}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-firma">{t('dashboard.firmaTitle')}</h1>
                {isGuestMode && (
                  <Badge variant="outline" className="text-amber-600 border-amber-400 bg-amber-50">
                    Demo
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{t('dashboard.firmaSubtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              {!isGuestMode && (
                <>
                  <NotificationBell />
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/firma/profile')}
                    title="Profil"
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
                    title="Çıkış Yap"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/firma/ilanlarim')}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    İlanlarım
                  </Button>
                  <Button 
                    onClick={() => navigate('/firma/ilan-olustur')}
                    className="bg-firma hover:bg-firma/90 gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    İlan Oluştur
                  </Button>
                  <Button 
                    onClick={() => setIhaleTuruModalOpen(true)}
                    variant="outline"
                    className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Gavel className="h-4 w-4" />
                    İhale Başlat
                  </Button>
                  <div className="flex items-center gap-2 px-4 py-2 bg-firma/10 rounded-lg border border-firma/20">
                    <CreditCard className="h-5 w-5 text-firma" />
                    <span className="font-semibold text-firma">{firmaCredits}</span>
                    <span className="text-sm text-muted-foreground">Kredi</span>
                  </div>
                  <Button 
                    onClick={() => setKrediModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Kredi Satın Al
                  </Button>
                </>
              )}
              {isGuestMode && (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border opacity-60">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-muted-foreground">{firmaCredits}</span>
                    <span className="text-sm text-muted-foreground">Demo Kredi</span>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    Ana Sayfa
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <Card className="sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Filtreler
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary">{activeFilterCount}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <FiltersContent />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search and Mobile Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Entegratör ara..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              {/* Mobile Filter Button */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2">
                    <Filter className="h-4 w-4" />
                    Filtre
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filtreler
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredEntegratorler.length} entegratör bulundu
            </div>

            {/* Entegrator Cards */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-firma" />
              </div>
            ) : filteredEntegratorler.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Arama kriterlerinize uygun entegratör bulunamadı.</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Filtreleri temizle
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredEntegratorler.map((entegrator) => (
                  <Card 
                    key={entegrator.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer border-firma/10 hover:border-firma/30"
                  >
                    <CardContent className="p-5">
                      {/* Header with name and ratings - show full name in demo mode */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-entegrator/20 to-entegrator/40 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-entegrator" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {isGuestMode ? entegrator.entegrator_adi : maskName(entegrator.entegrator_adi)}
                            </h3>
                            {isGuestMode && (
                              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Demo</span>
                            )}
                          </div>
                        </div>
                        {/* Three category ratings */}
                        <div className="flex flex-col gap-1 text-right">
                          {entegratorRatings[entegrator.id] ? (
                            <>
                              <div className="flex items-center gap-1 justify-end" title="Kalite">
                                <span className="text-xs text-muted-foreground">Kalite:</span>
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-medium">{entegratorRatings[entegrator.id].kalite_avg.toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-1 justify-end" title="Müşteri İlişkisi">
                                <span className="text-xs text-muted-foreground">M.İlişki:</span>
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-medium">{entegratorRatings[entegrator.id].musteri_iliskisi_avg.toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-1 justify-end" title="Süreç Yönetimi">
                                <span className="text-xs text-muted-foreground">Süreç:</span>
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-medium">{entegratorRatings[entegrator.id].surec_yonetimi_avg.toFixed(1)}</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Henüz değerlendirme yok</span>
                          )}
                        </div>
                      </div>

                      {/* Uzmanlık */}
                      {entegrator.uzmanlik_alani && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Award className="h-3 w-3" />
                            Uzmanlık
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {entegrator.uzmanlik_alani.split(', ').slice(0, 3).map((u, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {u}
                              </Badge>
                            ))}
                            {entegrator.uzmanlik_alani.split(', ').length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{entegrator.uzmanlik_alani.split(', ').length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Info Row */}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                        {entegrator.tecrube && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entegrator.tecrube}
                          </div>
                        )}
                        {entegrator.kac_kisi && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {entegrator.kac_kisi} kişi
                          </div>
                        )}
                        {entegrator.konum && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {entegrator.konum}
                          </div>
                        )}
                      </div>

                      {/* Referans - truncated */}
                      {entegrator.referans && (
                        <p className="text-xs text-muted-foreground line-clamp-2 border-t pt-3 mt-3">
                          {entegrator.referans}
                        </p>
                      )}

                      {/* CTA Buttons */}
                      <div className="flex gap-2 mt-4">
                        {isGuestMode ? (
                          <>
                            <Button 
                              className="flex-1 gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                              size="sm"
                              onClick={() => navigate('/')}
                            >
                              <Lock className="h-4 w-4" />
                              Üye Ol ve İletişimi Gör
                            </Button>
                            {entegratorRatings[entegrator.id] && entegratorRatings[entegrator.id].rating_count > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCommentsModal(entegrator)}
                                title="Demo Yorumlar"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="text-xs ml-1">{entegratorRatings[entegrator.id].rating_count}</span>
                              </Button>
                            )}
                          </>
                        ) : (
                          <>
                            <Button 
                              className={`flex-1 gap-2 ${
                                revealedContacts.has(entegrator.id)
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : 'bg-firma hover:bg-firma/90'
                              }`}
                              size="sm"
                              onClick={() => handleRevealClick(entegrator)}
                            >
                              {revealedContacts.has(entegrator.id) ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  İletişimi Görüntüle
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4" />
                                  İletişimi Gör ({getRevealCost()} Kredi)
                                </>
                              )}
                            </Button>
                            {entegratorRatings[entegrator.id] && entegratorRatings[entegrator.id].rating_count > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openCommentsModal(entegrator)}
                                title="Yorumları Gör"
                              >
                                <FileText className="h-4 w-4" />
                                <span className="text-xs ml-1">{entegratorRatings[entegrator.id].rating_count}</span>
                              </Button>
                            )}
                            {revealedContacts.has(entegrator.id) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openRatingModal(entegrator)}
                                title="Değerlendir"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Reveal Confirmation Modal */}
      <Dialog open={revealModalOpen} onOpenChange={setRevealModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İletişim Bilgisini Aç</DialogTitle>
            <DialogDescription>
              Bu entegratörün iletişim bilgilerini açmak için{' '}
              <span className="font-bold text-firma">
                {selectedEntegrator ? getRevealCost() : 0} kredi
              </span>{' '}
              harcayacaksınız.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Mevcut Krediniz</p>
                <p className="text-2xl font-bold text-firma">{firmaCredits}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">İşlem Sonrası</p>
                <p className="text-2xl font-bold">
                  {selectedEntegrator 
                    ? firmaCredits - getRevealCost()
                    : firmaCredits
                  }
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevealModalOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={confirmReveal} 
              disabled={revealing || (selectedEntegrator && firmaCredits < getRevealCost())}
              className="bg-firma hover:bg-firma/90"
            >
              {revealing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  İşleniyor...
                </>
              ) : (
                'Onayla'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Info Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-600" />
              İletişim Bilgileri
            </DialogTitle>
          </DialogHeader>
          
          {revealedContactInfo && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Entegratör</p>
                <p className="font-semibold text-lg">{revealedContactInfo.entegrator_adi}</p>
              </div>
              
              {revealedContactInfo.iletisim && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">İletişim / Sosyal Medya</p>
                  <p className="font-medium">{revealedContactInfo.iletisim}</p>
                </div>
              )}
              
              {revealedContactInfo.konum && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Konum</p>
                  <p className="font-medium">{revealedContactInfo.konum}</p>
                </div>
              )}
              
              {!revealedContactInfo.iletisim && !revealedContactInfo.konum && (
                <p className="text-center text-muted-foreground py-4">
                  Bu entegratör henüz iletişim bilgisi eklememiş.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setContactModalOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Modal - Only visible to Firma users */}
      <Dialog open={ratingModalOpen} onOpenChange={setRatingModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Entegratör Değerlendirmesi
            </DialogTitle>
            <DialogDescription>
              Bu değerlendirme sadece diğer firmalara görünür. Entegratör bu puanlamayı göremez.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <StarRating
              label="Kalite"
              value={ratingForm.kalite}
              onChange={(v) => setRatingForm(prev => ({ ...prev, kalite: v }))}
            />
            <StarRating
              label="Müşteri İlişkisi"
              value={ratingForm.musteriIliskisi}
              onChange={(v) => setRatingForm(prev => ({ ...prev, musteriIliskisi: v }))}
            />
            <StarRating
              label="Süreç Yönetimi"
              value={ratingForm.surecYonetimi}
              onChange={(v) => setRatingForm(prev => ({ ...prev, surecYonetimi: v }))}
            />
            
            <div className="space-y-2">
              <Label>Yorum (Opsiyonel)</Label>
              <Textarea
                placeholder="Deneyiminizi paylaşın..."
                value={ratingForm.yorum}
                onChange={(e) => setRatingForm(prev => ({ ...prev, yorum: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRatingModalOpen(false)}>
              İptal
            </Button>
            <Button 
              onClick={submitRating}
              disabled={submittingRating}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {submittingRating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Kaydediliyor...
                </>
              ) : existingRating ? (
                'Güncelle'
              ) : (
                'Değerlendir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comments Modal - View all ratings/comments for an entegrator */}
      <Dialog open={commentsModalOpen} onOpenChange={setCommentsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Firma Değerlendirmeleri
            </DialogTitle>
            <DialogDescription>
              Bu entegratör hakkında diğer firmaların yaptığı değerlendirmeler
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {commentsEntegrator && entegratorComments[commentsEntegrator.id]?.length > 0 ? (
              entegratorComments[commentsEntegrator.id].map((comment, index) => (
                <div key={index} className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Kalite:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= comment.kalite_puan ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">M.İlişki:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= comment.musteri_iliskisi_puan ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Süreç:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= comment.surec_yonetimi_puan ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {comment.yorum && (
                    <p className="text-sm text-foreground">{comment.yorum}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Henüz değerlendirme yapılmamış.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setCommentsModalOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* İhale Türü Seçim Modal */}
      <IhaleTuruModal 
        open={ihaleTuruModalOpen}
        onOpenChange={setIhaleTuruModalOpen}
        onSelect={(type) => {
          setSelectedIhaleTuru(type);
          setIhaleTuruModalOpen(false);
          setIhaleOlusturModalOpen(true);
        }}
      />

      {/* İhale Oluştur Modal */}
      <IhaleOlusturModal
        open={ihaleOlusturModalOpen}
        onOpenChange={setIhaleOlusturModalOpen}
        ihaleTuru={selectedIhaleTuru}
        firmaId={firmaId || ''}
        onSuccess={() => {
          toast({
            title: "Başarılı",
            description: "İhale başarıyla oluşturuldu.",
          });
        }}
        onBack={() => {
          setIhaleOlusturModalOpen(false);
          setIhaleTuruModalOpen(true);
        }}
      />

      {/* Kredi Satın Alma Modal */}
      <Dialog open={krediModalOpen} onOpenChange={setKrediModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Kredi Satın Al</DialogTitle>
            <DialogDescription>
              İhtiyacınıza uygun kredi paketini seçin
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {/* Kobi Paketi */}
            <Card className="border-2 hover:border-firma transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-firma/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-firma/20 transition-colors">
                  <Building2 className="h-6 w-6 text-firma" />
                </div>
                <CardTitle className="text-lg">Kobi Paketi</CardTitle>
                <p className="text-sm text-muted-foreground">Küçük işletmeler için</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-3xl font-bold text-firma">€650</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">3 Kredi</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 3 entegratör iletişim bilgisi</li>
                  <li>• Standart destek</li>
                </ul>
                <Button 
                  className="w-full bg-firma hover:bg-firma/90"
                  onClick={() => {
                    toast({
                      title: "Satın Alma",
                      description: "Ödeme sistemi yakında aktif olacak.",
                    });
                  }}
                >
                  Satın Al
                </Button>
              </CardContent>
            </Card>

            {/* Büyük Paket */}
            <Card className="border-2 border-primary hover:border-primary/80 transition-colors cursor-pointer group relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">En Popüler</Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Büyük Paket</CardTitle>
                <p className="text-sm text-muted-foreground">Orta ölçekli işletmeler için</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-3xl font-bold text-primary">€1,800</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">10 Kredi</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 10 entegratör iletişim bilgisi</li>
                  <li>• Öncelikli destek</li>
                  <li>• %10 tasarruf</li>
                </ul>
                <Button 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Satın Alma",
                      description: "Ödeme sistemi yakında aktif olacak.",
                    });
                  }}
                >
                  Satın Al
                </Button>
              </CardContent>
            </Card>

            {/* Global Paket */}
            <Card className="border-2 hover:border-amber-500 transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-amber-500/20 transition-colors">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <CardTitle className="text-lg">Global Paket</CardTitle>
                <p className="text-sm text-muted-foreground">Büyük işletmeler için</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-3xl font-bold text-amber-500">€3,000</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">20 Kredi</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 20 entegratör iletişim bilgisi</li>
                  <li>• VIP destek</li>
                  <li>• %23 tasarruf</li>
                </ul>
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => {
                    toast({
                      title: "Satın Alma",
                      description: "Ödeme sistemi yakında aktif olacak.",
                    });
                  }}
                >
                  Satın Al
                </Button>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setKrediModalOpen(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
