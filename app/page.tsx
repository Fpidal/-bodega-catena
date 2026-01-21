import { createClient } from '@/lib/supabase/server';
import Header from '@/components/Header';
import Link from 'next/link';
import { Search, FileText, Clock } from 'lucide-react';
import { formatPrecio, formatFechaRelativa } from '@/lib/utils';

export default async function HomePage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  let cliente = null;
  let ordenes: Array<{ id: string; numero: string; total: number; estado: string; created_at: string }> = [];

  if (user) {
    // Get cliente data
    const { data: clienteData } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', user.id)
      .single();
    cliente = clienteData;

    // Get recent orders
    if (cliente) {
      const { data: ordenesData } = await supabase
        .from('ordenes')
        .select('id, numero, total, estado, created_at')
        .eq('cliente_id', cliente.id)
        .order('created_at', { ascending: false })
        .limit(5);
      ordenes = ordenesData || [];
    }
  }

  // Si no está logueado, mostrar página de bienvenida
  if (!user) {
    return (
      <div className="portal-container">
        <div className="portal-content">
          {/* Logo Header */}
          <div className="portal-logo-header">
            <img
              src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/bodega%20catena%20lineas%20.jpg"
              alt="Bodega Catena Zapata - Fundada en 1902"
            />
          </div>

          {/* Título */}
          <h1 className="portal-title">Portal de Distribuidores</h1>

          {/* Divider */}
          <div className="portal-divider" />

          {/* Imagen del viñedo */}
          <div className="portal-image">
            <img
              src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/imagen%20bodeaga%202.jpeg"
              alt="Bodega Catena Zapata"
            />
          </div>

          {/* Botón Ingresar */}
          <Link href="/login" className="btn-comenzar-pedido">
            Ingresar al Portal
          </Link>

          {/* Accesos rápidos */}
          <div className="portal-quick-access">
            <div className="quick-access-item">
              <Search />
              <p className="quick-access-title">Ver catálogo completo</p>
            </div>
            <div className="quick-access-item">
              <FileText />
              <p className="quick-access-title">Ver lista de precios</p>
              <p className="quick-access-subtitle">Precios válidos en mejora</p>
            </div>
            <div className="quick-access-item">
              <Clock />
              <p className="quick-access-title">Consultar historial</p>
              <p className="quick-access-subtitle">Precios hasta: 31 mayo 2024</p>
            </div>
          </div>

          {/* Divider */}
          <div className="portal-divider" />

          {/* Info */}
          <div className="portal-info">
            <p>Acceso exclusivo para distribuidores autorizados</p>
          </div>

          {/* Contacto */}
          <div className="portal-contact">
            <p className="portal-contact-label">¿No tenés cuenta?</p>
            <div className="portal-contact-details">
              <p><a href="mailto:distribuidores@catenazapata.com">distribuidores@catenazapata.com</a></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuario logueado - Portal Catena
  return (
    <div className="portal-container">
      <div className="portal-content">
        {/* Logo Header */}
        <div className="portal-logo-header">
          <img
            src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/bodega%20catena%20lineas%20.jpg"
            alt="Bodega Catena Zapata - Fundada en 1902"
          />
        </div>

        {/* Título */}
        <h1 className="portal-title">Portal de Distribuidores</h1>

        {/* Divider */}
        <div className="portal-divider" />

        {/* Imagen del viñedo */}
        <div className="portal-image">
          <img
            src="https://agxpjqqfoozgsuuwaskd.supabase.co/storage/v1/object/public/Logos%20CATENA/imagen%20bodeaga%202.jpeg"
            alt="Bodega Catena Zapata"
          />
        </div>

        {/* Botón Comenzar Pedido */}
        <Link href="/catalogo" className="btn-comenzar-pedido">
          Comenzar Pedido
        </Link>

        {/* Accesos rápidos */}
        <div className="portal-quick-access">
          <Link href="/catalogo" className="quick-access-item">
            <Search />
            <p className="quick-access-title">Ver catálogo completo</p>
          </Link>
          <Link href="/precios" className="quick-access-item">
            <FileText />
            <p className="quick-access-title">Ver lista de precios</p>
            <p className="quick-access-subtitle">Precios válidos en mejora</p>
          </Link>
          <Link href="/historial" className="quick-access-item">
            <Clock />
            <p className="quick-access-title">Consultar historial</p>
            <p className="quick-access-subtitle">Precios hasta: 31 mayo 2024</p>
          </Link>
        </div>

        {/* Divider */}
        <div className="portal-divider" />

        {/* Info comercial */}
        <div className="portal-info">
          <p>Pedido mínimo: $200.000</p>
          <p>Bonificación: Hasta 10% por volumen</p>
          <p>Precios válidos hasta: 31 mayo 2024</p>
        </div>

        {/* Contacto comercial */}
        <div className="portal-contact">
          <p className="portal-contact-label">Contacto comercial:</p>
          <p className="portal-contact-name">{cliente?.razon_social || 'Distribuidor'}</p>
          <div className="portal-contact-details">
            <p><a href={`mailto:${user.email}`}>{user.email}</a></p>
            <p>+54 9 261 222 3333</p>
          </div>
        </div>
      </div>
    </div>
  );
}
