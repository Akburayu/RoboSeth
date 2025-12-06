import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import FirmaDashboard from './FirmaDashboard';
import EntegratorDashboard from './EntegratorDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Firma users see the FirmaDashboard
  if (userRole === 'firma') {
    return <FirmaDashboard />;
  }

  // Entegrator users see the EntegratorDashboard
  if (userRole === 'entegrator') {
    return <EntegratorDashboard />;
  }

  return null;
}
