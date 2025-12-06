import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Send, Trophy, Eye, EyeOff, SkipForward, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TurluKapaliViewProps {
  ihale: any;
  teklifler: any[];
  userRole: 'firma' | 'entegrator' | null;
  entegratorId: string | null;
  isFirmaOwner: boolean;
  onTeklifSubmit: (teklif: number, turNo?: number) => Promise<void>;
  onRefresh: () => void;
}

export function TurluKapaliView({
  ihale,
  teklifler,
  userRole,
  entegratorId,
  isFirmaOwner,
  onTeklifSubmit,
  onRefresh,
}: TurluKapaliViewProps) {
  const { toast } = useToast();
  const [newTeklif, setNewTeklif] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [advancingRound, setAdvancingRound] = useState(false);
  const [endingAuction, setEndingAuction] = useState(false);

  const currentRound = ihale.mevcut_tur || 1;
  const totalRounds = ihale.toplam_tur || 3;
  const isLastRound = currentRound >= totalRounds;
  const isCompleted = ihale.durum === 'tamamlandi';

  // Group teklifler by round
  const tekliflerByRound = useMemo(() => {
    const grouped: Record<number, any[]> = {};
    teklifler.forEach(t => {
      const round = t.tur_no || 1;
      if (!grouped[round]) grouped[round] = [];
      grouped[round].push(t);
    });
    return grouped;
  }, [teklifler]);

  // Get my teklifler
  const myTeklifler = teklifler.filter(t => t.entegrator_id === entegratorId);
  const myCurrentRoundTeklif = myTeklifler.find(t => t.tur_no === currentRound);

  // Get best teklif (lowest for current round)
  const currentRoundTeklifler = tekliflerByRound[currentRound] || [];
  
  // Sorted teklifler for final display
  const sortedTeklifler = useMemo(() => {
    return [...teklifler].sort((a, b) => a.teklif_tutari - b.teklif_tutari);
  }, [teklifler]);

  const handleSubmit = async () => {
    const teklif = parseInt(newTeklif);
    if (!teklif || teklif <= 0) return;

    setSubmitting(true);
    try {
      await onTeklifSubmit(teklif, currentRound);
      setNewTeklif('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdvanceRound = async () => {
    if (isLastRound) {
      // Complete auction
      await handleEndAuction();
      return;
    }

    setAdvancingRound(true);
    try {
      await supabase
        .from('ihaleler')
        .update({ mevcut_tur: currentRound + 1 })
        .eq('id', ihale.id);

      toast({
        title: "Tur İlerledi",
        description: `${currentRound + 1}. tura geçildi.`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Tur ilerletme başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setAdvancingRound(false);
    }
  };

  const handleEndAuction = async () => {
    setEndingAuction(true);
    try {
      // Find the lowest bid across all rounds (or just last round)
      const lastRoundTeklifler = tekliflerByRound[currentRound] || teklifler;
      const sortedBids = [...lastRoundTeklifler].sort((a, b) => a.teklif_tutari - b.teklif_tutari);
      const winningBid = sortedBids[0];

      await supabase
        .from('ihaleler')
        .update({
          durum: 'tamamlandi',
          kazanan_entegrator_id: winningBid?.entegrator_id || null,
          kazanan_teklif: winningBid?.teklif_tutari || null,
        })
        .eq('id', ihale.id);

      toast({
        title: "İhale Tamamlandı",
        description: winningBid 
          ? `Kazanan teklif: ${winningBid.teklif_tutari.toLocaleString('tr-TR')} ₺`
          : "Kazanan bulunamadı.",
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "İhale kapatma başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setEndingAuction(false);
    }
  };

  const isActive = ihale.durum === 'aktif';
  const canBid = isActive && userRole === 'entegrator' && entegratorId && !myCurrentRoundTeklif;

  return (
    <div className="space-y-4">
      {/* Round Status */}
      <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mevcut Tur</p>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                {currentRound} / {totalRounds}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Bu Tur Teklif</p>
              <p className="text-2xl font-semibold">{currentRoundTeklifler.length}</p>
            </div>
          </div>
          
          {/* Round Progress */}
          <div className="mt-4 flex gap-2">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div 
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i + 1 < currentRound 
                    ? 'bg-red-500' 
                    : i + 1 === currentRound 
                      ? 'bg-red-300 animate-pulse' 
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Winner Banner */}
      {isCompleted && ihale.kazanan_teklif && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="py-6 text-center">
            <Trophy className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">İhale Sonuçlandı!</h3>
            <p className="text-lg">
              Kazanan Teklif: <span className="font-bold">{ihale.kazanan_teklif.toLocaleString('tr-TR')} ₺</span>
            </p>
            {ihale.kazanan_entegrator_id === entegratorId && (
              <Badge className="mt-2" variant="default">Kazanan Sizsiniz!</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Firma Controls - Advance Round */}
      {isFirmaOwner && isActive && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SkipForward className="h-5 w-5" />
              Tur Yönetimi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Bu turda teklif veren:</span>
                <Badge>{currentRoundTeklifler.length} entegratör</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleAdvanceRound}
                disabled={advancingRound || endingAuction}
                className="h-12"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                {advancingRound ? 'İşleniyor...' : isLastRound ? 'Son Tur - Bitir' : 'Sonraki Tura Geç'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndAuction}
                disabled={advancingRound || endingAuction}
                className="h-12"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {endingAuction ? 'Sonlandırılıyor...' : 'İhaleyi Şimdi Bitir'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bid Input */}
      {canBid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {currentRound}. Tur Teklifiniz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Teklif tutarı (₺)"
                  value={newTeklif}
                  onChange={(e) => setNewTeklif(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Teklifiniz kapalı olarak alınacak. Kimse göremeyecek.
                </p>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !newTeklif}
              >
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Previous Bids */}
      {userRole === 'entegrator' && myTeklifler.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Tekliflerim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myTeklifler.sort((a, b) => b.tur_no - a.tur_no).map((teklif) => (
                <div 
                  key={teklif.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    teklif.tur_no === currentRound ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div>
                    <Badge variant="outline">{teklif.tur_no}. Tur</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(teklif.created_at), 'dd MMM HH:mm', { locale: tr })}
                    </p>
                  </div>
                  <p className="font-bold text-lg">{teklif.teklif_tutari.toLocaleString('tr-TR')} ₺</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already submitted this round */}
      {myCurrentRoundTeklif && isActive && (
        <Card className="bg-muted">
          <CardContent className="py-6 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Bu Tur İçin Teklifiniz Alındı</h3>
            <p className="text-muted-foreground">
              Teklifiniz: <span className="font-bold">{myCurrentRoundTeklif.teklif_tutari.toLocaleString('tr-TR')} ₺</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Firma sonraki tura geçene kadar bekleyiniz...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Firma View - All Bids (Hidden until completion) */}
      {isFirmaOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Teklifler {isCompleted ? '(Açıldı)' : '(Kapalı)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(tekliflerByRound).sort((a, b) => parseInt(b[0]) - parseInt(a[0])).map(([round, roundTeklifler]) => (
              <div key={round} className="mb-4">
                <h4 className="font-medium mb-2">{round}. Tur - {(roundTeklifler as any[]).length} teklif</h4>
                <div className="space-y-2">
                  {(roundTeklifler as any[])
                    .sort((a, b) => a.teklif_tutari - b.teklif_tutari)
                    .map((teklif, index) => (
                    <div 
                      key={teklif.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isCompleted && index === 0 ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted && index === 0 ? 'bg-green-500 text-white' : 'bg-muted-foreground text-white'
                        }`}>
                          {isCompleted && index === 0 ? <Trophy className="h-4 w-4" /> : index + 1}
                        </div>
                        <p className="font-medium">Entegratör {index + 1}</p>
                      </div>
                      {isCompleted || parseInt(round) < currentRound ? (
                        <p className="font-bold">{teklif.teklif_tutari.toLocaleString('tr-TR')} ₺</p>
                      ) : (
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Gizli
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {teklifler.length === 0 && (
              <p className="text-muted-foreground text-center py-4">Henüz teklif yok</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Revealed Bids (After completion - for entegrator) */}
      {isCompleted && userRole === 'entegrator' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Tüm Teklifler (Açıldı)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedTeklifler.map((teklif, index) => (
                <div 
                  key={teklif.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === 0 ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : ''
                  } ${teklif.entegrator_id === entegratorId ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-green-500 text-white' : 'bg-muted'
                    }`}>
                      {index === 0 ? <Trophy className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {teklif.entegrator_id === entegratorId ? 'Sizin Teklifiniz' : `Entegratör`}
                      </p>
                      <Badge variant="outline" className="text-xs">{teklif.tur_no}. Tur</Badge>
                    </div>
                  </div>
                  <p className="font-bold">{teklif.teklif_tutari.toLocaleString('tr-TR')} ₺</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Turlu Kapalı Usulü Nasıl Çalışır?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Toplam {totalRounds} tur bulunur
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Her turda teklifler kapalı (gizli) olarak verilir
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Sadece kendi önceki tekliflerinizi görebilirsiniz
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Her turda iyileştirilmiş yeni teklifler verebilirsiniz
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              Son turdan sonra en düşük teklif kazanır
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
