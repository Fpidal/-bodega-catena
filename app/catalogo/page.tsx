import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import CatalogoClient from './CatalogoClient';

export const metadata = {
  title: 'Cargar Pedido - Bodega Catena Zapata',
  description: 'Seleccionar productos para tu pedido',
};

export default async function CatalogoPage() {
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
    <div className="min-h-screen bg-crema">
      <Header
        user={{
          email: user.email || '',
          razon_social: cliente?.razon_social,
        }}
      />

      <main className="catalogo-container">
        {/* Header con logo */}
        <div className="catalogo-header">
          <img
            src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/bodega%20catena%20lineas%20.jpg"
            alt="Catena Zapata"
            className="catalogo-logo"
          />
          <h1 className="catalogo-title">Seleccionar Productos</h1>
        </div>

        {/* Imagen de la bodega */}
        <div className="catalogo-hero">
          <img
            src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/imagen%20bodeaga%202.jpeg"
            alt="Bodega Catena Zapata"
          />
        </div>

        {/* Contenido del catálogo */}
        <div className="catalogo-content">
          <CatalogoClient
            productos={productos || []}
            marcas={marcas || []}
            categorias={categorias || []}
          />
        </div>
      </main>
    </div>
  );
}
