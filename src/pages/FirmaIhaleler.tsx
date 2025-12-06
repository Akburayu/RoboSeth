import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "@/components/NotificationBell";
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Users, 
  TrendingDown, 
  TrendingUp, 
  Gavel,
  Lock,
  Shield,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Ihale {
  id: string;
  ihale_turu: string;
  baslik: string;
  aciklama: string | null;
  deadline: string;
  durum: string;
  mevcut_fiyat: number | null;
  mevcut_tur: number | null;
  toplam_tur: number | null;
  kazanan_teklif: number | null;
  created_at: string;
  teklif_sayisi?: number;
}

const IHALE_TURU_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  'acik_eksiltme': { label: 'Açık Eksiltme', icon: TrendingDown, color: 'bg-blue-500' },
  'ingiliz': { label: 'İngiliz Usulü', icon: TrendingUp, color: 'bg-green-500' },
  'hollanda': { label: 'Hollanda Usulü', icon: Gavel, color: 'bg-orange-500' },
  'japon': { label: 'Japon Usulü', icon: Users, color: 'bg-yellow-500' },
  'turlu_kapali': { label: 'Turlu Kapalı', icon: Lock, color: 'bg-red-500' },
  'muhurlu_kapali': { label: 'Mühürlü Kapalı', icon: Shield, color: 'bg-purple-500' },
};

const DURUM_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  'aktif': { label: 'Aktif', variant: 'default' },
  'beklemede': { label: 'Beklemede', variant: 'secondary' },
  'tamamlandi': { label: 'Tamamlandı', variant: 'outline' },
  'iptal': { label: 'İptal', variant: 'destructive' },
};

export default function FirmaIhaleler() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ihaleler, setIhaleler] = useState<Ihale[]>([]);
  const [loading, setLoading] = useState(true);
  const [firmaId, setFirmaId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }

    if (user) {
      fetchFirmaAndIhaleler();
    }
  }, [user, authLoading, navigate]);

  const fetchFirmaAndIhaleler = async () => {
    try {
      // Get firma id
      const { data: firmaData, error: firmaError } = await supabase
        .from('firma')
        .select('id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (firmaError) throw firmaError;
      if (!firmaData) {
        navigate('/firma/register');
        return;
      }

      setFirmaId(firmaData.id);

      // Get ihaleler with teklif count
      const { data: ihalelerData, error: ihalelerError } = await supabase
        .from('ihaleler')
        .select(`
          *,
          ihale_teklifleri(count)
        `)
        .eq('firma_id', firmaData.id)
        .order('created_at', { ascending: false });

      if (ihalelerError) throw ihalelerError;

      const ihalelerWithCount = ihalelerData?.map((ihale: any) => ({
        ...ihale,
        teklif_sayisi: ihale.ihale_teklifleri?.[0]?.count || 0,
      })) || [];

      setIhaleler(ihalelerWithCount);
    } catch (error) {
      console.error('Error fetching ihaleler:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Süre doldu';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/firma/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">İhalelerim</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Button onClick={() => navigate('/firma/dashboard')}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni İhale
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {ihaleler.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Gavel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz ihale oluşturmadınız</h3>
              <p className="text-muted-foreground mb-4">
                İlk ihalenizi başlatmak için aşağıdaki butona tıklayın.
              </p>
              <Button onClick={() => navigate('/firma/dashboard')}>
                <Plus className="h-4 w-4 mr-2" />
                İhale Başlat
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {ihaleler.map((ihale) => {
              const config = IHALE_TURU_CONFIG[ihale.ihale_turu] || IHALE_TURU_CONFIG['acik_eksiltme'];
              const durumBadge = DURUM_BADGES[ihale.durum] || DURUM_BADGES['aktif'];
              const IconComponent = config.icon;

              return (
                <Card 
                  key={ihale.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/ihale/${ihale.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{ihale.baslik}</CardTitle>
                          <p className="text-sm text-muted-foreground">{config.label}</p>
                        </div>
                      </div>
                      <Badge variant={durumBadge.variant}>{durumBadge.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {ihale.aciklama && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {ihale.aciklama}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(ihale.deadline), 'dd MMM yyyy HH:mm', { locale: tr })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{ihale.teklif_sayisi} teklif</span>
                      </div>
                      {ihale.durum === 'aktif' && (
                        <Badge variant="outline" className="text-primary">
                          {getTimeRemaining(ihale.deadline)} kaldı
                        </Badge>
                      )}
                      {ihale.mevcut_fiyat && (
                        <Badge variant="secondary">
                          Mevcut: {ihale.mevcut_fiyat.toLocaleString('tr-TR')} ₺
                        </Badge>
                      )}
                      {ihale.ihale_turu === 'turlu_kapali' && ihale.mevcut_tur && ihale.toplam_tur && (
                        <Badge variant="secondary">
                          Tur {ihale.mevcut_tur}/{ihale.toplam_tur}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Detayları Gör
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
