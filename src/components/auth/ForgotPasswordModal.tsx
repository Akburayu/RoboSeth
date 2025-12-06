import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToLogin: () => void;
}

const emailSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
});

export function ForgotPasswordModal({ open, onOpenChange, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    setLoading(false);

    if (resetError) {
      toast({
        title: 'Hata',
        description: resetError.message,
        variant: 'destructive',
      });
      return;
    }

    setSent(true);
  };

  const resetForm = () => {
    setEmail('');
    setError('');
    setSent(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const handleBackToLogin = () => {
    resetForm();
    onBackToLogin();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {sent ? 'Email Gönderildi' : 'Şifremi Unuttum'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {sent 
              ? 'Şifre sıfırlama bağlantısı email adresinize gönderildi.' 
              : 'Kayıtlı email adresinizi girin, şifre sıfırlama bağlantısı gönderelim.'
            }
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-6 space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
              </p>
              <p className="text-sm text-muted-foreground">
                Email'inizi kontrol edin ve bağlantıya tıklayarak yeni şifrenizi belirleyin.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Giriş Sayfasına Dön
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Email almadınız mı? Spam klasörünüzü kontrol edin veya tekrar deneyin.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Adresi</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className={`pl-10 ${error ? 'border-destructive' : ''}`}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                'Şifre Sıfırlama Bağlantısı Gönder'
              )}
            </Button>

            <Button 
              type="button" 
              variant="ghost" 
              className="w-full" 
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Giriş Sayfasına Dön
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
