'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, LogOut, Wine } from 'lucide-react';
import { useState } from 'react';
import { useHydratedCart } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: {
    email: string;
    razon_social?: string;
  } | null;
}

const navigation = [
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Pedido', href: '/carrito' },
  { name: 'Lista de Precios', href: '/precios' },
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

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-blanco-roto border-b border-border-strong">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img
              src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/logo%20portada.jpeg"
              alt="Catena Zapata"
              className="h-10 w-auto rounded"
            />
            <div className="hidden sm:block">
              <span className="font-serif text-lg font-semibold text-texto tracking-wide">
                Catena Zapata
              </span>
              <span className="block text-xs text-texto-muted">Portal Distribuidores</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-opacity ${
                  isActive(item.href)
                    ? 'text-bordo'
                    : 'text-texto-secundario hover:text-bordo'
                }`}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="block h-0.5 bg-bordo mt-0.5 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link
              href="/carrito"
              className="relative p-2 text-texto hover:text-bordo transition-colors"
              title="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-bordo text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Info & Logout */}
            {user && (
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-border-strong">
                <div className="text-right">
                  <span className="block text-sm font-medium text-texto">
                    {user.razon_social || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-texto-muted hover:text-bordo transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-texto hover:text-bordo transition-colors"
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
                  className={`px-4 py-3 text-sm font-medium ${
                    isActive(item.href)
                      ? 'text-bordo bg-crema'
                      : 'text-texto hover:bg-crema'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <hr className="my-2 border-border" />
              {user && (
                <>
                  <div className="px-4 py-2">
                    <span className="block text-sm font-medium text-texto">
                      {user.razon_social || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-texto hover:bg-crema"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
