'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Wine, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login')) {
          setError('Email o contraseña incorrectos');
        } else {
          setError(error.message);
        }
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Error al iniciar sesión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-tierra via-tierra to-terracota relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Wine className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-white block">
                Catena Zapata
              </span>
              <span className="text-white/70 text-sm">Portal Distribuidores</span>
            </div>
          </div>

          <h1 className="font-serif text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Vinos de alta gama para tu negocio
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-lg">
            Accedé a nuestra selección premium de vinos mendocinos. Precios exclusivos
            para mayoristas y distribuidores autorizados.
          </p>

          <div className="space-y-4">
            {[
              'Más de 70 etiquetas disponibles',
              'Descuentos exclusivos por volumen',
              'Envío sin cargo en pedidos grandes',
              'Soporte dedicado para distribuidores',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-white/90">
                <div className="w-6 h-6 rounded-full bg-dorado/30 flex items-center justify-center">
                  <Wine className="w-3 h-3 text-dorado" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-terracota/30 rounded-full blur-3xl" />
        <div className="absolute top-20 -right-10 w-40 h-40 bg-dorado/20 rounded-full blur-2xl" />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-terracota rounded-full flex items-center justify-center">
              <Wine className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-2xl font-bold text-tierra">Catena Zapata</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-tierra mb-2">Bienvenido</h2>
            <p className="text-muted">Ingresá con tu cuenta de distribuidor</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-lg text-error">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted">
              ¿No tenés cuenta?{' '}
              <a
                href="mailto:distribuidores@catenazapata.com"
                className="text-terracota hover:underline font-medium"
              >
                Contactanos
              </a>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Link
              href="/"
              className="block text-center text-sm text-muted hover:text-tierra transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
