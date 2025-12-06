import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bell, 
  BellOff,
  Loader2,
  MessageSquare,
  Send,
  ArrowLeft,
  Check,
  FileText,
  User,
  DollarSign,
  Calendar,
  MapPin
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface ProposalDetails {
  teklif_tutari: number;
  mesaj: string | null;
  created_at: string;
  ilan: {
    baslik: string;
    aciklama: string | null;
    butce_min: number | null;
    butce_max: number | null;
    hizmet_verilen_iller: string | null;
  } | null;
  entegrator: {
    entegrator_adi: string;
    konum: string | null;
  } | null;
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [proposalDetails, setProposalDetails] = useState<ProposalDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    fetchNotifications();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast({
            title: (payload.new as Notification).title,
            description: (payload.new as Notification).message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading, navigate, toast]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
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

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error: any) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      toast({
        title: 'Tümü Okundu',
        description: 'Tüm bildirimler okundu olarak işaretlendi.',
      });
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_proposal':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      case 'proposal_sent':
        return <Send className="h-5 w-5 text-entegrator" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    setSelectedNotification(notification);
    
    // If it's a proposal notification, fetch the details
    if ((notification.type === 'new_proposal' || notification.type === 'proposal_sent') && notification.related_id) {
      setDetailsLoading(true);
      try {
        const { data: teklif, error } = await supabase
          .from('teklifler')
          .select(`
            teklif_tutari,
            mesaj,
            created_at,
            ilan_id,
            entegrator_id
          `)
          .eq('id', notification.related_id)
          .single();

        if (error) throw error;

        if (teklif) {
          // Fetch ilan details
          const { data: ilan } = await supabase
            .from('ilanlar')
            .select('baslik, aciklama, butce_min, butce_max, hizmet_verilen_iller')
            .eq('id', teklif.ilan_id)
            .single();

          // Fetch entegrator details
          const { data: entegrator } = await supabase
            .from('entegrator')
            .select('entegrator_adi, konum')
            .eq('id', teklif.entegrator_id)
            .single();

          setProposalDetails({
            teklif_tutari: teklif.teklif_tutari,
            mesaj: teklif.mesaj,
            created_at: teklif.created_at,
            ilan,
            entegrator
          });
        }
      } catch (error: any) {
        console.error('Error fetching proposal details:', error);
      } finally {
        setDetailsLoading(false);
      }
    }
  };

  const closeDetails = () => {
    setSelectedNotification(null);
    setProposalDetails(null);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const dashboardPath = userRole === 'firma' ? '/firma/dashboard' : '/entegrator/dashboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(dashboardPath)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Bell className="h-6 w-6" />
                  Bildirimler
                  {unreadCount > 0 && (
                    <Badge variant="destructive">{unreadCount}</Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tüm bildirimlerinizi buradan görüntüleyebilirsiniz
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                <Check className="h-4 w-4" />
                Tümünü Okundu İşaretle
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Henüz bildiriminiz yok.</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`transition-all cursor-pointer hover:shadow-md ${
                    !notification.is_read 
                      ? 'border-primary/30 bg-primary/5' 
                      : 'border-border'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {formatDate(notification.created_at)}
                          </span>
                        </div>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-primary mt-2">Detayları görüntülemek için tıklayın →</p>
                      </div>
                      {!notification.is_read && (
                        <div className="shrink-0">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Details Modal */}
            <Dialog open={!!selectedNotification} onOpenChange={closeDetails}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {selectedNotification && getNotificationIcon(selectedNotification.type)}
                    {selectedNotification?.title}
                  </DialogTitle>
                </DialogHeader>
                
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : proposalDetails ? (
                  <div className="space-y-4">
                    {/* İlan Bilgileri */}
                    {proposalDetails.ilan && (
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <FileText className="h-4 w-4" />
                          İlan Bilgileri
                        </div>
                        <h4 className="font-semibold">{proposalDetails.ilan.baslik}</h4>
                        {proposalDetails.ilan.aciklama && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {proposalDetails.ilan.aciklama}
                          </p>
                        )}
                        {(proposalDetails.ilan.butce_min || proposalDetails.ilan.butce_max) && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Bütçe: </span>
                            <span className="font-medium">
                              {proposalDetails.ilan.butce_min?.toLocaleString('tr-TR')} - {proposalDetails.ilan.butce_max?.toLocaleString('tr-TR')} TL
                            </span>
                          </p>
                        )}
                        {proposalDetails.ilan.hizmet_verilen_iller && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{proposalDetails.ilan.hizmet_verilen_iller}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Entegratör Bilgileri - Firma için gizli */}
                    {userRole === 'firma' && proposalDetails.entegrator && (
                      <div className="bg-muted/30 rounded-lg p-4 space-y-2 border border-dashed border-muted-foreground/30">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <User className="h-4 w-4" />
                          Entegratör Bilgileri
                        </div>
                        <p className="font-semibold text-muted-foreground">******</p>
                        <p className="text-xs text-muted-foreground">
                          Entegratör bilgilerini görmek için Dashboard'dan iletişim bilgilerini açın.
                        </p>
                      </div>
                    )}

                    {/* Entegratör Bilgileri - Entegratör kendisi için görünür */}
                    {userRole === 'entegrator' && proposalDetails.entegrator && (
                      <div className="bg-entegrator/10 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <User className="h-4 w-4" />
                          Entegratör Bilgileri
                        </div>
                        <p className="font-semibold">{proposalDetails.entegrator.entegrator_adi}</p>
                        {proposalDetails.entegrator.konum && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{proposalDetails.entegrator.konum}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Teklif Detayları */}
                    <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <DollarSign className="h-4 w-4" />
                        Teklif Detayları
                      </div>
                      <p className="text-xl font-bold text-primary">
                        {proposalDetails.teklif_tutari?.toLocaleString('tr-TR')} TL
                      </p>
                      {proposalDetails.mesaj && (
                        <div className="bg-background rounded p-3 mt-2">
                          <p className="text-sm italic">"{proposalDetails.mesaj}"</p>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(proposalDetails.created_at).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <p className="text-muted-foreground">{selectedNotification?.message}</p>
                    <p className="text-xs text-muted-foreground mt-4">
                      {selectedNotification && formatDate(selectedNotification.created_at)}
                    </p>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
}
