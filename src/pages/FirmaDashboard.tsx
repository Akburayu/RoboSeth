import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useMatches } from '@/hooks/useMatches';
import NotificationBell from '@/components/NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import { runAIMatch, type AIMatchResult } from '@/lib/aiMatcher';
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
  Lock,
  MessageSquare,
  SlidersHorizontal,
  Server,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { Textarea } from '@/components/ui/textarea';
import { IhaleTuruModal } from '@/components/ihale/IhaleTuruModal';
import { IhaleOlusturModal } from '@/components/ihale/IhaleOlusturModal';
import { mockEntegratorler } from '@/lib/mockData';

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
  author?: string;
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
  const { matches, createMatch } = useMatches(user?.id, 'firma');
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
  
  // Quick Comment State for the Comments Modal
  const [quickComment, setQuickComment] = useState('');
  const [submittingQuickComment, setSubmittingQuickComment] = useState(false);
  const [showQuickRating, setShowQuickRating] = useState(false);
  const [quickRatingForm, setQuickRatingForm] = useState<RatingFormData>({ kalite: 0, musteriIliskisi: 0, surecYonetimi: 0, yorum: '' });

  const [submittingRating, setSubmittingRating] = useState(false);

  // AI Smart Match state
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AIMatchResult[] | null>(null);
  
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
    
    // Allow guest mode without authentication
    if (isGuestMode) {
      fetchEntegratorler();
      fetchAllRatings();
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
      // Mock veriden yükleme
      const sortedMock = [...mockEntegratorler].sort((a, b) => (b.puan || 0) - (a.puan || 0));
      setEntegratorler(sortedMock as Entegrator[]);
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
      // Mock verilerden detaylı puanları hesapla — direkt yorum_listesi'nden
      const calculated: Record<string, EntegratorRatings> = {};
      const commentsMap: Record<string, RatingComment[]> = {};
      
      mockEntegratorler.forEach((e) => {
        const yorumlar = (e as any).yorum_listesi || [];
        commentsMap[e.id] = yorumlar;

        if (yorumlar.length > 0) {
          let totalK = 0, totalM = 0, totalS = 0;
          yorumlar.forEach((y: RatingComment) => {
            totalK += y.kalite_puan;
            totalM += y.musteri_iliskisi_puan;
            totalS += y.surec_yonetimi_puan;
          });
          const count = yorumlar.length;
          calculated[e.id] = {
            kalite_avg: Number((totalK / count).toFixed(1)),
            musteri_iliskisi_avg: Number((totalM / count).toFixed(1)),
            surec_yonetimi_avg: Number((totalS / count).toFixed(1)),
            rating_count: count,
          };
        }
      });

      setEntegratorRatings(calculated);
      setEntegratorComments(commentsMap);
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
    }
  };

  const openCommentsModal = async (entegrator: Entegrator) => {
    setCommentsEntegrator(entegrator);
    setQuickComment('');
    setShowQuickRating(false);
    setQuickRatingForm({ kalite: 0, musteriIliskisi: 0, surecYonetimi: 0, yorum: '' });

    if (firmaId) {
      const { data } = await supabase
        .from('firma_ratings')
        .select('yorum, kalite_puan, musteri_iliskisi_puan, surec_yonetimi_puan')
        .eq('firma_id', firmaId)
        .eq('entegrator_id', entegrator.id)
        .maybeSingle();

      if (data) {
        // They already have a rating
        setQuickComment(data.yorum || '');
      } else {
        // No rating exists, we will need to show rating stars when they try to comment
        setShowQuickRating(true);
      }
    }
    
    setCommentsModalOpen(true);
  };

  const submitQuickComment = async () => {
    if (!firmaId || !commentsEntegrator) return;
    if (!quickComment.trim()) {
      toast({ title: t('common.error') || 'Hata', description: 'Lütfen bir yorum yazın.', variant: 'destructive' });
      return;
    }

    // If they have to rate (meaning no existing rating), validate stars
    if (showQuickRating) {
      if (quickRatingForm.kalite === 0 || quickRatingForm.musteriIliskisi === 0 || quickRatingForm.surecYonetimi === 0) {
        toast({ title: t('rating.incompleteRating') || 'Eksik', description: 'Yorum yapabilmek için lütfen yıldızlarla puanlama yapın.', variant: 'destructive' });
        return;
      }
    }

    setSubmittingQuickComment(true);
    try {
      const { data: existing } = await supabase
        .from('firma_ratings')
        .select('id')
        .eq('firma_id', firmaId)
        .eq('entegrator_id', commentsEntegrator.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('firma_ratings')
          .update({ yorum: quickComment })
          .eq('firma_id', firmaId)
          .eq('entegrator_id', commentsEntegrator.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('firma_ratings')
          .insert({
            firma_id: firmaId,
            entegrator_id: commentsEntegrator.id,
            kalite_puan: quickRatingForm.kalite,
            musteri_iliskisi_puan: quickRatingForm.musteriIliskisi,
            surec_yonetimi_puan: quickRatingForm.surecYonetimi,
            yorum: quickComment,
          });
        if (error) throw error;
        setShowQuickRating(false);
      }
      
      toast({ title: t('common.success') || 'Başarılı', description: 'Yorumunuz başarıyla eklendi.' });
      fetchAllRatings();
      setQuickComment(''); // Reset form or keep their text? Let's keep it so they see it, but we already refetch.
      setCommentsModalOpen(false); // Optionally close, but let's keep it open to feel seamless
      
    } catch (error: any) {
      console.error(error);
      toast({ title: t('common.error') || 'Hata', description: 'Yorum kaydedilemedi.', variant: 'destructive' });
    } finally {
      setSubmittingQuickComment(false);
    }
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
              className={`h-6 w-6 ${star <= value ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const RatingDisplay = ({ avg, label }: { avg: number; label: string }) => (
    <div className="flex items-center gap-1" title={label}>
      <Star className="h-3 w-3 fill-accent text-accent" />
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

      {/* Sub-Header / Alt Menu */}
      <header className="bg-transparent pt-8 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight">Firma Paneli</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">{t('dashboard.firmaSubtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {!isGuestMode && (
                <>
                  <div className="flex items-center gap-1 mr-2 border-r border-slate-200 pr-4">
                    <NotificationBell />
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/firma/profile')}
                      title="Profil"
                      className="text-slate-600 hover:text-primary hover:bg-primary/5"
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
                      className="text-slate-600 hover:text-destructive hover:bg-destructive/5"
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost"
                    onClick={() => navigate('/firma/ilanlarim')}
                    className="gap-2 text-primary hover:bg-primary/5 font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    İlanlarım
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/firma/ilan-olustur')}
                    className="gap-2 border-primary/20 text-primary hover:bg-primary/5 font-medium"
                  >
                    <FileText className="h-4 w-4" />
                    İlan Oluştur
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIhaleTuruModalOpen(true)}
                    className="gap-2 border-primary/20 text-primary hover:bg-primary/5 font-medium"
                  >
                    <Gavel className="h-4 w-4" />
                    İhale Başlat
                  </Button>

                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10 ml-2 shadow-sm">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="font-bold text-primary">{firmaCredits}</span>
                    <span className="text-sm text-primary/80 font-medium">Kredi</span>
                  </div>
                </>
              )}
              {isGuestMode && (
                <Button 
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-primary hover:bg-primary/5"
                >
                  Ana Sayfa
                </Button>
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
            {/* AI Smart Search Bar */}
            <div className="mb-6 space-y-3">
              {/* AI Prompt Input */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <Input
                  id="ai-search-input"
                  placeholder="Proje gereksinimlerini veya firma kriterlerini girin... (örn: Kocaeli bölgesinde PLC programlama ve AGV deneyimi olan firma)"
                  value={aiQuery}
                  onChange={(e) => {
                    setAiQuery(e.target.value);
                    if (!e.target.value.trim()) setAiResults(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiQuery.trim()) {
                      setAiLoading(true);
                      setAiResults(null);
                      setTimeout(() => {
                        try {
                          const results = runAIMatch(aiQuery, entegratorler as any);
                          setAiResults(Array.isArray(results) ? results : []);
                        } catch (err) {
                          console.error('[AI Match] Enter key error:', err);
                          setAiResults([]);
                        } finally {
                          setAiLoading(false);
                        }
                      }, 1400);
                    }
                  }}
                  className="pl-9 pr-36 h-11 text-sm border-slate-300 focus-visible:ring-primary bg-white shadow-none rounded-md"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {aiResults !== null && (
                    <button
                      onClick={() => { setAiResults(null); setAiQuery(''); }}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <Button
                    id="ai-search-btn"
                    size="sm"
                    disabled={!aiQuery.trim() || aiLoading}
                    onClick={() => {
                      setAiLoading(true);
                      setAiResults(null);
                      setTimeout(() => {
                        try {
                          const results = runAIMatch(aiQuery, entegratorler as any);
                          setAiResults(Array.isArray(results) ? results : []);
                        } catch (err) {
                          console.error('[AI Match] Button error:', err);
                          setAiResults([]);
                        } finally {
                          setAiLoading(false);
                        }
                      }, 1400);
                    }}
                    className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3 rounded-md text-xs font-medium"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    )}
                    {aiLoading ? 'Taranıyor...' : 'Uygun Partneri Bul'}
                  </Button>
                </div>
              </div>

              {/* Mobile filter button — positioned beside AI bar */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2 h-9 mt-1">
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

            {/* ── AI LOADING STATE ── */}
            {aiLoading && (
              <div className="mb-6 flex flex-col items-center justify-center py-8 rounded-md border border-slate-200 bg-slate-50 gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center">
                    <Server className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <div className="absolute -inset-1 rounded-sm border-2 border-primary/40 border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800 tracking-tight">Veritabanı taranıyor...</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Eşleşme algoritmaları çalıştırılıyor, kriterler işleniyor</p>
                </div>
              </div>
            )}

            {/* ── AI SMART MATCH RESULTS ── */}
            {!aiLoading && aiResults !== null && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md">
                    <Server className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-semibold text-primary tracking-tight">Eşleşme Sorgu Sonuçları</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">{aiResults.length} eşleşme</Badge>
                  <button
                    onClick={() => { setAiResults(null); setAiQuery(''); }}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> Temizle
                  </button>
                </div>

                {aiResults.length === 0 ? (
                  <Card className="p-8 text-center border-slate-200 bg-slate-50 rounded-md">
                    <Server className="h-9 w-9 text-primary/30 mx-auto mb-3" />
                    <p className="font-medium text-slate-700">Kriterlere uyan kayıt bulunamadı</p>
                    <p className="text-sm text-muted-foreground mt-1">Farklı parametreler deneyin: uzmanlık alanı, şehir, sektör...</p>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-3">
                    {aiResults.map(({ entegrator, score, matchReasonLines, matchedKeywords }, idx) => (
                      <Card
                        key={entegrator.id}
                        className="relative overflow-hidden border-slate-200 shadow-sm hover:border-primary/40 hover:shadow transition-all rounded-md"
                      >
                        {/* Uyumluluk indeksi */}
                        <div className="absolute top-2.5 right-2.5 font-mono text-[10px] text-primary font-bold bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm tracking-tight">
                          {(score / 100).toFixed(2)}
                        </div>
                        {/* Rank ribbon */}
                        {idx === 0 && (
                          <div className="absolute top-0 left-0 bg-primary text-white text-[10px] font-mono font-bold px-2 py-0.5 tracking-widest uppercase">
                            [1] EN YÜKSEK UYUMLULUK
                          </div>
                        )}

                        <CardContent className="p-4 pt-5">
                          {/* Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-base leading-tight">{maskName(entegrator.entegrator_adi as string)}</h3>
                              <p className="text-xs text-muted-foreground">{(entegrator as any).konum}</p>
                            </div>
                          </div>

                          {/* Matched keywords */}
                          {(matchedKeywords ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(matchedKeywords ?? []).map(kw => (
                                <Badge key={kw} className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-sm font-medium">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Uyum Kriterleri — system log format */}
                          {(matchReasonLines ?? []).length > 0 && (
                          <div className="bg-slate-50 border border-slate-200 rounded-sm p-3 mb-3">
                            <p className="text-sm font-semibold text-slate-700 tracking-wide mb-2">Uyum Kriterleri</p>
                            <ul className="space-y-1.5">
                              {(matchReasonLines ?? []).map((line, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-[13px] font-mono text-slate-700 leading-relaxed">
                                  <ChevronRight className="h-3.5 w-3.5 text-primary/50 mt-0.5 shrink-0" />
                                  {line}
                                </li>
                              ))}
                            </ul>
                          </div>
                          )}

                          {/* Ratings row */}
                          {entegratorRatings[entegrator.id] && (
                            <div className="flex gap-3 text-xs text-muted-foreground mb-3">
                              <span className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-accent text-accent" />
                                K: {entegratorRatings[entegrator.id].kalite_avg.toFixed(1)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-accent text-accent" />
                                M: {entegratorRatings[entegrator.id].musteri_iliskisi_avg.toFixed(1)}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Star className="h-3 w-3 fill-accent text-accent" />
                                S: {entegratorRatings[entegrator.id].surec_yonetimi_avg.toFixed(1)}
                              </span>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs h-7 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md"
                              onClick={() => openCommentsModal(entegrator as any)}
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1" />
                              Yorumlar ({(entegratorComments[entegrator.id] ?? []).length})
                            </Button>
                            {!isGuestMode && (
                              <Button
                                size="sm"
                                className="flex-1 text-xs h-7 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
                                onClick={() => handleRevealClick(entegrator as any)}
                              >
                                {revealedContacts.has(entegrator.id) ? (
                                  <><CheckCircle2 className="h-3.5 w-3.5 mr-1" />İletişim</>  
                                ) : (
                                  <><Eye className="h-3.5 w-3.5 mr-1" />Göster</>  
                                )}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-xs text-muted-foreground text-center">
                    Standart listeye dönmek için sonuçları temizleyin veya yukarıdaki filtreleri kullanın.
                  </p>
                </div>
              </div>
            )}

            {/* ── STANDARD RESULTS (hidden while AI results shown) ── */}
            {!aiLoading && aiResults === null && (
              <>
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
              <div className="flex flex-col gap-3">
                {filteredEntegratorler.map((entegrator, rowIdx) => {
                  const dp = (entegrator as any).detayli_puanlar;
                  const rt = entegratorRatings[entegrator.id];
                  const scoreK = dp?.kalite           ?? rt?.kalite_avg;
                  const scoreM = dp?.musteri_iliskisi ?? rt?.musteri_iliskisi_avg;
                  const scoreS = dp?.surec            ?? rt?.surec_yonetimi_avg;
                  const genel  = scoreK != null && scoreM != null && scoreS != null
                    ? ((scoreK + scoreM + scoreS) / 3)
                    : null;
                  const isMatched = matches.some(m => m.entegratorId === entegrator.id);
                  const reviewCount = entegratorRatings[entegrator.id]?.rating_count ?? (entegrator as any).yorum_listesi?.length ?? 0;
                  const uzmanliklar = entegrator.uzmanlik_alani?.split(', ') ?? [];

                  return (
                    <div
                      key={entegrator.id}
                      className="flex items-center gap-4 bg-white border border-slate-200 shadow-sm rounded-md px-5 py-4 hover:border-primary/30 hover:shadow transition-all"
                    >
                      {/* ── 1. Gizli Kimlik ── */}
                      <div className="flex items-center gap-3 shrink-0 w-48">
                        <div className="w-10 h-10 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-primary leading-tight truncate">
                            Gizli Entegratör #{String(rowIdx + 1).padStart(2, '0')}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 select-none blur-[3px] pointer-events-none">
                            {entegrator.entegrator_adi}
                          </p>
                        </div>
                      </div>

                      {/* ── Dikey Ayırıcı ── */}
                      <div className="w-px h-10 bg-slate-100 shrink-0" />

                      {/* ── 2. Uzmanlık Badge'leri ── */}
                      <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                        {uzmanliklar.slice(0, 3).map((u, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-sky-50 text-primary border border-sky-200"
                          >
                            {u}
                          </span>
                        ))}
                        {uzmanliklar.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            +{uzmanliklar.length - 3}
                          </span>
                        )}
                        {entegrator.sektor && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {entegrator.sektor}
                          </span>
                        )}
                      </div>

                      {/* ── 3. Lokasyon ── */}
                      {entegrator.konum && (
                        <div className="flex items-center gap-1 text-[12px] text-slate-500 shrink-0 w-36">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{entegrator.konum}</span>
                        </div>
                      )}

                      {/* ── 4. Doğrulanmış Rozet ── */}
                      <div className="flex flex-col items-center gap-0.5 shrink-0 w-16">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 font-medium leading-none">Doğrulanmış</span>
                      </div>

                      {/* ── 5. Puan Paneli ── */}
                      <div className="flex flex-col items-end shrink-0 w-24">
                        {genel != null ? (
                          <>
                            <span className="text-xl font-bold text-slate-800 tabular-nums leading-none">
                              {genel.toFixed(1)}
                            </span>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[1,2,3,4,5].map(i => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 shrink-0 ${
                                    i <= Math.round(genel)
                                      ? 'fill-sky-500 text-sky-500'
                                      : 'fill-slate-200 text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5">{reviewCount} değerlendirme</span>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">— veri yok</span>
                        )}
                      </div>

                      {/* ── Dikey Ayırıcı ── */}
                      <div className="w-px h-10 bg-slate-100 shrink-0" />

                      {/* ── 6. Aksiyon Butonları ── */}
                      <div className="flex flex-col gap-1.5 shrink-0 w-36">
                        {isGuestMode ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-primary text-primary hover:bg-primary/5 gap-1.5 w-full"
                            onClick={() => { toast({ title: 'Üyelik Gerekli', description: 'Eşleşme için üye olmanız gerekiyor.' }); navigate('/'); }}
                          >
                            <Lock className="h-3.5 w-3.5" />
                            Üye Ol
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-8 text-xs gap-1.5 w-full ${
                                isMatched
                                  ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                                  : 'border-primary text-primary hover:bg-primary/5'
                              }`}
                              onClick={() => {
                                if (isMatched) navigate('/eslesmeler');
                                else createMatch(entegrator.id, entegrator.entegrator_adi || `Entegratör ${entegrator.id.substring(0,6)}`);
                              }}
                            >
                              {isMatched
                                ? <><CheckCircle2 className="h-3.5 w-3.5" />Sürece Git</>
                                : <><Building2 className="h-3.5 w-3.5" />Eşleş</>}
                            </Button>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-7 text-[10px] border-slate-200 text-slate-600 hover:bg-slate-50 gap-1 px-2"
                                onClick={() => openCommentsModal(entegrator)}
                              >
                                <FileText className="h-3 w-3" />
                                Yorumlar
                                {reviewCount > 0 && <span>({reviewCount})</span>}
                              </Button>
                              <div className={`relative group/rate ${!isMatched ? 'cursor-not-allowed opacity-60' : ''}`}>
                                {!isMatched && (
                                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/rate:block z-50">
                                    <div className="bg-slate-800 text-white text-[11px] rounded-md px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                                      Sadece projeye eklenip eşleşilen entegratörler değerlendirilebilir.
                                    </div>
                                    <div className="flex justify-center">
                                      <span className="border-4 border-transparent border-t-slate-800 block" />
                                    </div>
                                  </div>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!isMatched}
                                  className="h-7 text-[10px] border-slate-200 text-slate-600 hover:bg-slate-50 gap-1 px-2 disabled:pointer-events-none"
                                  onClick={() => openRatingModal(entegrator)}
                                >
                                  <Star className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </>
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
              <Phone className="h-5 w-5 text-emerald-600" />
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
              <Star className="h-5 w-5 text-accent" />
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
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
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
        <DialogContent className="sm:max-w-xl flex flex-col max-h-[85vh] p-0">
          <div className="p-6 pb-2 border-b">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="h-5 w-5 text-primary" />
                Firma Değerlendirmeleri
              </DialogTitle>
              <DialogDescription>
                Bu entegratör hakkında diğer firmaların yaptığı değerlendirmeler
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4">
            {commentsEntegrator && entegratorComments[commentsEntegrator.id]?.length > 0 ? (() => {
              const allComments = entegratorComments[commentsEntegrator.id];
              const visibleComments = allComments.slice(0, 2);
              const hiddenCount = allComments.length - 2;
              const isMatched = matches.some(m => m.entegratorId === commentsEntegrator?.id);
              const CommentCard = ({ comment, index }: { comment: any; index: number }) => (
                <div key={index} className="p-4 bg-background border rounded-md shadow-sm space-y-3 hover:border-primary/20 transition-colors">
                  <div className="flex flex-wrap gap-3 text-sm">
                    {[{label:'Kalite', val:comment.kalite_puan},{label:'M.İlişki',val:comment.musteri_iliskisi_puan},{label:'Süreç',val:comment.surec_yonetimi_puan}].map(({label,val}) => (
                      <div key={label} className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-md">
                        <span className="text-xs font-semibold text-primary">{label}</span>
                        <div className="flex gap-0.5">{[1,2,3,4,5].map(s=>(
                          <Star key={s} className={`h-3 w-3 ${s<=val?'fill-accent text-accent':'text-slate-200'}`}/>
                        ))}</div>
                      </div>
                    ))}
                  </div>
                  {comment.yorum && <p className="text-sm text-foreground/90 leading-relaxed font-medium mt-2">{comment.yorum}</p>}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3"/>
                    <span>{new Date(comment.created_at).toLocaleDateString('tr-TR',{year:'numeric',month:'long',day:'numeric'})}</span>
                    {comment.author && <><span className="mx-1">•</span><User className="h-3 w-3"/><span>{comment.author}</span></>}
                  </div>
                </div>
              );
              return (
                <>
                  {visibleComments.map((comment, index) => <CommentCard key={index} comment={comment} index={index} />)}
                  {hiddenCount > 0 && !isMatched && (
                    <div className="relative rounded-md overflow-hidden border border-slate-200 min-h-[100px]">
                      <div className="p-4 bg-slate-50 space-y-2 blur-sm select-none pointer-events-none" aria-hidden>
                        <div className="flex gap-2"><div className="h-4 w-20 bg-slate-200 rounded"/><div className="h-4 w-16 bg-slate-200 rounded"/></div>
                        <div className="h-3 w-full bg-slate-200 rounded"/><div className="h-3 w-4/5 bg-slate-200 rounded"/><div className="h-3 w-3/5 bg-slate-200 rounded"/>
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-[2px]">
                        <Lock className="h-5 w-5 text-primary"/>
                        <p className="text-sm font-medium text-primary text-center px-4">+{hiddenCount} yorumu daha görmek için eşleşme sağlayın.</p>
                      </div>
                    </div>
                  )}
                  {hiddenCount > 0 && isMatched && allComments.slice(2).map((comment, index) => <CommentCard key={index+2} comment={comment} index={index+2} />)}
                </>
              );
            })() : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <FileText className="h-6 w-6 text-primary/60"/>
                </div>
                <p className="text-muted-foreground font-medium">Henüz değerlendirme yapılmamış.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">İlk yorumu siz yapın!</p>
              </div>
            )}
          </div>

          {/* Yeni Yorum Alanı - Yalnızca Eşleşilmiş Entegratörlere Yorum Yapılabilir */}
          {commentsEntegrator && matches.some(m => m.entegratorId === commentsEntegrator.id) ? (
            <div className="border-t bg-background p-6">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs">!</span>
                Sen de Değerlendir ve Yorum Yap
              </h4>
              
              {showQuickRating && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg border border-border">
                  <StarRating
                    label="Kalite"
                    value={quickRatingForm.kalite}
                    onChange={(v) => setQuickRatingForm(prev => ({ ...prev, kalite: v }))}
                  />
                  <StarRating
                    label="Müşteri"
                    value={quickRatingForm.musteriIliskisi}
                    onChange={(v) => setQuickRatingForm(prev => ({ ...prev, musteriIliskisi: v }))}
                  />
                  <StarRating
                    label="Süreç"
                    value={quickRatingForm.surecYonetimi}
                    onChange={(v) => setQuickRatingForm(prev => ({ ...prev, surecYonetimi: v }))}
                  />
                </div>
              )}
              
              <div className="flex items-start gap-3">
                <div className="relative flex-1">
                  <Textarea 
                    placeholder="Bu entegratör hakkındaki deneyimlerinizi paylaşın..." 
                    className="resize-none min-h-[80px] bg-muted/20 border-primary/20 focus-visible:ring-primary h-full pr-4 py-3"
                    value={quickComment}
                    onChange={(e) => setQuickComment(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={submitQuickComment} 
                  disabled={submittingQuickComment}
                  className="bg-primary hover:bg-primary/90 text-white h-auto py-3 px-6 shadow-md transition-all active:scale-95 flex flex-col gap-1 items-center justify-center min-w-[120px]"
                >
                  {submittingQuickComment ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span className="font-semibold">Yorum Yap</span>
                      <span className="text-[10px] opacity-80 uppercase tracking-widest">Gönder</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-t bg-muted/30 p-5 text-center">
              <p className="text-sm text-muted-foreground font-medium flex justify-center items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">!</span>
                Sadece eşleştiğiniz ve birlikte çalıştığınız entegratörleri değerlendirebilirsiniz.
              </p>
            </div>
          )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
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
            <Card className="border-2 hover:border-accent transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-accent/20 transition-colors">
                  <Star className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-lg">Global Paket</CardTitle>
                <p className="text-sm text-muted-foreground">Büyük işletmeler için</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-3xl font-bold text-accent">€3,000</span>
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
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
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

            {/* İhale Paketi */}
            <Card className="border-2 hover:border-primary/60 transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <Gavel className="h-6 w-6 text-primary/80" />
                </div>
                <CardTitle className="text-lg">İhale Paketi</CardTitle>
                <p className="text-sm text-muted-foreground">İhale açmak için</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div>
                  <span className="text-3xl font-bold text-primary/80">€2,000</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Gavel className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">İhale Başına</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 1 ihale açma hakkı</li>
                  <li>• Tüm ihale türleri</li>
                  <li>• Özel destek</li>
                </ul>
                <Button 
                  className="w-full bg-primary/80 hover:bg-primary/90 text-primary-foreground"
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
