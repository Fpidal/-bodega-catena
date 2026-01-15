'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, LogOut, Wine } from 'lucide-react';
import { useState } from 'react';
import { useHydratedCart } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user: {
    email: string;
    razon_social?: string;
  } | null;
}

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Precios', href: '/precios' },
  { name: 'Historial', href: '/historial' },
];

export default function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems } = useHydratedCart();
  const totalItems = getTotalItems();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-terracota rounded-full flex items-center justify-center">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-serif text-xl font-semibold text-tierra">
                Catena Zapata
              </span>
              <span className="block text-xs text-muted -mt-1">Portal Distribuidores</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-terracota/10 text-terracota'
                    : 'text-tierra hover:bg-arena'
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              href="/carrito"
              className="relative p-2 rounded-lg text-tierra hover:bg-arena transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracota text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <span className="block text-sm font-medium text-tierra">
                    {user.razon_social || user.email}
                  </span>
                  <span className="block text-xs text-muted">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-tierra hover:bg-arena transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-tierra hover:bg-arena transition-colors"
              >
                <User className="w-4 h-4" />
                Ingresar
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-tierra hover:bg-arena transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fadeIn">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-terracota/10 text-terracota'
                      : 'text-tierra hover:bg-arena'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <span className="block text-sm font-medium text-tierra">
                      {user.razon_social || user.email}
                    </span>
                    <span className="block text-xs text-muted">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-tierra hover:bg-arena transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-tierra hover:bg-arena transition-colors"
                >
                  <User className="w-4 h-4" />
                  Ingresar
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
