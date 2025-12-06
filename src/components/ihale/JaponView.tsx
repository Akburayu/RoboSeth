import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, XCircle, Trophy, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JaponViewProps {
  ihale: any;
  teklifler: any[];
  userRole: 'firma' | 'entegrator' | null;
  entegratorId: string | null;
  isFirmaOwner: boolean;
  onTeklifSubmit: (teklif: number) => Promise<void>;
  onRefresh: () => void;
}

interface Participant {
  id: string;
  entegrator_id: string;
  aktif: boolean;
  son_onay_turu: number;
}

export function JaponView({
  ihale,
  teklifler,
  userRole,
  entegratorId,
  isFirmaOwner,
  onTeklifSubmit,
  onRefresh,
}: JaponViewProps) {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const currentRound = ihale.mevcut_tur || 1;
  const startingPrice = ihale.baslangic_fiyati || 50000;
  const priceStep = ihale.fiyat_adimi || 1000;
  const currentPrice = startingPrice + ((currentRound - 1) * priceStep);

  useEffect(() => {
    fetchParticipants();
    
    const channel = supabase
      .channel(`japon-${ihale.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ihale_katilimcilar',
          filter: `ihale_id=eq.${ihale.id}`,
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ihale.id]);

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from('ihale_katilimcilar')
      .select('*')
      .eq('ihale_id', ihale.id);

    if (!error && data) {
      setParticipants(data);
    }
  };

  const activeParticipants = participants.filter(p => p.aktif);
  const myParticipation = participants.find(p => p.entegrator_id === entegratorId);
  const isParticipating = myParticipation?.aktif;
  const hasConfirmedThisRound = myParticipation?.son_onay_turu === currentRound;

  const handleJoin = async () => {
    if (!entegratorId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('ihale_katilimcilar')
        .insert({
          ihale_id: ihale.id,
          entegrator_id: entegratorId,
          aktif: true,
          son_onay_turu: 0,
        });

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "İhaleye katıldınız.",
      });

      fetchParticipants();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Katılım başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRound = async () => {
    if (!entegratorId || !myParticipation) return;

    setConfirming(true);
    try {
      const { error } = await supabase
        .from('ihale_katilimcilar')
        .update({ son_onay_turu: currentRound })
        .eq('id', myParticipation.id);

      if (error) throw error;

      toast({
        title: "Onaylandı",
        description: `${currentRound}. tur için onayınız alındı.`,
      });

      fetchParticipants();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Onay başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleWithdraw = async () => {
    if (!entegratorId || !myParticipation) return;

    setWithdrawing(true);
    try {
      const { error } = await supabase
        .from('ihale_katilimcilar')
        .update({ aktif: false })
        .eq('id', myParticipation.id);

      if (error) throw error;

      toast({
        title: "Çekildiniz",
        description: "İhaleden çekildiniz.",
      });

      fetchParticipants();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message || "Çekilme başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const isActive = ihale.durum === 'aktif';
  const canJoin = isActive && userRole === 'entegrator' && entegratorId && !myParticipation;
  const canConfirm = isActive && isParticipating && !hasConfirmedThisRound;

  // Check for winner
  const winner = activeParticipants.length === 1 && participants.length > 1 ? activeParticipants[0] : null;

  return (
    <div className="space-y-4">
      {/* Winner Banner */}
      {winner && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="py-6 text-center">
            <Trophy className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">İhale Sonuçlandı!</h3>
            <p className="text-lg">
              Son kalan katılımcı ihaleyi kazandı!
            </p>
            {winner.entegrator_id === entegratorId && (
              <Badge className="mt-2" variant="default">Kazanan Sizsiniz!</Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* Round Status */}
      <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Mevcut Tur</p>
              <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                {currentRound}. Tur
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Aktif Katılımcı</p>
              <p className="text-4xl font-bold">{activeParticipants.length}</p>
            </div>
          </div>
          
          {isActive && (
            <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <div className="text-center mb-2">
                <p className="text-sm font-medium">
                  Mevcut Fiyat: <span className="font-bold text-lg">{currentPrice.toLocaleString('tr-TR')} ₺</span>
                </p>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Başlangıç: {startingPrice.toLocaleString('tr-TR')} ₺</span>
                <span>Her turda +{priceStep.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Join Button */}
      {canJoin && (
        <Card>
          <CardContent className="py-6">
            <Button 
              className="w-full h-12"
              onClick={handleJoin}
              disabled={loading}
            >
              <Users className="h-5 w-5 mr-2" />
              {loading ? 'Katılınıyor...' : 'İhaleye Katıl'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Round Actions */}
      {isParticipating && isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {currentRound}. Tur - Devam Ediyor Musunuz?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasConfirmedThisRound ? (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <p className="text-lg font-medium text-green-600">Bu tur için onayınız alındı</p>
                <p className="text-sm text-muted-foreground">Diğer katılımcıların cevabı bekleniyor...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="default"
                  className="h-16"
                  onClick={handleConfirmRound}
                  disabled={confirming}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {confirming ? 'Onaylanıyor...' : 'Devam Ediyorum'}
                </Button>
                <Button 
                  variant="destructive"
                  className="h-16"
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  {withdrawing ? 'Çekiliniyor...' : 'Çekiliyorum'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Participants List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Katılımcılar</CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Henüz katılımcı yok</p>
          ) : (
            <div className="space-y-2">
              {participants.map((participant, index) => (
                <div 
                  key={participant.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    participant.aktif 
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                      : 'bg-muted opacity-50'
                  } ${participant.entegrator_id === entegratorId ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      participant.aktif ? 'bg-green-500 text-white' : 'bg-muted-foreground text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {participant.entegrator_id === entegratorId ? 'Siz' : `Katılımcı ${index + 1}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Son onay: {participant.son_onay_turu}. tur
                      </p>
                    </div>
                  </div>
                  <Badge variant={participant.aktif ? 'default' : 'secondary'}>
                    {participant.aktif ? 'Aktif' : 'Elendi'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Japon Usulü Nasıl Çalışır?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              Her turda fiyat {priceStep.toLocaleString('tr-TR')} ₺ artar
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              Her turda katılımcılardan devam edip etmeyecekleri sorulur
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              "Çekiliyorum" diyen katılımcılar elenir
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">•</span>
              Son kalan katılımcı ihaleyi o anki fiyattan kazanır
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
