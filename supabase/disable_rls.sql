-- Ejecutar en Supabase SQL Editor para deshabilitar RLS durante desarrollo

-- Desactivar RLS en todas las tablas
ALTER TABLE marcas DISABLE ROW LEVEL SECURITY;
ALTER TABLE categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE promociones DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items DISABLE ROW LEVEL SECURITY;

-- Verificar que hay datos
SELECT 'marcas' as tabla, COUNT(*) as registros FROM marcas
UNION ALL
SELECT 'categorias', COUNT(*) FROM categorias
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'promociones', COUNT(*) FROM promociones;
