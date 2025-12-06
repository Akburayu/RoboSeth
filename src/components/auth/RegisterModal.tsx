import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { z } from 'zod';

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(100, 'İsim çok uzun'),
  email: z.string().regex(emailRegex, 'Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type RoleType = 'firma' | 'entegrator' | null;

export function RegisterModal({ open, onOpenChange, onSwitchToLogin }: RegisterModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setStep('form');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedRole(null);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs
    const result = registerSchema.safeParse({ name, email, password });
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

    if (!selectedRole) return;

    setLoading(true);
    const { error } = await signUp(email, password, selectedRole, name);
    setLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: 'Kayıt Hatası',
          description: 'Bu email adresi zaten kayıtlı. Giriş yapmayı deneyin.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Kayıt Hatası',
          description: error.message,
          variant: 'destructive',
        });
      }
      return;
    }

    toast({
      title: 'Kayıt Başarılı!',
      description: 'Hesabınız oluşturuldu. Hoş geldiniz!',
    });
    
    onOpenChange(false);
    resetForm();
    
    // Role göre profil tamamlama sayfasına yönlendir
    if (selectedRole === 'firma') {
      navigate('/firma/register');
    } else if (selectedRole === 'entegrator') {
      navigate('/entegrator/register');
    }
  };

  const resetForm = () => {
    setStep('select');
    setSelectedRole(null);
    setName('');
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === 'select' ? 'Hesap Türü Seçin' : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span>{selectedRole === 'firma' ? 'Firma Kaydı' : 'Entegratör Kaydı'}</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' ? (
          <div className="grid gap-4 py-4">
            <button
              onClick={() => handleRoleSelect('firma')}
              className="group relative overflow-hidden rounded-xl border-2 border-transparent bg-card p-6 text-left transition-all hover:border-firma hover:shadow-lg"
            >
              <div className="absolute inset-0 gradient-firma opacity-0 transition-opacity group-hover:opacity-10" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-firma/10 text-firma">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Firma Girişi</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Entegratör arayan şirketler için. İlan yayınlayın, teklifler alın.
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('entegrator')}
              className="group relative overflow-hidden rounded-xl border-2 border-transparent bg-card p-6 text-left transition-all hover:border-entegrator hover:shadow-lg"
            >
              <div className="absolute inset-0 gradient-entegrator opacity-0 transition-opacity group-hover:opacity-10" />
              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-entegrator/10 text-entegrator">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Entegratör Girişi</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hizmet veren entegratörler için. Projelere teklif verin.
                  </p>
                </div>
              </div>
            </button>

            <div className="text-center text-sm text-muted-foreground mt-2">
              Zaten hesabınız var mı?{' '}
              <button
                onClick={onSwitchToLogin}
                className="font-medium text-primary hover:underline"
              >
                Giriş Yap
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {selectedRole === 'firma' ? 'Firma Adı' : 'Entegratör Adı'}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === 'firma' ? 'Şirket adınız' : 'İsminiz veya şirket adınız'}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className={`w-full ${selectedRole === 'firma' ? 'bg-firma hover:bg-firma/90' : 'bg-entegrator hover:bg-entegrator/90'}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kayıt Yapılıyor...
                </>
              ) : (
                'Kayıt Ol'
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
