import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { FirmaEslesmeler } from '@/components/matches/FirmaEslesmeler';
import { EntegratorEslesmeler } from '@/components/matches/EntegratorEslesmeler';
import { SEOHead } from '@/components/SEOHead';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function Eslesmeler() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in -> return to index
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Determine Dashboard Path for Breadcrumb
  const dashboardPath = userRole === 'firma' ? '/firma/dashboard' : '/entegrator/dashboard';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Proje Eşleşmeleri | RoboSeth"
        description="Aktif robotik otomasyon proje eşleşmeleriniz ve 6 adımlı yönetim süreciniz."
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header & Breadcrumb */}
        <div className="mb-8 space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Ana Sayfa</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={dashboardPath}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Eşleşmeler ve Süreçler</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Eşleşmeler ve Süreçler
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'firma' 
              ? 'Projelerinize davet ettiğiniz entegratörlerle olan tüm aktif iş akışlarını buradan takip edebilir ve onayları verebilirsiniz.' 
              : 'Firmaların sizi dahil ettiği kapalı operasyonların akışlarına buradan ulaşabilir ve kendi teklif/takvim görevlerinizi gerçekleştirebilirsiniz.'}
          </p>
        </div>

        {/* Role Based Navigation Rendering */}
        <div className="mt-6">
          {userRole === 'firma' && <FirmaEslesmeler />}
          {userRole === 'entegrator' && <EntegratorEslesmeler />}
        </div>
      </main>
    </div>
  );
}
