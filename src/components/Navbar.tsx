import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Building2, CreditCard, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  
  const isAuthenticated = !!user;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleProtectedNavigation = (path: string) => {
    if (!isAuthenticated) {
      if (path.includes('firma')) {
        navigate('/firma/register');
      } else if (path.includes('entegrator')) {
        navigate('/entegrator/register');
      } else {
        navigate('/');
      }
    } else {
      navigate(path);
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Ana Sayfa', path: '/', isProtected: false },
    { name: 'Entegratör', path: '/entegrator/dashboard', isProtected: true },
    { name: 'Firma', path: '/firma/dashboard', isProtected: true },
    { name: 'Eşleşmeler', path: '/eslesmeler', isProtected: true },
    { name: 'Partnerlerimiz', path: '/partners', isProtected: false },
    { name: 'İletişim', path: '/contact', isProtected: false },
    { name: 'Daha Fazla', path: '/more', isProtected: false },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary shadow-md border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Left Side: Logo & Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/logo.png" alt="RoboSeth Logo" className="h-9 w-auto drop-shadow-md" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                link.isProtected ? (
                  <button
                    key={link.name}
                    onClick={() => handleProtectedNavigation(link.path)}
                    className="text-sm font-medium text-slate-200 transition-colors hover:text-accent"
                  >
                    {link.name}
                  </button>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-sm font-medium text-slate-200 transition-colors hover:text-accent"
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Right Side: User Actions */}
          <div className="hidden md:flex items-center gap-4">
             <div className="flex items-center gap-4 border-r border-white/10 pr-4">
               {/* Language Config */}
               <div className="brightness-200 saturate-0 invert contrast-200">
                 <LanguageSwitcher />
               </div>

               {/* Role Show */}
               {isAuthenticated && userRole && (
                 <div className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
                   {userRole === 'firma' ? <Building2 size={16} /> : <Users size={16} />}
                   <span className="capitalize">{userRole}</span>
                 </div>
               )}
             </div>

             {/* Auth Actions */}
             {isAuthenticated ? (
               <div className="flex items-center gap-2">
                 {userRole === 'firma' && (
                   <Button size="sm" className="bg-accent text-primary hover:bg-accent/90 border-0 flex items-center gap-2 shadow-lg shadow-accent/20">
                     <CreditCard size={16} />
                     Kredi Satın Al
                   </Button>
                 )}
                 <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/'); }} className="text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 px-3">
                   <LogOut size={16} />
                   Çıkış Yap
                 </Button>
               </div>
             ) : (
                <Button size="sm" onClick={() => navigate('/firma/register')} className="bg-accent text-primary hover:bg-accent/90 border-0 shadow-lg shadow-accent/20">
                  Giriş Yap
                </Button>
             )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-slate-200 hover:text-white hover:bg-white/10"
              aria-label="Menüyü aç/kapat"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Area */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-primary pb-4">
          <div className="space-y-1 px-4 pt-2">
            {navLinks.map((link) => (
              link.isProtected ? (
                <button
                  key={link.name}
                  onClick={() => handleProtectedNavigation(link.path)}
                  className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-slate-200 hover:bg-white/10 hover:text-accent"
                >
                  {link.name}
                </button>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block rounded-md px-3 py-2 text-base font-medium text-slate-200 hover:bg-white/10 hover:text-accent"
                  onClick={toggleMobileMenu}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
