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
import { Progress } from '@/components/ui/progress';
import { Building2, FileText, Info, CreditCard, ArrowLeft, ArrowRight, Upload, Check, Loader2, X } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type FirmaOlcegi = Database['public']['Enums']['firma_olcegi'];

interface PlanInfo {
  name: string;
  credits: number;
  price: number;
  features: string[];
}

// Only 2 packages available for registration (Global is only for purchase)
type AvailablePackage = 'orta' | 'buyuk';

interface PackageInfo {
  name: string;
  credits: number;
  price: number;
  description: string;
  dbValue: FirmaOlcegi;
}

const getPackages = (t: (key: string) => string): Record<AvailablePackage, PackageInfo> => ({
  orta: { 
    name: t('credits.smePackage'), 
    credits: 3, 
    price: 650,
    description: t('credits.smePackageDesc'),
    dbValue: 'orta'
  },
  buyuk: { 
    name: t('credits.largePackage'), 
    credits: 10, 
    price: 1800,
    description: t('credits.largePackageDesc'),
    dbValue: 'buyuk'
  },
});

// Keep PLANS for backward compatibility
const PLANS: Record<FirmaOlcegi, { credits: number }> = {
  kucuk: { credits: 1 },
  orta: { credits: 3 },
  buyuk: { credits: 10 },
  global: { credits: 20 },
};

interface UploadedFile {
  file: File | null;
  path: string | null;
  uploading: boolean;
}

