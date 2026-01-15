import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import CatalogoClient from './CatalogoClient';

export const metadata = {
  title: 'Catálogo - Bodega Catena Zapata',
  description: 'Catálogo completo de vinos de Bodega Catena Zapata',
};

export default async function CatalogoPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  let cliente = null;
  if (user) {
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .single();
    cliente = clienteData;
  }

  // Get all products with joins
  const { data: productos, error: productosError } = await supabase
    .from('productos')
    .select('*, marca:marcas(*), categoria:categorias(*)')
    .eq('activo', true)
    .order('marca_id')
    .order('nombre');

  // Get marcas
  const { data: marcas } = await supabase
    .from('marcas')
    .select('*')
    .order('orden');

  // Get categorias
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .order('orden');

  if (productosError) {
    console.error('Error fetching productos:', productosError);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={
          user
            ? {
                email: user.email || '',
                razon_social: cliente?.razon_social,
              }
            : null
        }
      />

      <main className="container-wide py-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-tierra mb-2">Catálogo de Vinos</h1>
          <p className="text-muted">Explorá nuestra selección completa de vinos premium</p>
        </div>

        <CatalogoClient
          productos={productos || []}
          marcas={marcas || []}
          categorias={categorias || []}
        />
      </main>
    </div>
  );
}
