import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import NotificationBell from '@/components/NotificationBell';
import { 
  ArrowLeft,
  Building2,
  CreditCard,
  Save,
  Loader2,
  Award,
  FileText,
  CheckCircle2
} from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Firma = Database['public']['Tables']['firma']['Row'];
type FirmaOlcegi = Database['public']['Enums']['firma_olcegi'];

const getOlcekLabels = (t: (key: string) => string): Record<FirmaOlcegi, string> => ({
  kucuk: t('profile.scaleSmall'),
  orta: t('profile.scaleMedium'),
  buyuk: t('profile.scaleLarge'),
  global: t('profile.scaleGlobal'),
});

const PLAN_INFO: Record<FirmaOlcegi, { name: string; credits: number }> = {
  kucuk: { name: 'Basic', credits: 10 },
  orta: { name: 'Standard', credits: 30 },
  buyuk: { name: 'Pro', credits: 80 },
  global: { name: 'Enterprise', credits: 200 },
};

export default function FirmaProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [firma, setFirma] = useState<Firma | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [tanitimYazisi, setTanitimYazisi] = useState('');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }

    if (userRole && userRole !== 'firma') {
      navigate('/');
      return;
    }

    fetchFirmaProfile();
  }, [user, userRole, authLoading, navigate]);

  const fetchFirmaProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('firma')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setFirma(data[0]);
        setTanitimYazisi(data[0].firma_tanitim_yazisi || '');
      }
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!firma) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('firma')
        .update({
          firma_tanitim_yazisi: tanitimYazisi.trim() || null,
        })
        .eq('id', firma.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('profile.profileUpdated'),
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const planInfo = firma?.firma_olcegi ? PLAN_INFO[firma.firma_olcegi] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-firma" />
      </div>
    );
  }

  if (!firma) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">{t('profile.firmaNotFound')}</p>
          <Button onClick={() => navigate('/firma/register')} className="mt-4">
            {t('profile.createFirmaRegistration')}
          </Button>
        </Card>
      </div>
    );
  }

  const OLCEK_LABELS = getOlcekLabels(t);

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
                onClick={() => navigate('/firma/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-firma flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  {t('profile.firmaProfile')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('profile.editProfile')}
                </p>
              </div>
            </div>
            <NotificationBell />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Kredi ve Plan Kartı */}
          <Card className="border-firma/20 bg-gradient-to-br from-firma/5 to-firma/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-firma">
                <CreditCard className="h-5 w-5" />
                {t('credits.creditAndPlan')}
              </CardTitle>
              <CardDescription>
                {t('profile.currentPlanDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* Plan Info */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t('profile.membershipPlan')}</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <Award className="h-4 w-4 mr-1" />
                      {planInfo?.name || 'Standart'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('profile.companyScale')}: {OLCEK_LABELS[firma.firma_olcegi]}
                  </p>
                </div>

                {/* Credit Balance */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t('credits.creditBalance')}</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-firma">
                      {firma.kredi || 0}
                    </span>
                    <span className="text-muted-foreground">{t('common.credit')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('credits.startingCredits')}: {planInfo?.credits || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Firma Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('profile.companyInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Firma Adı (Read-only) */}
              <div className="space-y-2">
                <Label>{t('register.firmaNameLabel')}</Label>
                <Input 
                  value={firma.firma_adi} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {t('register.firmaNameReadOnly')}
                </p>
              </div>

              <Separator />

              {/* Firma Tanıtım Yazısı */}
              <div className="space-y-2">
                <Label htmlFor="tanitim">{t('register.aboutLabel')}</Label>
                <Textarea
                  id="tanitim"
                  value={tanitimYazisi}
                  onChange={(e) => setTanitimYazisi(e.target.value)}
                  placeholder={t('register.aboutPlaceholder')}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {t('register.aboutNote')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Belgeler */}
          <Card>
            <CardHeader>
              <CardTitle>{t('register.uploadedDocuments')}</CardTitle>
              <CardDescription>
                {t('profile.documentsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {firma.belgesi1 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{t('register.ticaretSicil')}</span>
                  </div>
                )}
                {firma.belgesi2 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{t('register.faaliyetBelgesi')}</span>
                  </div>
                )}
                {firma.belgesi3 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{t('register.imzaSirkuleri')}</span>
                  </div>
                )}
                {(firma as any).belgesi4 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{t('register.vergiLevhasi')}</span>
                  </div>
                )}
                {!firma.belgesi1 && !firma.belgesi2 && !firma.belgesi3 && !(firma as any).belgesi4 && (
                  <p className="text-sm text-muted-foreground">{t('register.noDocuments')}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-firma hover:bg-firma/90 gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('common.saving')}...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t('register.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
