import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  TrendingDown, 
  TrendingUp, 
  Gavel,
  Lock,
  Shield,
  Clock,
  FileText,
  Download,
  Send
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Import auction type components
import { AcikEksiltmeView } from "@/components/ihale/AcikEksiltmeView";
import { IngilizView } from "@/components/ihale/IngilizView";
import { HollandaView } from "@/components/ihale/HollandaView";
import { JaponView } from "@/components/ihale/JaponView";
import { TurluKapaliView } from "@/components/ihale/TurluKapaliView";
import { MuhurluKapaliView } from "@/components/ihale/MuhurluKapaliView";

interface Ihale {
  id: string;
  firma_id: string;
  ihale_turu: string;
  baslik: string;
  aciklama: string | null;
  teknik_sartlar: string | null;
  dokuman_url: string | null;
  baslangic_fiyati: number | null;
  minimum_fiyat: number | null;
  fiyat_adimi: number | null;
  mevcut_fiyat: number | null;
  deadline: string;
  mevcut_tur: number | null;
  toplam_tur: number | null;
  durum: string;
  kazanan_entegrator_id: string | null;
  kazanan_teklif: number | null;
  created_at: string;
}

interface Teklif {
  id: string;
  ihale_id: string;
  entegrator_id: string;
  teklif_tutari: number;
  tur_no: number;
  durum: string;
  created_at: string;
  entegrator?: {
    entegrator_adi: string;
    uzmanlik_alani: string | null;
    tecrube: string | null;
  };
}

const IHALE_TURU_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  'acik_eksiltme': { label: 'Açık Eksiltme Usulü E-İhale', icon: TrendingDown, color: 'bg-blue-500' },
  'ingiliz': { label: 'İngiliz Usulü E-İhale', icon: TrendingUp, color: 'bg-green-500' },
  'hollanda': { label: 'Hollanda Usulü E-İhale', icon: Gavel, color: 'bg-orange-500' },
  'japon': { label: 'Japon Usulü E-İhale', icon: Users, color: 'bg-yellow-500' },
  'turlu_kapali': { label: 'Turlu Kapalı Usulü E-İhale', icon: Lock, color: 'bg-red-500' },
  'muhurlu_kapali': { label: 'Mühürlü Kapalı Usulü E-İhale', icon: Shield, color: 'bg-purple-500' },
};

