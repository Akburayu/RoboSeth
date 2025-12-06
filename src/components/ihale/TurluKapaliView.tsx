import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Send, Trophy, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

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
}: TurluKapaliViewProps) {
  const [newTeklif, setNewTeklif] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  // Get best teklif (lowest for current round - only visible to firma)
  const currentRoundTeklifler = tekliflerByRound[currentRound] || [];
  const bestTeklif = currentRoundTeklifler.sort((a: any, b: any) => a.teklif_tutari - b.teklif_tutari)[0];

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
              Sonraki tur için bekleyiniz...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Firma View - All Bids (Hidden) */}
      {isFirmaOwner && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <EyeOff className="h-5 w-5" />
              Teklifler (Kapalı)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(tekliflerByRound).map(([round, roundTeklifler]) => (
              <div key={round} className="mb-4">
                <h4 className="font-medium mb-2">{round}. Tur - {(roundTeklifler as any[]).length} teklif</h4>
                <div className="space-y-2">
                  {(roundTeklifler as any[]).map((teklif, index) => (
                    <div 
                      key={teklif.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted-foreground flex items-center justify-center text-white">
                          {index + 1}
                        </div>
                        <p className="font-medium">******</p>
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
              Son turdan sonra en uygun teklif kazanır
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
