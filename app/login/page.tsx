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
    <div className="min-h-screen bg-crema flex items-center justify-center p-8 relative">
      {/* Imagen de fondo sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url('https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/imagen%20bodeaga%204.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Form */}
      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img
            src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/logo%20portada.jpeg"
            alt="Catena Zapata"
            className="h-16 w-auto rounded mb-4"
          />
          <span className="font-serif text-xl font-medium text-texto tracking-wide">Portal Distribuidores</span>
        </div>

        <div className="text-center mb-6">
          <p className="text-texto-muted text-sm">Ingresá con tu cuenta</p>
        </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-bordo/10 border border-bordo/20 rounded-lg text-bordo">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-texto-muted" />
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-texto-muted" />
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
            <p className="text-sm text-texto-muted">
              ¿No tenés cuenta?{' '}
              <a
                href="mailto:distribuidores@catenazapata.com"
                className="text-bordo hover:underline font-medium"
              >
                Contactanos
              </a>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Link
              href="/"
              className="block text-center text-sm text-texto-muted hover:text-texto transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
    </div>
  );
}
