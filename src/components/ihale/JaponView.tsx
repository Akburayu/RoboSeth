import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, CheckCircle, XCircle, Trophy, Clock, SkipForward, AlertCircle } from "lucide-react";
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
  userRole,
  entegratorId,
  isFirmaOwner,
  onRefresh,
}: JaponViewProps) {
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [advancingRound, setAdvancingRound] = useState(false);
  const [endingAuction, setEndingAuction] = useState(false);

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

  // Check if all active participants confirmed this round
  const allConfirmed = activeParticipants.length > 0 && 
    activeParticipants.every(p => p.son_onay_turu === currentRound);

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
      
      // Check if only one participant left after withdrawal
      const remainingActive = activeParticipants.filter(p => p.id !== myParticipation.id);
      if (remainingActive.length === 1 && participants.length > 1) {
        // Auto-complete auction
        await completeAuctionWithWinner(remainingActive[0].entegrator_id);
      }
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

  const handleAdvanceRound = async () => {
    setAdvancingRound(true);
    try {
      // Eliminate participants who didn't confirm
      const toEliminate = activeParticipants.filter(p => p.son_onay_turu < currentRound);
      
      for (const p of toEliminate) {
        await supabase
          .from('ihale_katilimcilar')
          .update({ aktif: false })
          .eq('id', p.id);
      }

      // Calculate new active count
      const newActiveCount = activeParticipants.length - toEliminate.length;
      
      if (newActiveCount === 1) {
        // Find the winner
        const winner = activeParticipants.find(p => p.son_onay_turu === currentRound);
        if (winner) {
          await completeAuctionWithWinner(winner.entegrator_id);
        }
      } else if (newActiveCount === 0) {
        // No one left - close without winner
        await supabase
          .from('ihaleler')
          .update({ durum: 'tamamlandi' })
          .eq('id', ihale.id);
        
        toast({
          title: "İhale Sonuçlandı",
          description: "Tüm katılımcılar çekildi, kazanan yok.",
        });
        onRefresh();
      } else {
        // Advance to next round
        const newPrice = currentPrice + priceStep;
        await supabase
          .from('ihaleler')
          .update({ 
            mevcut_tur: currentRound + 1,
            mevcut_fiyat: newPrice
          })
          .eq('id', ihale.id);

        toast({
          title: "Tur İlerledi",
          description: `${currentRound + 1}. tura geçildi. Yeni fiyat: ${newPrice.toLocaleString('tr-TR')} ₺`,
        });
        
        fetchParticipants();
        onRefresh();
      }
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

  const completeAuctionWithWinner = async (winnerId: string) => {
    setEndingAuction(true);
    try {
      // Update auction with winner
      await supabase
        .from('ihaleler')
        .update({
          durum: 'tamamlandi',
          kazanan_entegrator_id: winnerId,
          kazanan_teklif: currentPrice,
        })
        .eq('id', ihale.id);

      // Insert final bid record
      await supabase
        .from('ihale_teklifleri')
        .insert({
          ihale_id: ihale.id,
          entegrator_id: winnerId,
          teklif_tutari: currentPrice,
          durum: 'kazandi',
        });

      toast({
        title: "İhale Tamamlandı",
        description: `Kazanan belirlendi: ${currentPrice.toLocaleString('tr-TR')} ₺`,
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

  const handleEndAuctionManually = async () => {
    if (activeParticipants.length === 1) {
      await completeAuctionWithWinner(activeParticipants[0].entegrator_id);
    } else if (activeParticipants.length > 1) {
      // Multiple participants - pick the one with highest confirmed round
      const sorted = [...activeParticipants].sort((a, b) => (b.son_onay_turu || 0) - (a.son_onay_turu || 0));
      await completeAuctionWithWinner(sorted[0].entegrator_id);
    } else {
      // No participants
      await supabase
        .from('ihaleler')
        .update({ durum: 'tamamlandi' })
        .eq('id', ihale.id);
      
      toast({
        title: "İhale Sonuçlandı",
        description: "Kazanan bulunamadı.",
      });
      onRefresh();
    }
  };

  const isActive = ihale.durum === 'aktif';
  const isCompleted = ihale.durum === 'tamamlandi';
  const canJoin = isActive && userRole === 'entegrator' && entegratorId && !myParticipation;
  const canConfirm = isActive && isParticipating && !hasConfirmedThisRound;

  // Check for winner (completed auction or single active participant)
  const hasWinner = ihale.kazanan_entegrator_id || (activeParticipants.length === 1 && participants.length > 1);
  const winner = hasWinner ? (activeParticipants[0] || null) : null;

  return (
    <div className="space-y-4">
      {/* Winner Banner */}
      {(isCompleted || winner) && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardContent className="py-6 text-center">
            <Trophy className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-green-600 mb-2">İhale Sonuçlandı!</h3>
            {ihale.kazanan_teklif && (
              <p className="text-lg mb-2">
                Kazanan Fiyat: <span className="font-bold">{ihale.kazanan_teklif.toLocaleString('tr-TR')} ₺</span>
              </p>
            )}
            {(winner?.entegrator_id === entegratorId || ihale.kazanan_entegrator_id === entegratorId) && (
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

      {/* Firma Controls - Advance Round */}
      {isFirmaOwner && isActive && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <SkipForward className="h-5 w-5" />
              İhale Yönetimi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Round status info */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Bu tur onaylayan:</span>
                <Badge variant={allConfirmed ? "default" : "secondary"}>
                  {activeParticipants.filter(p => p.son_onay_turu === currentRound).length} / {activeParticipants.length}
                </Badge>
              </div>
              {!allConfirmed && activeParticipants.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Onaylamayan katılımcılar bir sonraki turda elenecek
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleAdvanceRound}
                disabled={advancingRound || activeParticipants.length === 0}
                className="h-12"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                {advancingRound ? 'İşleniyor...' : 'Sonraki Tura Geç'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndAuctionManually}
                disabled={endingAuction}
                className="h-12"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {endingAuction ? 'Sonlandırılıyor...' : 'İhaleyi Bitir'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                <p className="text-sm text-muted-foreground">Firma yeni tura geçene kadar bekleyiniz...</p>
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
                        {participant.son_onay_turu === currentRound && participant.aktif && (
                          <CheckCircle className="inline h-3 w-3 ml-1 text-green-500" />
                        )}
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
              Onaylamayan veya çekilen katılımcılar elenir
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
