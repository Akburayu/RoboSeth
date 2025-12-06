import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
});

export function LoginModal({ open, onOpenChange, onSwitchToRegister }: LoginModalProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  
  const { signIn, userRole } = useAuth();
  const { toast } = useToast();

  // Navigate after login when userRole becomes available
  useEffect(() => {
    if (loginSuccess && userRole) {
      onOpenChange(false);
      resetForm();
      setLoginSuccess(false);
      
      if (userRole === 'firma') {
        navigate('/firma/dashboard');
      } else if (userRole === 'entegrator') {
        navigate('/entegrator/dashboard');
      }
    }
  }, [loginSuccess, userRole, navigate, onOpenChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast({
          title: 'Giriş Hatası',
          description: 'Email veya şifre hatalı. Lütfen tekrar deneyin.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Giriş Hatası',
          description: error.message,
          variant: 'destructive',
        });
      }
      return;
    }

    toast({
      title: 'Hoş Geldiniz!',
      description: 'Başarıyla giriş yaptınız.',
    });
    
    setLoginSuccess(true);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setErrors({});
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleForgotPassword = () => {
    onOpenChange(false);
    setForgotPasswordOpen(true);
  };

  const handleBackToLogin = () => {
    setForgotPasswordOpen(false);
    onOpenChange(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Giriş Yap</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Şifre</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi Unuttum
                </button>
              </div>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-medium text-primary hover:underline"
              >
                Kayıt Ol
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ForgotPasswordModal 
        open={forgotPasswordOpen} 
        onOpenChange={setForgotPasswordOpen}
        onBackToLogin={handleBackToLogin}
      />
    </>
  );
}
