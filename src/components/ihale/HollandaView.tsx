import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, CheckCircle, XCircle, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HollandaViewProps {
  ihale: any;
  teklifler: any[];
  userRole: 'firma' | 'entegrator' | null;
  entegratorId: string | null;
  isFirmaOwner: boolean;
  onTeklifSubmit: (teklif: number) => Promise<void>;
  onRefresh: () => void;
}

export function HollandaView({
  ihale,
  teklifler,
  userRole,
  entegratorId,
  isFirmaOwner,
  onTeklifSubmit,
  onRefresh,
}: HollandaViewProps) {
  const { toast } = useToast();
  const [accepting, setAccepting] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const currentPrice = ihale.mevcut_fiyat || ihale.baslangic_fiyati || 100000;
  const minimumPrice = ihale.minimum_fiyat || 10000;
  const priceStep = ihale.fiyat_adimi || 100;
  const winner = teklifler.find(t => t.durum === 'kabul');

  useEffect(() => {
    if (ihale.durum !== 'aktif' || winner) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Decrease price
          decreasePrice();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ihale, winner]);

  const decreasePrice = async () => {
    if (currentPrice - priceStep < minimumPrice) {
      // End auction - no winner
      await supabase
        .from('ihaleler')
        .update({ durum: 'tamamlandi' })
        .eq('id', ihale.id);
      return;
    }

    await supabase
      .from('ihaleler')
      .update({ mevcut_fiyat: currentPrice - priceStep })
      .eq('id', ihale.id);
  };

  const handleAccept = async () => {
    if (!entegratorId) return;

    setAccepting(true);
    try {
      // Insert winning bid
      const { error: bidError } = await supabase
        .from('ihale_teklifleri')
        .insert({
          ihale_id: ihale.id,
          entegrator_id: entegratorId,
          teklif_tutari: currentPrice,
          durum: 'kabul',
        });

      if (bidError) throw bidError;

      // Update ihale
      const { error: updateError } = await supabase
        .from('ihaleler')
        .update({
          durum: 'tamamlandi',
          kazanan_entegrator_id: entegratorId,
          kazanan_teklif: currentPrice,
        })
        .eq('id', ihale.id);

      if (updateError) throw updateError;

      toast({
        title: "Tebrikler!",
        description: `İhaleyi ${currentPrice.toLocaleString('tr-TR')} ₺ ile kazandınız.`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Kabul işlemi başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const isActive = ihale.durum === 'aktif' && !winner;
  const canAccept = isActive && userRole === 'entegrator' && entegratorId;

  const progressPercent = ((ihale.baslangic_fiyati - currentPrice) / (ihale.baslangic_fiyati - minimumPrice)) * 100;

  return (
    <div className="space-y-4">
      {/* Winner Banner */}
      {winner && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="py-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">İhale Sonuçlandı!</h3>
            <p className="text-lg">
              Kazanan Teklif: <span className="font-bold">{winner.teklif_tutari.toLocaleString('tr-TR')} ₺</span>
            </p>
            {winner.entegrator_id === entegratorId && (
              <Badge className="mt-2" variant="default">Kazanan Sizsiniz!</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Price Display */}
      <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Mevcut Fiyat</p>
            <p className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-4">
              {currentPrice.toLocaleString('tr-TR')} ₺
            </p>
            
            {isActive && (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-orange-500 animate-bounce" />
                  <span className="text-lg font-medium">
                    {countdown} saniye sonra {priceStep.toLocaleString('tr-TR')} ₺ düşecek
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div 
                    className="bg-orange-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Başlangıç: {ihale.baslangic_fiyati?.toLocaleString('tr-TR')} ₺</span>
                  <span>Minimum: {minimumPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Accept Button */}
      {canAccept && (
        <Card>
          <CardContent className="py-6">
            <Button 
              className="w-full h-16 text-xl"
              onClick={handleAccept}
              disabled={accepting}
            >
              <CheckCircle className="h-6 w-6 mr-3" />
              {accepting ? 'Kabul Ediliyor...' : `${currentPrice.toLocaleString('tr-TR')} ₺ ile Kabul Et`}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-3">
              İlk kabul eden ihaleyi kazanır. Fiyat düşmeye devam edecek.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Hollanda Usulü Nasıl Çalışır?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Fiyat yüksek bir değerden başlar ve otomatik olarak düşer
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              "Kabul Et" butonuna ilk basan ihaleyi o fiyattan kazanır
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Fiyat minimum değere ulaşırsa ihale sonlanır
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              Stratejinizi iyi belirleyin - çok beklerseniz başkası kazanabilir!
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