export default function FirmaRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, userRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Firma Ölçeği
  const [firmaOlcegi, setFirmaOlcegi] = useState<FirmaOlcegi | null>(null);

  // Step 2: Firma Adı, E-posta ve Belgeler
  const [firmaAdi, setFirmaAdi] = useState('');
  const [email, setEmail] = useState('');
  const [documents, setDocuments] = useState<{
    ticaret_sicil: UploadedFile;
    faaliyet_belgesi: UploadedFile;
    imza_sirkuleri: UploadedFile;
    vergi_levhasi: UploadedFile;
  }>({
    ticaret_sicil: { file: null, path: null, uploading: false },
    faaliyet_belgesi: { file: null, path: null, uploading: false },
    imza_sirkuleri: { file: null, path: null, uploading: false },
    vergi_levhasi: { file: null, path: null, uploading: false },
  });

  // Step 3: Hakkında
  const [tanitimYazisi, setTanitimYazisi] = useState('');

  // Step 4: Plan seçimi
  const [selectedPlan, setSelectedPlan] = useState<FirmaOlcegi | null>(null);

  // Check if user is logged in and has firma role
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast({
        title: t('auth.loginRequired'),
        description: t('auth.loginRequiredDesc'),
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    if (userRole && userRole !== 'firma') {
      toast({
        title: t('auth.accessDenied'),
        description: t('auth.firmaOnly'),
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, userRole, authLoading, navigate, toast, t]);

  // Set default plan based on firma ölçeği
  useEffect(() => {
    if (firmaOlcegi) {
      setSelectedPlan(firmaOlcegi);
    }
  }, [firmaOlcegi]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: keyof typeof documents
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t('register.invalidFileType'),
        description: t('register.invalidFileTypeDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t('register.fileTooLarge'),
        description: t('register.fileTooLargeDesc'),
        variant: 'destructive',
      });
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: { ...prev[docType], file, uploading: true },
    }));

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${docType}_${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('firma-documents')
      .upload(filePath, file);

    if (error) {
      toast({
        title: t('register.uploadError'),
        description: error.message,
        variant: 'destructive',
      });
      setDocuments((prev) => ({
        ...prev,
        [docType]: { file: null, path: null, uploading: false },
      }));
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [docType]: { file, path: filePath, uploading: false },
    }));

    toast({
      title: t('register.fileUploaded'),
      description: `${file.name} ${t('register.fileUploadedDesc')}`,
    });
  };

  const removeDocument = async (docType: keyof typeof documents) => {
    const doc = documents[docType];
    if (doc.path) {
      await supabase.storage.from('firma-documents').remove([doc.path]);
    }
    setDocuments((prev) => ({
      ...prev,
      [docType]: { file: null, path: null, uploading: false },
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!firmaOlcegi) {
          toast({
            title: t('register.selectRequired'),
            description: t('register.selectFirmaScale'),
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 2:
        if (!firmaAdi.trim() || firmaAdi.length < 2) {
          toast({
            title: t('register.invalidFirmaName'),
            description: t('register.invalidFirmaNameDesc'),
            variant: 'destructive',
          });
          return false;
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast({
            title: t('register.invalidEmail'),
            description: t('register.invalidEmailDesc'),
            variant: 'destructive',
          });
          return false;
        }
        // Check all documents are uploaded
        const allDocsUploaded = Object.values(documents).every((doc) => doc.path !== null);
        if (!allDocsUploaded) {
          toast({
            title: t('register.missingDocuments'),
            description: t('register.missingDocumentsDesc'),
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 3:
        if (tanitimYazisi.length < 50) {
          toast({
            title: t('register.insufficientContent'),
            description: t('register.aboutMinLength'),
            variant: 'destructive',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!user || !firmaOlcegi || !selectedPlan) return;

    setLoading(true);

    try {
      // Get credit amount from selected plan
      const credits = PLANS[selectedPlan].credits;

      // Insert firma record
      const { error } = await supabase.from('firma').insert({
        user_id: user.id,
        firma_adi: firmaAdi,
        firma_olcegi: firmaOlcegi,
        firma_tanitim_yazisi: tanitimYazisi,
        belgesi1: documents.ticaret_sicil.path,
        belgesi2: documents.faaliyet_belgesi.path,
        belgesi3: documents.imza_sirkuleri.path,
        kredi: credits,
        email: email,
      });

      if (error) throw error;

      toast({
        title: t('register.registrationComplete'),
        description: `${t('register.welcomeMessage')} ${credits} ${t('register.creditsAdded')}`,
      });

      navigate('/firma/dashboard');
    } catch (error: any) {
      toast({
        title: t('register.registrationError'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

const steps = [
    { number: 1, title: t('register.firmaPackage'), icon: Building2 },
    { number: 2, title: t('register.firmaInfo'), icon: FileText },
    { number: 3, title: t('register.about'), icon: Info },
    { number: 4, title: t('register.membershipPlan'), icon: CreditCard },
  ];

  const progressValue = ((currentStep - 1) / 3) * 100;

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-firma/5 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-firma" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-firma/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-firma to-firma/70 bg-clip-text text-transparent">
            {t('register.firmaTitle')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('register.completeSteps')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex flex-col items-center ${
                  currentStep >= step.number ? 'text-firma' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    currentStep > step.number
                      ? 'bg-firma text-white'
                      : currentStep === step.number
                      ? 'bg-firma/20 border-2 border-firma'
                      : 'bg-muted'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="border-firma/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return StepIcon ? <StepIcon className="h-5 w-5 text-firma" /> : null;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
<CardDescription>
              {currentStep === 1 && t('register.selectPackage')}
              {currentStep === 2 && t('register.fillFirmaInfo')}
              {currentStep === 3 && t('register.addAbout')}
              {currentStep === 4 && t('register.confirmPlan')}
            </CardDescription>
          </CardHeader>
          <CardContent>
{/* Step 1: Firma Paketi */}
            {currentStep === 1 && (
              <div className="grid gap-4">
                {(Object.keys(getPackages(t)) as AvailablePackage[]).map((pkg) => {
                  const packages = getPackages(t);
                  return (
                    <button
                      key={pkg}
                      onClick={() => setFirmaOlcegi(packages[pkg].dbValue)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        firmaOlcegi === packages[pkg].dbValue
                          ? 'border-firma bg-firma/10 shadow-lg'
                          : 'border-border hover:border-firma/50 hover:bg-firma/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{packages[pkg].name}</div>
                          <div className="text-2xl font-bold text-firma mt-1">€{packages[pkg].price}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-firma font-bold text-xl">{packages[pkg].credits} {t('common.credit')}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-3">
                        {packages[pkg].description}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Firma Adı, E-posta ve Belgeler */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="firmaAdi">{t('register.firmaNameLabel')} *</Label>
                  <Input
                    id="firmaAdi"
                    value={firmaAdi}
                    onChange={(e) => setFirmaAdi(e.target.value)}
                    placeholder={t('register.firmaNamePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('register.emailLabel')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('register.emailPlaceholder')}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('register.emailNote')}
                  </p>
                </div>

                <div className="space-y-4">
                  <Label>{t('register.documentsOptional')}</Label>
                  
                  {[
                    { key: 'ticaret_sicil', label: t('register.ticaretSicil') },
                    { key: 'faaliyet_belgesi', label: t('register.faaliyetBelgesi') },
                    { key: 'imza_sirkuleri', label: t('register.imzaSirkuleri') },
                    { key: 'vergi_levhasi', label: t('register.vergiLevhasi') },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{label}</div>
                        {documents[key as keyof typeof documents].file ? (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            {documents[key as keyof typeof documents].file?.name}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground mt-1">
                            {t('register.fileFormats')}
                          </div>
                        )}
                      </div>
                      
                      {documents[key as keyof typeof documents].uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-firma" />
                      ) : documents[key as keyof typeof documents].file ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeDocument(key as keyof typeof documents)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      ) : (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, key as keyof typeof documents)}
                            className="hidden"
                          />
                          <div className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors">
                            <Upload className="h-4 w-4" />
                            {t('register.upload')}
                          </div>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Hakkında */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tanitim">{t('register.aboutLabel')} *</Label>
                  <Textarea
                    id="tanitim"
                    value={tanitimYazisi}
                    onChange={(e) => setTanitimYazisi(e.target.value)}
                    placeholder={t('register.aboutPlaceholder')}
                    rows={6}
                  />
                  <div className={`text-xs ${tanitimYazisi.length < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {tanitimYazisi.length} / 50 {t('register.aboutMinChars')}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Üyelik Planı */}
            {currentStep === 4 && selectedPlan && (
              <div className="space-y-6">
                <div className="p-6 border-2 border-firma rounded-xl bg-firma/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold text-firma">
                        {selectedPlan === 'orta' ? t('credits.smePackage') : selectedPlan === 'buyuk' ? t('credits.largePackage') : t('credits.globalPackage')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('register.selectedPlan')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{PLANS[selectedPlan].credits}</div>
                      <div className="text-sm text-muted-foreground">{t('common.credit')}</div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-firma" />
                      {PLANS[selectedPlan].credits} {t('common.credit')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-firma" />
                      {t('register.allFeaturesIncluded')}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-firma" />
                      {t('register.prioritySupport')}
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-sm text-muted-foreground">
                    {t('register.paymentNotActive')}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('nav.home')}
            </Button>
          )}

          {currentStep < 4 ? (
            <Button onClick={handleNext} className="bg-firma hover:bg-firma/90">
              {t('common.next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="bg-firma hover:bg-firma/90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.saving')}...
                </>
              ) : (
                <>
                  {t('common.completeRegistration')}
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
