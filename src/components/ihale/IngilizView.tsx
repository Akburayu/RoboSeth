import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Send, Trophy } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface IngilizViewProps {
  ihale: any;
  teklifler: any[];
  userRole: 'firma' | 'entegrator' | null;
  entegratorId: string | null;
  isFirmaOwner: boolean;
  onTeklifSubmit: (teklif: number) => Promise<void>;
  onRefresh: () => void;
}

export function IngilizView({
  ihale,
  teklifler,
  userRole,
  entegratorId,
  isFirmaOwner,
  onTeklifSubmit,
}: IngilizViewProps) {
  const [newTeklif, setNewTeklif] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sortedTeklifler = useMemo(() => {
    return [...teklifler].sort((a, b) => b.teklif_tutari - a.teklif_tutari);
  }, [teklifler]);

  const highestTeklif = sortedTeklifler[0]?.teklif_tutari || 0;
  const myTeklif = teklifler.find(t => t.entegrator_id === entegratorId);

  const handleSubmit = async () => {
    const teklif = parseInt(newTeklif);
    if (!teklif || teklif <= 0) return;

    if (teklif <= highestTeklif) {
      return;
    }

    setSubmitting(true);
    try {
      await onTeklifSubmit(teklif);
      setNewTeklif('');
    } finally {
      setSubmitting(false);
    }
  };

  const isActive = ihale.durum === 'aktif';
  const canBid = isActive && userRole === 'entegrator' && entegratorId;

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">En Yüksek Teklif</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {highestTeklif ? `${highestTeklif.toLocaleString('tr-TR')} ₺` : 'Henüz teklif yok'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Toplam Teklif</p>
              <p className="text-2xl font-semibold">{teklifler.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bid Input */}
      {canBid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Teklif Ver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder={highestTeklif ? `${highestTeklif + 1}'den fazla bir tutar girin` : 'Teklif tutarı (₺)'}
                  value={newTeklif}
                  onChange={(e) => setNewTeklif(e.target.value)}
                />
                {highestTeklif > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Mevcut en yüksek teklif: {highestTeklif.toLocaleString('tr-TR')} ₺ - Daha yüksek bir teklif vermelisiniz
                  </p>
                )}
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !newTeklif || parseInt(newTeklif) <= highestTeklif}
              >
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </Button>
            </div>
            {myTeklif && (
              <p className="text-sm text-muted-foreground mt-3">
                Mevcut teklifiniz: <span className="font-medium">{myTeklif.teklif_tutari.toLocaleString('tr-TR')} ₺</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Bids - Public */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tüm Teklifler (Açık Artırma)</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTeklifler.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Henüz teklif verilmedi</p>
          ) : (
            <div className="space-y-3">
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
                      {index === 0 ? <Trophy className="h-4 w-4" /> : <span className="text-sm font-medium">{index + 1}</span>}
                    </div>
                    <div>
                      <p className="font-medium">
                        {isFirmaOwner ? '******' : (teklif.entegrator_id === entegratorId ? 'Sizin Teklifiniz' : '******')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(teklif.created_at), 'dd MMM HH:mm', { locale: tr })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{teklif.teklif_tutari.toLocaleString('tr-TR')} ₺</p>
                    {teklif.entegrator_id === entegratorId && (
                      <Badge variant="outline" className="text-xs">Sizin</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
