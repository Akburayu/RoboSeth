import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import NotificationBell from '@/components/NotificationBell';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Briefcase,
  Clock,
  Users,
  Award,
  Building2,
  Loader2,
  Eye,
  CreditCard,
  CheckCircle2,
  Star,
  User,
  LogOut,
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Ilan = Database['public']['Tables']['ilanlar']['Row'];
type Entegrator = Database['public']['Tables']['entegrator']['Row'];
type EntegratorBuyuklugu = Database['public']['Enums']['entegrator_buyuklugu'];

interface Teklif {
  id: string;
  ilan_id: string;
  entegrator_id: string;
  teklif_tutari: number | null;
  mesaj: string | null;
  created_at: string | null;
  entegrator: Entegrator | null;
}

interface EntegratorRatings {
  kalite_avg: number;
  musteri_iliskisi_avg: number;
  surec_yonetimi_avg: number;
  rating_count: number;
}

const BUYUKLUK_LABELS: Record<EntegratorBuyuklugu, string> = {
  kucuk: 'Küçük',
  orta: 'Orta',
  buyuk: 'Büyük',
};

const REVEAL_COSTS: Record<EntegratorBuyuklugu, number> = {
  kucuk: 5,
  orta: 15,
  buyuk: 30,
};

// Completely mask name - show only asterisks
function maskName(): string {
  return '******';
}

interface RevealedContact {
  entegrator_adi: string;
  iletisim: string | null;
  konum: string | null;
}

