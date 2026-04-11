import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Building2, Users, Zap, Shield, MessageSquare, ArrowRight, LogOut, CreditCard, Eye, Search, CheckCircle2, RefreshCw, BarChart3, Clock, Scale, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Credit packages for purchase (for firma only)
const CREDIT_PACKAGES = [{
  id: 'kobi',
  nameKey: 'credits.kobiPackage',
  credits: 3,
  price: 650,
  descriptionKey: 'credits.kobiPackageDesc',
  popular: false,
  type: 'credit'
}, {
  id: 'buyuk',
  nameKey: 'credits.bigPackage',
  credits: 10,
  price: 1800,
  descriptionKey: 'credits.bigPackageDesc',
  popular: true,
  type: 'credit'
}, {
  id: 'global',
  nameKey: 'credits.globalPackage',
  credits: 20,
  price: 3000,
  descriptionKey: 'credits.globalPackageDesc',
  popular: false,
  type: 'credit'
}, {
  id: 'ihale',
  nameKey: 'credits.auctionPackage',
  credits: 1,
  price: 2000,
  descriptionKey: 'credits.auctionPackageDesc',
  popular: false,
  type: 'auction',
  unit: 'perAuction'
}];
const Index = () => {
  const navigate = useNavigate();
  const {
    t
  } = useTranslation();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const {
    user,
    userRole,
    signOut,
    loading
  } = useAuth();

  // Otomatik yönlendirme (redirect) kodu kaldırıldı: Kullanıcı giriş yapsa bile ana sayfayı görebilecek.
  const handleSwitchToLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };
  const handleSwitchToRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <SEOHead />
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32 bg-primary">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-accent/20 blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in space-y-6">
            <h1 className="mx-auto max-w-5xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-white">
              Find Right. Decide Smart. <span className="text-accent drop-shadow-md">Deliver Smooth.</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 md:text-xl leading-relaxed">
              Roboseth, endüstriyel otomasyon projelerinde fabrikalar ile sistem entegratörlerini bir araya getiren ve sürecin tamamını tek platform üzerinden yönetmeyi sağlayan yeni nesil B2B platformdur. Sadece doğru entegratörü bulmayı değil; tekliflerin kolayca karşılaştırılmasını ve projenin baştan sona tek bir yerden, şeffaf ve kontrollü şekilde yönetilmesini sağlar.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4">
              {user ? (
                <Button size="lg" onClick={() => navigate(userRole === 'firma' ? '/firma/dashboard' : '/entegrator/dashboard')} className="text-lg px-8 bg-accent hover:bg-accent/90 text-white border-0 shadow-lg shadow-accent/20">
                  {t('index.goToDashboard')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button size="lg" onClick={() => setRegisterOpen(true)} className="text-lg px-8 bg-accent hover:bg-accent/90 text-white border-0 shadow-lg shadow-accent/20">
                      Hemen Başla
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setLoginOpen(true)} className="text-lg px-8 bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-300">
                      Giriş Yap
                    </Button>
                  </div>
                  <button onClick={() => setGuestModalOpen(true)} className="text-slate-400 hover:text-white underline-offset-4 hover:underline text-sm transition-colors">
                    Üye olmadan devam et
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold md:text-4xl text-primary">Endüstriyel Otomasyonun Gizli Maliyeti</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-accent/30 transition-colors">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                <Search size={24} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Sınırlı Network</h3>
              <p className="text-slate-600 leading-relaxed">
                Güvenilir entegratör bulmak zaman alır, seçim dar bir network içinde yapılır. Referansları karşılaştırmak zordur ve doğru seçim çoğu zaman deneme-yanılma olur.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-accent/30 transition-colors">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                <RefreshCw size={24} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Dağınık Süreçler</h3>
              <p className="text-slate-600 leading-relaxed">
                Teklifler e-mail ve Excel'de, proje takibi farklı sistemlerde, iletişim ise dağınık kanallarda yürütülür.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:border-accent/30 transition-colors">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">Görünmez Gecikmeler</h3>
              <p className="text-slate-600 leading-relaxed">
                Bu parçalı durum sürecin kontrolünü zorlaştırır, gecikmeleri görünmez hale getirir ve karar almayı yavaşlatır.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Nasıl Çalışır? */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold md:text-4xl text-primary">Nasıl Çalışır?</h2>
            <div className="w-20 h-1 bg-accent mx-auto mt-6 rounded-full" />
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2 text-right order-2 md:order-1">
                <h3 className="text-2xl font-bold text-primary mb-4">1. Doğru Entegratörü Bul</h3>
                <p className="text-slate-600 text-lg">Detaylı filtreleme, geçmiş referanslar, açık veya davet usulü dijital ihale süreçleriyle projeniz için en uygun teknoloji ortağını global havuzdan nokta atışı seçin.</p>
              </div>
              <div className="shrink-0 w-24 h-24 rounded-full bg-accent/10 border-4 border-accent text-accent flex items-center justify-center order-1 md:order-2 shadow-[0_0_30px_rgba(0,174,239,0.3)] z-10 relative">
                <Search size={36} />
              </div>
              <div className="md:w-1/2 order-3 hidden md:block" />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2 order-1 hidden md:block" />
              <div className="shrink-0 w-24 h-24 rounded-full bg-accent/10 border-4 border-accent text-accent flex items-center justify-center order-2 shadow-[0_0_30px_rgba(0,174,239,0.3)] z-10 relative">
                <Scale size={36} />
              </div>
              <div className="md:w-1/2 text-left order-3">
                <h3 className="text-2xl font-bold text-primary mb-4">2. Teklifleri Topla ve Karşılaştır</h3>
                <p className="text-slate-600 text-lg">RFQ yükleme özelliği ve otomatik benchmark sistemi ile farklı teklifleri teknik ve ticari açıdan tek ekranda net bir şekilde kıyaslayın.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/2 text-right order-2 md:order-1">
                <h3 className="text-2xl font-bold text-primary mb-4">3. Projeyi Tek Platformdan Yönet</h3>
                <p className="text-slate-600 text-lg">Gantt chart destekli proje takvimi, deadline bazlı uyarılar ve şeffaf proje izleme modülleri ile sürecin her adımını merkezi olarak takip edin.</p>
              </div>
              <div className="shrink-0 w-24 h-24 rounded-full bg-accent/10 border-4 border-accent text-accent flex items-center justify-center order-1 md:order-2 shadow-[0_0_30px_rgba(0,174,239,0.3)] z-10 relative">
                <BarChart3 size={36} />
              </div>
              <div className="md:w-1/2 order-3 hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Değer Önerisi (Split Layout) */}
      <section className="py-0 flex flex-col md:flex-row">
        {/* Sol - Fabrikalar */}
        <div className="md:w-1/2 bg-slate-50 p-16 md:p-24 flex justify-end">
          <div className="max-w-md w-full">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
              <Building2 size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-primary mb-6">Fabrikalar İçin Değer</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-lg text-slate-700">
                <CheckCircle2 className="text-accent shrink-0" /> Daha geniş entegratör havuzu
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-700">
                <CheckCircle2 className="text-accent shrink-0" /> Hızlı ve veri odaklı seçim
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-700">
                <CheckCircle2 className="text-accent shrink-0" /> Kolaylaştırılmış kıyaslama (Benchmark)
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-700">
                <CheckCircle2 className="text-accent shrink-0" /> Minimize edilmiş operasyonel risk
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-700">
                <CheckCircle2 className="text-accent shrink-0" /> %100 Kontrollü ve şeffaf süreç
              </li>
            </ul>
          </div>
        </div>

        {/* Sağ - Entegratörler */}
        <div className="md:w-1/2 bg-primary p-16 md:p-24 flex justify-start">
          <div className="max-w-md w-full">
            <div className="w-16 h-16 bg-accent text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-accent/20">
              <Users size={32} />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-6">Entegratör İçin Değer</h2>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-lg text-slate-200">
                <CheckCircle2 className="text-accent shrink-0" /> Daha fazla global projeye erişim
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-200">
                <CheckCircle2 className="text-accent shrink-0" /> Dijital ihalelere anında katılım
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-200">
                <CheckCircle2 className="text-accent shrink-0" /> Net ve şeffaf Müşteri iletişimi
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-200">
                <CheckCircle2 className="text-accent shrink-0" /> Standartlaştırılmış teklif sunumu
              </li>
              <li className="flex items-center gap-3 text-lg text-slate-200">
                <CheckCircle2 className="text-accent shrink-0" /> Güçlü itibar yönetimi
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white md:text-5xl max-w-4xl mx-auto leading-tight">
            Daha geniş erişim. Daha şeffaf süreç.<br/>Daha hızlı ve kolay yönetim.
          </h2>
          <p className="mt-6 text-xl text-accent font-medium tracking-wide">
            Where automation projects start and get done.
          </p>
          
          <div className="mt-12">
            <Button size="lg" onClick={() => setRegisterOpen(true)} className="text-xl px-12 py-8 bg-accent hover:bg-accent/90 text-white rounded-full border-0 shadow-xl shadow-accent/25 hover:scale-105 transition-transform duration-300">
              Hemen Başla <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
            <LanguageSwitcher />
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RegisterModal open={registerOpen} onOpenChange={setRegisterOpen} onSwitchToLogin={handleSwitchToLogin} />
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} onSwitchToRegister={handleSwitchToRegister} />

      {/* Credit Purchase Modal */}
      <Dialog open={creditModalOpen} onOpenChange={setCreditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-firma" />
              {t('credits.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {CREDIT_PACKAGES.map(pkg => <div key={pkg.id} className={`relative p-6 rounded-xl border-2 transition-all hover:border-firma/50 hover:bg-firma/5 ${pkg.popular ? 'border-firma bg-firma/5' : 'border-border'}`}>
                {pkg.popular && <div className="absolute -top-3 left-4 px-3 py-1 bg-firma text-white text-xs font-medium rounded-full">
                    {t('credits.mostPopular')}
                  </div>}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{t(pkg.nameKey)}</div>
                    <div className="text-sm text-muted-foreground mt-1">{t(pkg.descriptionKey)}</div>
                  </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-firma">€{pkg.price}</div>
                    <div className="text-sm text-muted-foreground">
                      {pkg.type === 'auction' ? t('credits.perAuction') : `${pkg.credits} ${t('credits.credits')}`}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4 gradient-primary border-0" onClick={() => {
              setCreditModalOpen(false);
            }}>
                  {t('credits.buy')}
                </Button>
              </div>)}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {t('index.paymentNote')}
          </p>
        </DialogContent>
      </Dialog>

      {/* Guest Mode Selection Modal */}
      <Dialog open={guestModalOpen} onOpenChange={setGuestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-5 w-5 text-primary" />
              {t('index.explorePlatform')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {t('index.guestModeDesc')}
          </p>
          <div className="grid gap-4">
            <Button size="lg" variant="outline" className="h-auto p-6 flex flex-col items-center gap-2 hover:border-firma hover:bg-firma/5" onClick={() => {
            setGuestModalOpen(false);
            navigate('/firma/dashboard?guest=true');
          }}>
              <Building2 className="h-8 w-8 text-firma" />
              <span className="font-semibold text-lg">{t('index.viewAsCompany')}</span>
              <span className="text-xs text-muted-foreground">{t('index.viewAsCompanyDesc')}</span>
            </Button>
            <Button size="lg" variant="outline" className="h-auto p-6 flex flex-col items-center gap-2 hover:border-entegrator hover:bg-entegrator/5" onClick={() => {
            setGuestModalOpen(false);
            navigate('/entegrator/dashboard?guest=true');
          }}>
              <Users className="h-8 w-8 text-entegrator" />
              <span className="font-semibold text-lg">{t('index.viewAsIntegrator')}</span>
              <span className="text-xs text-muted-foreground">{t('index.viewAsIntegratorDesc')}</span>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            {t('index.guestModeNote')}
          </p>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;