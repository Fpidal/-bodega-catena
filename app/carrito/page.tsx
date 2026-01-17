import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import CarritoClient from './CarritoClient';

export const metadata = {
  title: 'Carrito - Bodega Catena Zapata',
  description: 'Tu carrito de compras',
};

// Cliente de prueba para desarrollo
const clientePrueba = {
  id: 'dev-client',
  user_id: 'dev-user',
  razon_social: 'Cliente de Prueba',
  cuit: '00-00000000-0',
  direccion: 'Dirección de prueba',
  ciudad: 'Mendoza',
  provincia: 'Mendoza',
  codigo_postal: '5500',
  telefono: '000-0000000',
  email: 'prueba@test.com',
  tipo_cliente: 'mayorista' as const,
  descuento_general: 0,
  credito_disponible: 0,
  activo: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default async function CarritoPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  let cliente = clientePrueba;

  if (user) {
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (clienteData) {
      cliente = clienteData;
    }
  }

  // Get active promotions
  const { data: promociones } = await supabase
    .from('promociones')
    .select('*, marca:marcas(nombre)')
    .eq('activa', true);

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user ? {
          email: user.email || '',
          razon_social: cliente.razon_social,
        } : null}
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
