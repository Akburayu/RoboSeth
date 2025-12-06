import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { useAuth } from '@/hooks/useAuth';
import { SEOHead } from '@/components/SEOHead';
import { Building2, Users, Zap, Shield, MessageSquare, ArrowRight, LogOut, CreditCard, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Credit packages for purchase
const CREDIT_PACKAGES = [
  {
    id: 'kobi',
    name: 'KOBİ Paketi',
    credits: 3,
    price: 650,
    description: 'Küçük ve orta ölçekli işletmeler için ideal başlangıç paketi.',
    popular: false,
  },
  {
    id: 'buyuk',
    name: 'Büyük Paket',
    credits: 10,
    price: 1800,
    description: 'Büyük ölçekli firmalar için. Çoklu proje ve yoğun entegratör araması.',
    popular: true,
  },
  {
    id: 'global',
    name: 'Global Paket',
    credits: 20,
    price: 3000,
    description: 'Kurumsal firmalar için. Maksimum esneklik ve en iyi değer.',
    popular: false,
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const { user, userRole, signOut, loading } = useAuth();

  // Redirect logged-in users to their dashboard
  useEffect(() => {
    if (!loading && user && userRole) {
      if (userRole === 'firma') {
        navigate('/firma/dashboard', { replace: true });
      } else if (userRole === 'entegrator') {
        navigate('/entegrator/dashboard', { replace: true });
      }
    }
  }, [user, userRole, loading, navigate]);

  const handleSwitchToLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const handleSwitchToRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EntegraTR</span>
          </div>
          
<div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {userRole === 'firma' ? '🏢 Firma' : '👥 Entegratör'}
                </span>
                {userRole === 'firma' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCreditModalOpen(true)}
                    className="gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Kredi Satın Al
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setLoginOpen(true)}>
                  Giriş Yap
                </Button>
                <Button onClick={() => setRegisterOpen(true)}>
                  Kayıt Ol
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium mb-6">
              <span className="h-2 w-2 rounded-full bg-firma animate-pulse" />
              B2B Entegrasyon Platformu
            </div>
            
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-gradient">EntegraTR</span>'ye{' '}
              <br className="hidden sm:block" />
              Hoş Geldiniz
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Firmalar ve entegratörleri buluşturan Türkiye'nin en kapsamlı B2B platformu. 
              Doğru iş ortağını bulun, projelerinizi hayata geçirin.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4">
              {user ? (
                <Button size="lg" className="text-lg px-8 gradient-primary border-0">
                  Dashboard'a Git
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button 
                      size="lg" 
                      onClick={() => setRegisterOpen(true)}
                      className="text-lg px-8 gradient-primary border-0"
                    >
                      Hemen Başla
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => setLoginOpen(true)}
                      className="text-lg px-8"
                    >
                      Giriş Yap
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setGuestModalOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Üye olmadan devam et
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold md:text-4xl">Neden EntegraTR?</h2>
            <p className="mt-4 text-muted-foreground">
              Platform avantajlarımızı keşfedin
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Building2 className="h-6 w-6" />}
              title="Firmalar İçin"
              description="Projenize uygun entegratörleri bulun, teklifler alın ve karşılaştırın."
              color="firma"
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Entegratörler İçin"
              description="Yeni projelere ulaşın, tekliflerinizi sunun ve iş hacminizi artırın."
              color="entegrator"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Güvenli İletişim"
              description="Kredi sistemi ile iletişim bilgilerine erişin, güvenle anlaşın."
              color="primary"
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Mesajlaşma"
              description="Platform içi mesajlaşma ile iletişiminizi kolayca yönetin."
              color="accent"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            
            <div className="relative">
              <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
                Hemen Platforma Katılın
              </h2>
              <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
                Binlerce firma ve entegratör arasında yerinizi alın. 
                Ücretsiz kayıt olun, fırsatları kaçırmayın.
              </p>
              
              {!user && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={() => setRegisterOpen(true)}
                    className="text-lg px-8"
                  >
                    Ücretsiz Kayıt Ol
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 EntegraTR. Tüm hakları saklıdır.</p>
        </div>
      </footer>

{/* Modals */}
      <RegisterModal 
        open={registerOpen} 
        onOpenChange={setRegisterOpen}
        onSwitchToLogin={handleSwitchToLogin}
      />
      <LoginModal 
        open={loginOpen} 
        onOpenChange={setLoginOpen}
        onSwitchToRegister={handleSwitchToRegister}
      />

      {/* Credit Purchase Modal */}
      <Dialog open={creditModalOpen} onOpenChange={setCreditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-firma" />
              Kredi Satın Al
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative p-6 rounded-xl border-2 transition-all hover:border-firma/50 hover:bg-firma/5 ${
                  pkg.popular ? 'border-firma bg-firma/5' : 'border-border'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-firma text-white text-xs font-medium rounded-full">
                    En Popüler
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">{pkg.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">{pkg.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-firma">€{pkg.price}</div>
                    <div className="text-sm text-muted-foreground">{pkg.credits} Kredi</div>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 gradient-primary border-0"
                  onClick={() => {
                    // TODO: Implement payment flow
                    setCreditModalOpen(false);
                  }}
                >
                  Satın Al
                </Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Ödeme işlemi için iletişime geçilecektir.
          </p>
        </DialogContent>
      </Dialog>

      {/* Guest Mode Selection Modal */}
      <Dialog open={guestModalOpen} onOpenChange={setGuestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Eye className="h-5 w-5 text-primary" />
              Platformu İncele
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Hangi rolü görüntülemek istiyorsunuz? Misafir modunda sadece mevcut özellikleri inceleyebilirsiniz.
          </p>
          <div className="grid gap-4">
            <Button
              size="lg"
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-2 hover:border-firma hover:bg-firma/5"
              onClick={() => {
                setGuestModalOpen(false);
                navigate('/firma/dashboard?guest=true');
              }}
            >
              <Building2 className="h-8 w-8 text-firma" />
              <span className="font-semibold text-lg">Firma Olarak</span>
              <span className="text-xs text-muted-foreground">Entegratörleri görüntüle, ilanları incele</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-2 hover:border-entegrator hover:bg-entegrator/5"
              onClick={() => {
                setGuestModalOpen(false);
                navigate('/entegrator/dashboard?guest=true');
              }}
            >
              <Users className="h-8 w-8 text-entegrator" />
              <span className="font-semibold text-lg">Entegratör Olarak</span>
              <span className="text-xs text-muted-foreground">İlanları görüntüle, piyasayı incele</span>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Misafir modunda değişiklik yapamazsınız. Tam erişim için üye olun.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'firma' | 'entegrator' | 'primary' | 'accent';
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    firma: 'bg-firma/10 text-firma',
    entegrator: 'bg-entegrator/10 text-entegrator',
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
  };

  return (
    <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;
