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

  // Get current user - REQUIERE LOGIN
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

  // Get previous orders for "repeat order" feature
  const { data: ordenesAnteriores } = await supabase
    .from('ordenes')
    .select('id, numero, total, created_at, orden_items(cantidad, producto:productos(id, nombre, codigo, precio_iva, stock, unidades_por_caja, marca_id, categoria_id, marca:marcas(*), categoria:categorias(*)))')
    .eq('cliente_id', cliente.id)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen bg-crema">
      <Header
        user={user ? {
          email: user.email || '',
          razon_social: cliente.razon_social,
        } : null}
      />

      <main className="container-wide pt-24 pb-8">
        <div className="mb-8">
          <p className="text-texto-muted text-sm uppercase tracking-wider mb-2">Pedido en Curso</p>
          <h1 className="font-serif text-3xl font-semibold text-texto">Armar Pedido</h1>
        </div>

        <CarritoClient
          cliente={cliente}
          promociones={promociones || []}
          ordenesAnteriores={ordenesAnteriores || []}
        />
      </main>
    </div>
  );
}
