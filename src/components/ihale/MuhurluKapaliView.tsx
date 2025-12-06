import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Send, Trophy, Lock, Unlock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface MuhurluKapaliViewProps {
  ihale: any;
  teklifler: any[];
  userRole: 'firma' | 'entegrator' | null;
  entegratorId: string | null;
  isFirmaOwner: boolean;
  onTeklifSubmit: (teklif: number) => Promise<void>;
  onRefresh: () => void;
}

export function MuhurluKapaliView({
  ihale,
  teklifler,
  userRole,
  entegratorId,
  isFirmaOwner,
  onTeklifSubmit,
}: MuhurluKapaliViewProps) {
  const [newTeklif, setNewTeklif] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myTeklif = teklifler.find(t => t.entegrator_id === entegratorId);
  const isCompleted = ihale.durum === 'tamamlandi';

  // Sort by lowest for display when completed
  const sortedTeklifler = useMemo(() => {
    return [...teklifler].sort((a, b) => a.teklif_tutari - b.teklif_tutari);
  }, [teklifler]);

  const handleSubmit = async () => {
    const teklif = parseInt(newTeklif);
    if (!teklif || teklif <= 0) return;

    setSubmitting(true);
    try {
      await onTeklifSubmit(teklif);
      setNewTeklif('');
    } finally {
      setSubmitting(false);
    }
  };

  const isActive = ihale.durum === 'aktif';
  const canBid = isActive && userRole === 'entegrator' && entegratorId && !myTeklif;

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Durum</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                {isCompleted ? (
                  <>
                    <Unlock className="h-6 w-6" />
                    Mühürler Açıldı
                  </>
                ) : (
                  <>
                    <Lock className="h-6 w-6" />
                    Teklifler Mühürlü
                  </>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Toplam Teklif</p>
              <p className="text-3xl font-bold">{teklifler.length}</p>
            </div>
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
            {myTeklif && ihale.kazanan_entegrator_id === entegratorId && (
              <Badge className="mt-2" variant="default">Kazanan Sizsiniz!</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bid Input */}
      {canBid && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Mühürlü Teklifinizi Verin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Önemli!</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Tek seferlik teklif hakkınız var. Değiştirilemez veya geri alınamaz.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Teklif tutarı (₺)"
                  value={newTeklif}
                  onChange={(e) => setNewTeklif(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !newTeklif}
              >
                <Send className="h-4 w-4 mr-2" />
                Mühürlü Gönder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already submitted */}
      {myTeklif && isActive && (
        <Card className="bg-muted">
          <CardContent className="py-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-purple-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Teklifiniz Mühürlendi</h3>
            <p className="text-muted-foreground">
              Teklifiniz: <span className="font-bold">{myTeklif.teklif_tutari.toLocaleString('tr-TR')} ₺</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              İhale sonuçlanana kadar mühürlü kalacaktır.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sealed Bids Count (Before completion) */}
      {!isCompleted && teklifler.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Mühürlü Teklifler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {teklifler.map((_, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-center p-4 rounded-lg border bg-purple-50 dark:bg-purple-950"
                >
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {teklifler.length} mühürlü teklif bekliyor
            </p>
          </CardContent>
        </Card>
      )}

      {/* Revealed Bids (After completion) */}
      {isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              Açılan Teklifler
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Mühürlü Kapalı Usulü Nasıl Çalışır?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              Her katılımcı tek seferlik kapalı teklif verir
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              Kimse kimsenin teklifini göremez
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              Süre sonunda tüm tekliflerin mühürleri açılır
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              En uygun teklif kazanır - pazarlık yoktur
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