export default function IhaleDetay() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ihale, setIhale] = useState<Ihale | null>(null);
  const [teklifler, setTeklifler] = useState<Teklif[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'firma' | 'entegrator' | null>(null);
  const [entegratorId, setEntegratorId] = useState<string | null>(null);
  const [isFirmaOwner, setIsFirmaOwner] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (user && id) {
      fetchData();
      setupRealtimeSubscription();
    }
  }, [user, authLoading, id, navigate]);

  useEffect(() => {
    if (ihale?.deadline && ihale.durum === 'aktif') {
      const interval = setInterval(() => {
        updateTimeRemaining();
      }, 1000);

      updateTimeRemaining();
      return () => clearInterval(interval);
    }
  }, [ihale]);

  const updateTimeRemaining = () => {
    if (!ihale?.deadline) return;

    const now = new Date();
    const end = new Date(ihale.deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining('Süre doldu');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      setTimeRemaining(`${days}g ${hours}s ${minutes}d`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}s ${minutes}d ${seconds}sn`);
    } else {
      setTimeRemaining(`${minutes}d ${seconds}sn`);
    }
  };

  const fetchData = async () => {
    try {
      // Get ihale details
      const { data: ihaleData, error: ihaleError } = await supabase
        .from('ihaleler')
        .select('*')
        .eq('id', id)
        .single();

      if (ihaleError) throw ihaleError;
      setIhale(ihaleData);

      // Check if user is firma owner
      const { data: firmaData } = await supabase
        .from('firma')
        .select('id')
        .eq('user_id', user?.id)
        .eq('id', ihaleData.firma_id)
        .maybeSingle();

      if (firmaData) {
        setIsFirmaOwner(true);
        setUserRole('firma');
      }

      // Check if user is entegrator
      const { data: entegratorData } = await supabase
        .from('entegrator')
        .select('id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (entegratorData) {
        setEntegratorId(entegratorData.id);
        if (!firmaData) setUserRole('entegrator');
      }

      // Get teklifler
      await fetchTeklifler();
    } catch (error) {
      console.error('Error fetching ihale:', error);
      toast({
        title: "Hata",
        description: "İhale bilgileri yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeklifler = async () => {
    const { data: tekliflerData, error: tekliflerError } = await supabase
      .from('ihale_teklifleri')
      .select(`
        *,
        entegrator:entegrator_id (
          entegrator_adi,
          uzmanlik_alani,
          tecrube
        )
      `)
      .eq('ihale_id', id)
      .order('created_at', { ascending: false });

    if (tekliflerError) {
      console.error('Error fetching teklifler:', tekliflerError);
    } else {
      setTeklifler(tekliflerData || []);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`ihale-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ihale_teklifleri',
          filter: `ihale_id=eq.${id}`,
        },
        () => {
          fetchTeklifler();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ihaleler',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setIhale(payload.new as Ihale);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTeklifSubmit = async (teklif: number, turNo?: number) => {
    if (!entegratorId || !ihale) return;

    try {
      // Check if there's an existing bid for this round (for turlu_kapali) or auction
      const existingBidQuery = supabase
        .from('ihale_teklifleri')
        .select('id')
        .eq('ihale_id', ihale.id)
        .eq('entegrator_id', entegratorId);
      
      // For turlu_kapali, check same round; for others, check any existing bid
      if (turNo && ihale.ihale_turu === 'turlu_kapali') {
        existingBidQuery.eq('tur_no', turNo);
      }

      const { data: existingBid } = await existingBidQuery.maybeSingle();

      if (existingBid && ihale.ihale_turu !== 'turlu_kapali') {
        // Update existing bid (for acik_eksiltme, ingiliz)
        const { error } = await supabase
          .from('ihale_teklifleri')
          .update({ teklif_tutari: teklif })
          .eq('id', existingBid.id);

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Teklifiniz güncellendi.",
        });
      } else {
        // Insert new bid
        const { error } = await supabase
          .from('ihale_teklifleri')
          .insert({
            ihale_id: ihale.id,
            entegrator_id: entegratorId,
            teklif_tutari: teklif,
            tur_no: turNo || 1,
          });

        if (error) throw error;

        toast({
          title: "Başarılı",
          description: "Teklifiniz başarıyla gönderildi.",
        });
      }

      // Refresh bids
      fetchTeklifler();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Teklif gönderilirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ihale) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">İhale bulunamadı</h2>
          <Button onClick={() => navigate(-1)}>Geri Dön</Button>
        </Card>
      </div>
    );
  }

  const config = IHALE_TURU_CONFIG[ihale.ihale_turu] || IHALE_TURU_CONFIG['acik_eksiltme'];
  const IconComponent = config.icon;

  const renderAuctionView = () => {
    const commonProps = {
      ihale,
      teklifler,
      userRole,
      entegratorId,
      isFirmaOwner,
      onTeklifSubmit: handleTeklifSubmit,
      onRefresh: fetchTeklifler,
    };

    switch (ihale.ihale_turu) {
      case 'acik_eksiltme':
        return <AcikEksiltmeView {...commonProps} />;
      case 'ingiliz':
        return <IngilizView {...commonProps} />;
      case 'hollanda':
        return <HollandaView {...commonProps} />;
      case 'japon':
        return <JaponView {...commonProps} />;
      case 'turlu_kapali':
        return <TurluKapaliView {...commonProps} />;
      case 'muhurlu_kapali':
        return <MuhurluKapaliView {...commonProps} />;
      default:
        return <AcikEksiltmeView {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{ihale.baslik}</h1>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {ihale.durum === 'aktif' && (
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  {timeRemaining}
                </Badge>
              )}
              <Badge 
                variant={ihale.durum === 'aktif' ? 'default' : ihale.durum === 'tamamlandi' ? 'secondary' : 'destructive'}
                className="text-sm"
              >
                {ihale.durum === 'aktif' ? 'Aktif' : ihale.durum === 'tamamlandi' ? 'Tamamlandı' : 'İptal'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ihale Details */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">İhale Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ihale.aciklama && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Açıklama</h4>
                    <p className="text-sm">{ihale.aciklama}</p>
                  </div>
                )}

                {ihale.teknik_sartlar && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Teknik Şartlar</h4>
                    <p className="text-sm whitespace-pre-wrap">{ihale.teknik_sartlar}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Bitiş: {format(new Date(ihale.deadline), 'dd MMM yyyy HH:mm', { locale: tr })}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{teklifler.length} teklif</span>
                </div>

                {ihale.dokuman_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={ihale.dokuman_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Teknik Şartname İndir
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Auction View */}
          <div className="lg:col-span-2">
            {renderAuctionView()}
          </div>
        </div>
      </main>
    </div>
  );
}
