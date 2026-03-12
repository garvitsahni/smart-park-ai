import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, LayoutDashboard, History, TrendingUp, Menu, Sun, Moon, LogIn, CalendarClock, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParking } from '@/context/ParkingContext';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const navItems = [
  { path: '/park', key: 'park', icon: Car },
  { path: '/reserve', key: 'reserve', icon: CalendarClock },
  { path: '/admin', key: 'dashboard', icon: LayoutDashboard },
  { path: '/history', key: 'history', icon: History },
  { path: '/analytics', key: 'analytics', icon: TrendingUp },
];

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useParking();
  const [isOpen, setIsOpen] = React.useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('hi') ? 'en' : 'hi');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow overflow-hidden p-0.5">
              <img src="/peacock-logo.png" alt="Parking Prabandh Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <span className="font-display font-bold text-xl gradient-text hidden sm:inline tracking-tight">
              Parking <span className="text-cyan-400 font-light">Prabandh</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={isActive ? 'glow-primary' : ''}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {t(`nav.${item.key}`)}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <NotificationCenter />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="hidden md:flex"
              title={t('common.language')}
            >
              <Languages className="w-5 h-5 text-cyan-400" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden md:flex"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            <Link to="/admin" className="hidden lg:block">
              <Button variant="heroOutline" size="sm">
                <LogIn className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] glass-card">
                <div className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className="w-full justify-start"
                        >
                          <item.icon className="w-4 h-4 mr-2" />
                          {t(`nav.${item.key}`)}
                        </Button>
                      </Link>
                    );
                  })}
                  <div className="border-t border-border my-2" />
                  <Button variant="ghost" onClick={toggleLanguage} className="justify-start text-cyan-400">
                    <Languages className="w-4 h-4 mr-2" />
                    {i18n.language.startsWith('hi') ? 'Switch to English' : 'हिंदी में बदलें'}
                  </Button>
                  <Button variant="ghost" onClick={toggleTheme} className="justify-start">
                    {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