export default function FirmaIlanlar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, userRole, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const getBuyuklukLabels = () => ({
    kucuk: t('integrators.small'),
    orta: t('integrators.medium'),
    buyuk: t('integrators.large'),
  });

  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [tekliflerByIlan, setTekliflerByIlan] = useState<Record<string, Teklif[]>>({});
  const [loading, setLoading] = useState(true);
  const [firmaId, setFirmaId] = useState<string | null>(null);
  const [firmaCredits, setFirmaCredits] = useState<number>(0);
  
  // Revealed contacts tracking
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [selectedEntegrator, setSelectedEntegrator] = useState<Entegrator | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [revealedContactInfo, setRevealedContactInfo] = useState<RevealedContact | null>(null);
  
  // Ratings
  const [entegratorRatings, setEntegratorRatings] = useState<Record<string, EntegratorRatings>>({});

  useEffect(() => {
    if (authLoading) return;
    
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

    fetchData();
  }, [user, userRole, authLoading, navigate, toast, t]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // 1. Fetch firma ID and credits
      const { data: firmaData, error: firmaError } = await supabase
        .from('firma')
        .select('id, kredi')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (firmaError) throw firmaError;
      if (!firmaData) {
        toast({
          title: t('common.error'),
          description: t('listings.firmaNotFound'),
          variant: 'destructive',
        });
        return;
      }

      setFirmaId(firmaData.id);
      setFirmaCredits(firmaData.kredi || 0);

      // 2. Fetch ilanlar for this firma
      const { data: ilanlarData, error: ilanlarError } = await supabase
        .from('ilanlar')
        .select('*')
        .eq('firma_id', firmaData.id)
        .order('created_at', { ascending: false });

      if (ilanlarError) throw ilanlarError;
      setIlanlar(ilanlarData || []);

      // 3. Fetch revealed contacts
      const { data: revealedData } = await supabase
        .from('revealed_contacts')
        .select('entegrator_id')
        .eq('firma_id', firmaData.id);

      const revealedIds = new Set(revealedData?.map(r => r.entegrator_id) || []);
      setRevealedContacts(revealedIds);

      // 4. Fetch teklifler for all ilanlar
      if (ilanlarData && ilanlarData.length > 0) {
        const ilanIds = ilanlarData.map(i => i.id);
        
        const { data: tekliflerData, error: tekliflerError } = await supabase
          .from('teklifler')
          .select('*')
          .in('ilan_id', ilanIds)
          .order('created_at', { ascending: false });

        if (tekliflerError) throw tekliflerError;

        // Fetch entegrator details for each teklif
        if (tekliflerData && tekliflerData.length > 0) {
          const entegratorIds = [...new Set(tekliflerData.map(t => t.entegrator_id))];
          
          const { data: entegratorlerData } = await supabase
            .from('entegrator')
            .select('*')
            .in('id', entegratorIds);

          const entegratorMap = new Map(entegratorlerData?.map(e => [e.id, e]) || []);

          // Group teklifler by ilan
          const grouped: Record<string, Teklif[]> = {};
          tekliflerData.forEach(teklif => {
            if (!grouped[teklif.ilan_id]) {
              grouped[teklif.ilan_id] = [];
            }
            grouped[teklif.ilan_id].push({
              ...teklif,
              entegrator: entegratorMap.get(teklif.entegrator_id) || null,
            });
          });
          setTekliflerByIlan(grouped);
        }
      }

      // 5. Fetch ratings
      await fetchAllRatings();

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

  const fetchAllRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('firma_ratings')
        .select('entegrator_id, kalite_puan, musteri_iliskisi_puan, surec_yonetimi_puan');

      if (error) throw error;
      if (!data) return;

      const ratingsMap: Record<string, { kalite: number[]; musteri: number[]; surec: number[] }> = {};
      
      data.forEach((r) => {
        if (!ratingsMap[r.entegrator_id]) {
          ratingsMap[r.entegrator_id] = { kalite: [], musteri: [], surec: [] };
        }
        ratingsMap[r.entegrator_id].kalite.push(r.kalite_puan);
        ratingsMap[r.entegrator_id].musteri.push(r.musteri_iliskisi_puan);
        ratingsMap[r.entegrator_id].surec.push(r.surec_yonetimi_puan);
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
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
    }
  };

  const getRevealCost = (buyukluk: EntegratorBuyuklugu | null): number => {
    return REVEAL_COSTS[buyukluk || 'kucuk'] || 5;
  };

  const handleRevealClick = (entegrator: Entegrator) => {
    if (revealedContacts.has(entegrator.id)) {
      setRevealedContactInfo({
        entegrator_adi: entegrator.entegrator_adi,
        iletisim: entegrator.iletisim_sosyal_medya,
        konum: entegrator.konum
      });
      setContactModalOpen(true);
      return;
    }
    
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
          title: 'Oturum Hatası',
          description: 'Lütfen tekrar giriş yapın.',
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

      const BUYUKLUK_LABELS = getBuyuklukLabels();

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

      setRevealedContacts(prev => new Set([...prev, selectedEntegrator.id]));
      setFirmaCredits(result.remaining_credits);
      setRevealModalOpen(false);
      
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
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRevealing(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'tr-TR');
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return t('integrators.notSpecified');
    if (min && max) return `₺${min.toLocaleString()} - ₺${max.toLocaleString()}`;
    if (min) return `₺${min.toLocaleString()}+`;
    if (max) return `₺${max.toLocaleString()} max`;
    return t('integrators.notSpecified');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-firma" />
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
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-firma">{t('listings.myListingsAndProposals')}</h1>
                <p className="text-sm text-muted-foreground">{t('listings.viewMyListings')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => navigate('/firma/profile')}
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
              <div className="flex items-center gap-2 px-4 py-2 bg-firma/10 rounded-lg border border-firma/20">
                <CreditCard className="h-5 w-5 text-firma" />
                <span className="font-semibold text-firma">{firmaCredits}</span>
                <span className="text-sm text-muted-foreground">{t('common.credit')}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {ilanlar.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('listings.noListingsPublished')}</h2>
            <p className="text-muted-foreground mb-4">{t('listings.startPublishing')}</p>
            <Button onClick={() => navigate('/firma/ilan-olustur')} className="bg-firma hover:bg-firma/90">
              <FileText className="h-4 w-4 mr-2" />
              {t('listings.createListing')}
            </Button>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {ilanlar.map((ilan) => {
              const teklifler = tekliflerByIlan[ilan.id] || [];
              
              return (
                <AccordionItem key={ilan.id} value={ilan.id} className="border rounded-lg bg-card">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-firma/10 rounded-lg">
                          <FileText className="h-5 w-5 text-firma" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">{ilan.baslik || t('listings.unnamedListing')}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(ilan.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatBudget(ilan.butce_min, ilan.butce_max)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={teklifler.length > 0 ? 'bg-firma' : 'bg-muted text-muted-foreground'}>
                        {teklifler.length} {t('listings.receivedProposals').split(' ')[0]}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6">
                    {/* İlan Detayları */}
                    <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-3 text-sm text-muted-foreground">{t('listings.listingDetails')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {ilan.aciklama && (
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">{t('common.description')}:</span>
                            <p className="mt-1">{ilan.aciklama}</p>
                          </div>
                        )}
                        {ilan.aranan_faaliyet_alanlari && (
                          <div>
                            <span className="text-muted-foreground">{t('listings.activityAreas')}:</span>
                            <p className="mt-1">{ilan.aranan_faaliyet_alanlari}</p>
                          </div>
                        )}
                        {ilan.aranan_uzmanlik && (
                          <div>
                            <span className="text-muted-foreground">{t('listings.expertise')}:</span>
                            <p className="mt-1">{ilan.aranan_uzmanlik}</p>
                          </div>
                        )}
                        {ilan.hizmet_verilen_iller && (
                          <div>
                            <span className="text-muted-foreground">{t('listings.provinces')}:</span>
                            <p className="mt-1">{ilan.hizmet_verilen_iller}</p>
                          </div>
                        )}
                        {ilan.son_tarih && (
                          <div>
                            <span className="text-muted-foreground">{t('listings.deadline')}:</span>
                            <p className="mt-1">{formatDate(ilan.son_tarih)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Teklifler */}
                    <div>
                      <h4 className="font-medium mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t('listings.receivedProposals')} ({teklifler.length})
                      </h4>
                      
                      {teklifler.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          {t('listings.noProposals')}
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {teklifler.map((teklif) => {
                            const entegrator = teklif.entegrator;
                            const isRevealed = entegrator && revealedContacts.has(entegrator.id);
                            const ratings = entegrator ? entegratorRatings[entegrator.id] : null;
                            const BUYUKLUK_LABELS = getBuyuklukLabels();

                            return (
                              <Card key={teklif.id} className="border-firma/10">
                                <CardContent className="p-4">
                                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Entegrator Info - Name masked */}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-entegrator/20 to-entegrator/40 flex items-center justify-center">
                                          <Building2 className="h-5 w-5 text-entegrator" />
                                        </div>
                                        <div>
                                          <h5 className="font-semibold">
                                            {isRevealed ? entegrator?.entegrator_adi : maskName()}
                                          </h5>
                                          {entegrator?.entegrator_buyuklugu && (
                                            <Badge variant="outline" className="text-xs">
                                              {BUYUKLUK_LABELS[entegrator.entegrator_buyuklugu]}
                                            </Badge>
                                          )}
                                        </div>
                                        
                                        {/* Ratings */}
                                        {ratings && (
                                          <div className="ml-auto flex flex-col gap-1 text-right">
                                            <div className="flex items-center gap-1 justify-end text-xs">
                                              <span className="text-muted-foreground">{t('integrators.qualityScore')}:</span>
                                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                              <span className="font-medium">{ratings.kalite_avg.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 justify-end text-xs">
                                              <span className="text-muted-foreground">{t('integrators.customerRelations')}:</span>
                                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                              <span className="font-medium">{ratings.musteri_iliskisi_avg.toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 justify-end text-xs">
                                              <span className="text-muted-foreground">{t('integrators.processManagement')}:</span>
                                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                              <span className="font-medium">{ratings.surec_yonetimi_avg.toFixed(1)}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Entegrator Details - Visible without reveal */}
                                      {entegrator && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mb-3">
                                          {entegrator.tecrube && (
                                            <div className="flex items-center gap-1">
                                              <Clock className="h-3 w-3" />
                                              {entegrator.tecrube}
                                            </div>
                                          )}
                                          {entegrator.kac_kisi && (
                                            <div className="flex items-center gap-1">
                                              <Users className="h-3 w-3" />
                                              {entegrator.kac_kisi} {t('common.person')}
                                            </div>
                                          )}
                                          {entegrator.sektor && (
                                            <div className="flex items-center gap-1">
                                              <Briefcase className="h-3 w-3" />
                                              {entegrator.sektor}
                                            </div>
                                          )}
                                          {entegrator.referans && (
                                            <div className="flex items-center gap-1">
                                              <Award className="h-3 w-3" />
                                              {t('integrators.hasReferences')}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Uzmanlık Alanları */}
                                      {entegrator?.uzmanlik_alani && (
                                        <div className="flex flex-wrap gap-1 mb-3">
                                          {entegrator.uzmanlik_alani.split(', ').slice(0, 4).map((u, i) => (
                                            <Badge key={i} variant="secondary" className="text-xs">
                                              {u}
                                            </Badge>
                                          ))}
                                          {entegrator.uzmanlik_alani.split(', ').length > 4 && (
                                            <Badge variant="secondary" className="text-xs">
                                              +{entegrator.uzmanlik_alani.split(', ').length - 4}
                                            </Badge>
                                          )}
                                        </div>
                                      )}

                                      {/* Teklif Detayı */}
                                      <div className="p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                          <DollarSign className="h-4 w-4 text-firma" />
                                          <span className="font-semibold text-firma">
                                            {teklif.teklif_tutari 
                                              ? `₺${teklif.teklif_tutari.toLocaleString()}`
                                              : t('integrators.notSpecified')
                                            }
                                          </span>
                                          <span className="text-xs text-muted-foreground ml-auto">
                                            {formatDate(teklif.created_at)}
                                          </span>
                                        </div>
                                        {teklif.mesaj && (
                                          <p className="text-sm text-muted-foreground">{teklif.mesaj}</p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Button */}
                                    {entegrator && (
                                      <Button 
                                        className={`shrink-0 gap-2 ${
                                          isRevealed
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-firma hover:bg-firma/90'
                                        }`}
                                        size="sm"
                                        onClick={() => handleRevealClick(entegrator)}
                                      >
                                        {isRevealed ? (
                                          <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            {t('integrators.viewContact')}
                                          </>
                                        ) : (
                                          <>
                                            <Eye className="h-4 w-4" />
                                            {t('integrators.revealContact')} ({getRevealCost(entegrator.entegrator_buyuklugu)} {t('common.credit')})
                                          </>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>

      {/* Reveal Confirmation Modal */}
      <Dialog open={revealModalOpen} onOpenChange={setRevealModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('integrators.revealContactTitle')}</DialogTitle>
            <DialogDescription>
              {t('integrators.revealContactDesc')}{' '}
              <span className="font-bold text-firma">
                {selectedEntegrator ? getRevealCost(selectedEntegrator.entegrator_buyuklugu) : 0} {t('common.credit')}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{t('credits.yourCredits')}</p>
                <p className="text-2xl font-bold text-firma">{firmaCredits}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('integrators.afterTransaction')}</p>
                <p className="text-2xl font-bold">
                  {selectedEntegrator 
                    ? firmaCredits - getRevealCost(selectedEntegrator.entegrator_buyuklugu)
                    : firmaCredits
                  }
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevealModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={confirmReveal} 
              disabled={revealing || (selectedEntegrator && firmaCredits < getRevealCost(selectedEntegrator.entegrator_buyuklugu))}
              className="bg-firma hover:bg-firma/90"
            >
              {revealing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('common.processing')}
                </>
              ) : (
                t('common.confirm')
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
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {t('integrators.contactInfo')}
            </DialogTitle>
          </DialogHeader>
          
          {revealedContactInfo && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{t('roles.entegrator')}</p>
                <p className="font-semibold text-lg">{revealedContactInfo.entegrator_adi}</p>
              </div>
              
              {revealedContactInfo.iletisim && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{t('entegratorRegister.socialMedia')}</p>
                  <p className="font-medium">{revealedContactInfo.iletisim}</p>
                </div>
              )}
              
              {revealedContactInfo.konum && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{t('entegratorRegister.location')}</p>
                  <p className="font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {revealedContactInfo.konum}
                  </p>
                </div>
              )}
              
              {!revealedContactInfo.iletisim && !revealedContactInfo.konum && (
                <p className="text-center text-muted-foreground py-4">
                  {t('integrators.noContactInfo')}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setContactModalOpen(false)}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
