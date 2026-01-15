-- =====================================================
-- BODEGA CATENA ZAPATA - SCHEMA DE BASE DE DATOS
-- Portal CRM para Distribuidores Mayoristas
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: MARCAS
-- =====================================================
CREATE TABLE marcas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url TEXT,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_marcas_slug ON marcas(slug);
CREATE INDEX idx_marcas_orden ON marcas(orden);

-- =====================================================
-- TABLA: CATEGORIAS
-- =====================================================
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_categorias_slug ON categorias(slug);

-- =====================================================
-- TABLA: PRODUCTOS
-- =====================================================
CREATE TABLE productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    marca_id UUID NOT NULL REFERENCES marcas(id) ON DELETE RESTRICT,
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    presentacion VARCHAR(100) DEFAULT 'Caja x 6 botellas',
    unidades_por_caja INTEGER DEFAULT 6,
    precio_neto DECIMAL(12, 2) NOT NULL,
    precio_iva DECIMAL(12, 2) NOT NULL,
    precio_botella DECIMAL(12, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_productos_marca ON productos(marca_id);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_codigo ON productos(codigo);
CREATE INDEX idx_productos_activo ON productos(activo);

-- =====================================================
-- TABLA: CLIENTES
-- =====================================================
CREATE TABLE clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    razon_social VARCHAR(200) NOT NULL,
    cuit VARCHAR(13) NOT NULL UNIQUE,
    direccion VARCHAR(300) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10),
    telefono VARCHAR(50),
    email VARCHAR(200) NOT NULL,
    tipo_cliente VARCHAR(50) DEFAULT 'mayorista' CHECK (tipo_cliente IN ('mayorista', 'distribuidor', 'restaurante', 'vinoteca')),
    descuento_general DECIMAL(5, 2) DEFAULT 0,
    credito_disponible DECIMAL(12, 2) DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Índices
CREATE INDEX idx_clientes_user_id ON clientes(user_id);
CREATE INDEX idx_clientes_cuit ON clientes(cuit);

-- =====================================================
-- TABLA: ORDENES
-- =====================================================
CREATE TABLE ordenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(20) NOT NULL UNIQUE,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    subtotal DECIMAL(12, 2) NOT NULL,
    descuento_codigo DECIMAL(12, 2) DEFAULT 0,
    descuento_promocion DECIMAL(12, 2) DEFAULT 0,
    descuento_total DECIMAL(12, 2) DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'en_proceso', 'enviada', 'entregada', 'cancelada')),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ordenes_cliente ON ordenes(cliente_id);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_fecha ON ordenes(created_at DESC);

-- =====================================================
-- TABLA: ORDEN_ITEMS
-- =====================================================
CREATE TABLE orden_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_orden_items_orden ON orden_items(orden_id);
CREATE INDEX idx_orden_items_producto ON orden_items(producto_id);

-- =====================================================
-- TABLA: PROMOCIONES
-- =====================================================
CREATE TABLE promociones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('porcentaje', 'monto_fijo', 'envio_gratis')),
    valor DECIMAL(10, 2) NOT NULL,
    codigo VARCHAR(50) UNIQUE,
    marca_id UUID REFERENCES marcas(id) ON DELETE SET NULL,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    min_cajas INTEGER DEFAULT 0,
    min_monto DECIMAL(12, 2) DEFAULT 0,
    fecha_inicio TIMESTAMPTZ DEFAULT NOW(),
    fecha_fin TIMESTAMPTZ,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_promociones_activa ON promociones(activa);
CREATE INDEX idx_promociones_codigo ON promociones(codigo);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_updated_at
    BEFORE UPDATE ON ordenes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Función para generar número de orden automático
CREATE OR REPLACE FUNCTION generate_orden_numero()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_numero TEXT;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');

    -- Obtener el siguiente número de secuencia para este año
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero FROM 'OC-' || year_part || '-(\d+)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM ordenes
    WHERE numero LIKE 'OC-' || year_part || '-%';

    new_numero := 'OC-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    NEW.numero := new_numero;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_orden_numero_trigger
    BEFORE INSERT ON ordenes
    FOR EACH ROW
    WHEN (NEW.numero IS NULL OR NEW.numero = '')
    EXECUTE FUNCTION generate_orden_numero();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;

-- Políticas para MARCAS (lectura pública)
CREATE POLICY "Marcas visibles para todos"
    ON marcas FOR SELECT
    USING (true);

-- Políticas para CATEGORIAS (lectura pública)
CREATE POLICY "Categorias visibles para todos"
    ON categorias FOR SELECT
    USING (true);

-- Políticas para PRODUCTOS (lectura pública)
CREATE POLICY "Productos activos visibles para todos"
    ON productos FOR SELECT
    USING (activo = true);

-- Políticas para CLIENTES
CREATE POLICY "Clientes pueden ver su propio perfil"
    ON clientes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Clientes pueden actualizar su propio perfil"
    ON clientes FOR UPDATE
    USING (auth.uid() = user_id);

-- Políticas para ORDENES
CREATE POLICY "Clientes pueden ver sus propias órdenes"
    ON ordenes FOR SELECT
    USING (
        cliente_id IN (
            SELECT id FROM clientes WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clientes pueden crear sus propias órdenes"
    ON ordenes FOR INSERT
    WITH CHECK (
        cliente_id IN (
            SELECT id FROM clientes WHERE user_id = auth.uid()
        )
    );

-- Políticas para ORDEN_ITEMS
CREATE POLICY "Clientes pueden ver items de sus órdenes"
    ON orden_items FOR SELECT
    USING (
        orden_id IN (
            SELECT o.id FROM ordenes o
            JOIN clientes c ON o.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

CREATE POLICY "Clientes pueden crear items en sus órdenes"
    ON orden_items FOR INSERT
    WITH CHECK (
        orden_id IN (
            SELECT o.id FROM ordenes o
            JOIN clientes c ON o.cliente_id = c.id
            WHERE c.user_id = auth.uid()
        )
    );

-- Políticas para PROMOCIONES (lectura pública de promociones activas)
CREATE POLICY "Promociones activas visibles para todos"
    ON promociones FOR SELECT
    USING (activa = true);

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE marcas IS 'Marcas de vinos de Bodega Catena Zapata';
COMMENT ON TABLE categorias IS 'Categorías de vinos (Tintos, Blancos, etc.)';
COMMENT ON TABLE productos IS 'Catálogo de productos con precios mayoristas';
COMMENT ON TABLE clientes IS 'Distribuidores y clientes mayoristas registrados';
COMMENT ON TABLE ordenes IS 'Órdenes de compra de los clientes';
COMMENT ON TABLE orden_items IS 'Items individuales de cada orden';
COMMENT ON TABLE promociones IS 'Promociones y descuentos disponibles';
