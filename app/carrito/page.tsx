import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import CarritoClient from './CarritoClient';

export const metadata = {
  title: 'Carrito - Bodega Catena Zapata',
  description: 'Tu carrito de compras',
};

export default async function CarritoPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get cliente data
  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!cliente) {
    redirect('/login');
  }

  // Get active promotions
  const { data: promociones } = await supabase
    .from('promociones')
    .select('*, marca:marcas(nombre)')
    .eq('activa', true);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={{
          email: user.email || '',
          razon_social: cliente.razon_social,
        }}
      />

      <main className="container-wide py-8">
        <h1 className="font-serif text-4xl font-bold text-tierra mb-8">Tu Carrito</h1>

        <CarritoClient
          cliente={cliente}
          promociones={promociones || []}
        />
      </main>
    </div>
  );
}
