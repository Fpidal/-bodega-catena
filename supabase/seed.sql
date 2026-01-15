-- =====================================================
-- BODEGA CATENA ZAPATA - DATOS INICIALES (SEED)
-- Portal CRM para Distribuidores Mayoristas
-- =====================================================

-- =====================================================
-- CATEGORIAS
-- =====================================================
INSERT INTO categorias (nombre, slug, orden) VALUES
    ('Tintos', 'tintos', 1),
    ('Blancos', 'blancos', 2),
    ('Rosados', 'rosados', 3),
    ('Espumantes', 'espumantes', 4),
    ('Tintos Premium', 'tintos-premium', 5);

-- =====================================================
-- MARCAS (11 marcas de Catena Zapata)
-- =====================================================
INSERT INTO marcas (nombre, slug, descripcion, orden) VALUES
    ('Alamos', 'alamos', 'Vinos frescos y frutados, ideales para el día a día', 1),
    ('Tilia', 'tilia', 'Vinos orgánicos con personalidad única', 2),
    ('Padrillos', 'padrillos', 'Vinos jóvenes y accesibles con carácter mendocino', 3),
    ('La Posta', 'la-posta', 'Vinos de viñedos históricos con tradición italiana', 4),
    ('Saint Felicien', 'saint-felicien', 'Vinos elegantes con crianza en roble francés', 5),
    ('Nicasia', 'nicasia', 'Vinos de Alta Vista con terroir único', 6),
    ('DV Catena', 'dv-catena', 'Selección de viñedos históricos de alta altitud', 7),
    ('Angélica Zapata', 'angelica-zapata', 'Vinos de parcelas seleccionadas, alta expresión', 8),
    ('Catena Zapata', 'catena-zapata', 'Los mejores vinos de la bodega, íconos argentinos', 9),
    ('Domaine Nico', 'domaine-nico', 'Vinos de clima frío del Valle de Uco', 10),
    ('Tikal', 'tikal', 'Vinos biodinámicos de expresión pura', 11);

-- =====================================================
-- PRODUCTOS
-- Precios en pesos argentinos por caja de 6 botellas
-- =====================================================

-- Variable para IDs de categorías
DO $$
DECLARE
    cat_tintos UUID;
    cat_blancos UUID;
    cat_rosados UUID;
    cat_espumantes UUID;
    cat_premium UUID;
    marca_alamos UUID;
    marca_tilia UUID;
    marca_padrillos UUID;
    marca_la_posta UUID;
    marca_saint_felicien UUID;
    marca_nicasia UUID;
    marca_dv_catena UUID;
    marca_angelica UUID;
    marca_catena UUID;
    marca_domaine_nico UUID;
    marca_tikal UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_tintos FROM categorias WHERE slug = 'tintos';
    SELECT id INTO cat_blancos FROM categorias WHERE slug = 'blancos';
    SELECT id INTO cat_rosados FROM categorias WHERE slug = 'rosados';
    SELECT id INTO cat_espumantes FROM categorias WHERE slug = 'espumantes';
    SELECT id INTO cat_premium FROM categorias WHERE slug = 'tintos-premium';

    -- Obtener IDs de marcas
    SELECT id INTO marca_alamos FROM marcas WHERE slug = 'alamos';
    SELECT id INTO marca_tilia FROM marcas WHERE slug = 'tilia';
    SELECT id INTO marca_padrillos FROM marcas WHERE slug = 'padrillos';
    SELECT id INTO marca_la_posta FROM marcas WHERE slug = 'la-posta';
    SELECT id INTO marca_saint_felicien FROM marcas WHERE slug = 'saint-felicien';
    SELECT id INTO marca_nicasia FROM marcas WHERE slug = 'nicasia';
    SELECT id INTO marca_dv_catena FROM marcas WHERE slug = 'dv-catena';
    SELECT id INTO marca_angelica FROM marcas WHERE slug = 'angelica-zapata';
    SELECT id INTO marca_catena FROM marcas WHERE slug = 'catena-zapata';
    SELECT id INTO marca_domaine_nico FROM marcas WHERE slug = 'domaine-nico';
    SELECT id INTO marca_tikal FROM marcas WHERE slug = 'tikal';

    -- =====================================================
    -- ALAMOS (~$61,800/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('ALA-MAL-001', 'Alamos Malbec', marca_alamos, cat_tintos, 51000, 61710, 10285, 150),
        ('ALA-CAB-001', 'Alamos Cabernet Sauvignon', marca_alamos, cat_tintos, 51000, 61710, 10285, 120),
        ('ALA-PIN-001', 'Alamos Pinot Noir', marca_alamos, cat_tintos, 51000, 61710, 10285, 80),
        ('ALA-SYR-001', 'Alamos Syrah', marca_alamos, cat_tintos, 51000, 61710, 10285, 90),
        ('ALA-CHA-001', 'Alamos Chardonnay', marca_alamos, cat_blancos, 51000, 61710, 10285, 100),
        ('ALA-TOR-001', 'Alamos Torrontés', marca_alamos, cat_blancos, 51000, 61710, 10285, 70),
        ('ALA-SAU-001', 'Alamos Sauvignon Blanc', marca_alamos, cat_blancos, 51000, 61710, 10285, 60),
        ('ALA-ROS-001', 'Alamos Rosé de Malbec', marca_alamos, cat_rosados, 51000, 61710, 10285, 50);

    -- =====================================================
    -- TILIA (~$55,000/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('TIL-MAL-001', 'Tilia Malbec', marca_tilia, cat_tintos, 45450, 55000, 9167, 100),
        ('TIL-CAB-001', 'Tilia Cabernet Sauvignon', marca_tilia, cat_tintos, 45450, 55000, 9167, 80),
        ('TIL-CHA-001', 'Tilia Chardonnay', marca_tilia, cat_blancos, 45450, 55000, 9167, 60),
        ('TIL-BLE-001', 'Tilia Blend', marca_tilia, cat_tintos, 45450, 55000, 9167, 40);

    -- =====================================================
    -- PADRILLOS (~$48,000/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('PAD-MAL-001', 'Padrillos Malbec', marca_padrillos, cat_tintos, 39670, 48000, 8000, 200),
        ('PAD-CAB-001', 'Padrillos Cabernet Sauvignon', marca_padrillos, cat_tintos, 39670, 48000, 8000, 150),
        ('PAD-BLE-001', 'Padrillos Red Blend', marca_padrillos, cat_tintos, 39670, 48000, 8000, 100);

    -- =====================================================
    -- LA POSTA (~$72,000/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('LAP-MAL-001', 'La Posta Malbec Paulucci', marca_la_posta, cat_tintos, 59500, 72000, 12000, 60),
        ('LAP-MAL-002', 'La Posta Malbec Pizzella', marca_la_posta, cat_tintos, 59500, 72000, 12000, 50),
        ('LAP-BON-001', 'La Posta Bonarda', marca_la_posta, cat_tintos, 59500, 72000, 12000, 40),
        ('LAP-CRI-001', 'La Posta Criolla', marca_la_posta, cat_tintos, 59500, 72000, 12000, 30);

    -- =====================================================
    -- SAINT FELICIEN (~$95,400/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('STF-MAL-001', 'Saint Felicien Malbec', marca_saint_felicien, cat_tintos, 78845, 95400, 15900, 80),
        ('STF-CAB-001', 'Saint Felicien Cabernet Sauvignon', marca_saint_felicien, cat_tintos, 78845, 95400, 15900, 60),
        ('STF-SYR-001', 'Saint Felicien Syrah', marca_saint_felicien, cat_tintos, 78845, 95400, 15900, 40),
        ('STF-PIN-001', 'Saint Felicien Pinot Noir', marca_saint_felicien, cat_tintos, 78845, 95400, 15900, 35),
        ('STF-CHA-001', 'Saint Felicien Chardonnay', marca_saint_felicien, cat_blancos, 78845, 95400, 15900, 50),
        ('STF-SAU-001', 'Saint Felicien Sauvignon Blanc', marca_saint_felicien, cat_blancos, 78845, 95400, 15900, 30);

    -- =====================================================
    -- NICASIA (~$120,000/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('NIC-MAL-001', 'Nicasia Vineyards Malbec', marca_nicasia, cat_tintos, 99175, 120000, 20000, 45),
        ('NIC-RBL-001', 'Nicasia Red Blend', marca_nicasia, cat_tintos, 99175, 120000, 20000, 35);

    -- =====================================================
    -- DV CATENA (~$178,500/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('DVC-MM-001', 'DV Catena Malbec-Malbec', marca_dv_catena, cat_tintos, 147520, 178500, 29750, 40),
        ('DVC-CC-001', 'DV Catena Cabernet-Cabernet', marca_dv_catena, cat_tintos, 147520, 178500, 29750, 35),
        ('DVC-SS-001', 'DV Catena Syrah-Syrah', marca_dv_catena, cat_tintos, 147520, 178500, 29750, 25),
        ('DVC-TIN-001', 'DV Catena Tinto Histórico', marca_dv_catena, cat_tintos, 165290, 200000, 33333, 20),
        ('DVC-CHA-001', 'DV Catena Chardonnay-Chardonnay', marca_dv_catena, cat_blancos, 147520, 178500, 29750, 30);

    -- =====================================================
    -- ANGÉLICA ZAPATA (~$179,200/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('ANG-MAL-001', 'Angélica Zapata Malbec Alta', marca_angelica, cat_premium, 148100, 179200, 29867, 30),
        ('ANG-CAB-001', 'Angélica Zapata Cabernet Franc Alta', marca_angelica, cat_premium, 148100, 179200, 29867, 25),
        ('ANG-CHA-001', 'Angélica Zapata Chardonnay Alta', marca_angelica, cat_blancos, 148100, 179200, 29867, 20),
        ('ANG-CAB-002', 'Angélica Zapata Cabernet Sauvignon Alta', marca_angelica, cat_premium, 148100, 179200, 29867, 25);

    -- =====================================================
    -- CATENA ZAPATA (~$350,000-$750,000/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('CAT-APE-001', 'Catena Zapata Adrianna Vineyard Fortuna Terrae', marca_catena, cat_premium, 495870, 600000, 100000, 12),
        ('CAT-APE-002', 'Catena Zapata Adrianna Vineyard River Stones', marca_catena, cat_premium, 454550, 550000, 91667, 15),
        ('CAT-APE-003', 'Catena Zapata Adrianna Vineyard Mundus Bacillus Terrae', marca_catena, cat_premium, 413225, 500000, 83333, 10),
        ('CAT-NIC-001', 'Nicolás Catena Zapata', marca_catena, cat_premium, 600000, 726000, 121000, 18),
        ('CAT-MAL-001', 'Catena Zapata Malbec Argentino', marca_catena, cat_premium, 289260, 350000, 58333, 25),
        ('CAT-EST-001', 'Estiba Reservada', marca_catena, cat_premium, 619835, 750000, 125000, 8),
        ('CAT-WHI-001', 'Catena Zapata White Stones Chardonnay', marca_catena, cat_blancos, 371900, 450000, 75000, 10),
        ('CAT-WHI-002', 'Catena Zapata White Bones Chardonnay', marca_catena, cat_blancos, 371900, 450000, 75000, 10);

    -- =====================================================
    -- DOMAINE NICO (~$180,000/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('DOM-PIN-001', 'Domaine Nico Pinot Noir Grand Père', marca_domaine_nico, cat_tintos, 148760, 180000, 30000, 25),
        ('DOM-CHA-001', 'Domaine Nico Chardonnay Histoire d''A', marca_domaine_nico, cat_blancos, 148760, 180000, 30000, 20),
        ('DOM-PIN-002', 'Domaine Nico Pinot Noir Histoire d''A', marca_domaine_nico, cat_tintos, 165290, 200000, 33333, 15);

    -- =====================================================
    -- TIKAL (~$140,000/caja)
    -- =====================================================
    INSERT INTO productos (codigo, nombre, marca_id, categoria_id, precio_neto, precio_iva, precio_botella, stock) VALUES
        ('TIK-NAT-001', 'Tikal Natural', marca_tikal, cat_tintos, 115700, 140000, 23333, 30),
        ('TIK-AMO-001', 'Tikal Amorio', marca_tikal, cat_tintos, 115700, 140000, 23333, 25),
        ('TIK-PAT-001', 'Tikal Patriota', marca_tikal, cat_tintos, 132230, 160000, 26667, 20),
        ('TIK-JUB-001', 'Tikal Jubilo', marca_tikal, cat_premium, 165290, 200000, 33333, 15);

END $$;

-- =====================================================
-- PROMOCIONES
-- =====================================================
INSERT INTO promociones (titulo, descripcion, tipo, valor, codigo, marca_id, min_cajas, activa)
SELECT
    '15% en Alamos (3+ cajas)',
    'Llevando 3 o más cajas de cualquier vino Alamos, obtené 15% de descuento automático',
    'porcentaje',
    15,
    NULL,
    id,
    3,
    true
FROM marcas WHERE slug = 'alamos';

INSERT INTO promociones (titulo, descripcion, tipo, valor, codigo, marca_id, min_cajas, activa)
SELECT
    '10% en Saint Felicien (2+ cajas)',
    'Comprando 2 o más cajas de Saint Felicien, 10% de descuento',
    'porcentaje',
    10,
    NULL,
    id,
    2,
    true
FROM marcas WHERE slug = 'saint-felicien';

INSERT INTO promociones (titulo, descripcion, tipo, valor, codigo, min_monto, activa) VALUES
    ('Envío gratis +$500k', 'Envío sin cargo en pedidos superiores a $500,000', 'envio_gratis', 0, NULL, 500000, true);

-- Códigos de descuento manuales (estos se aplican por código)
INSERT INTO promociones (titulo, descripcion, tipo, valor, codigo, activa) VALUES
    ('Descuento BODEGA10', '10% de descuento con código BODEGA10', 'porcentaje', 10, 'BODEGA10', true),
    ('Descuento MAYORISTA15', '15% de descuento exclusivo para mayoristas', 'porcentaje', 15, 'MAYORISTA15', true),
    ('Descuento CATENA20', '20% de descuento especial Catena', 'porcentaje', 20, 'CATENA20', true);

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Seed completado exitosamente!';
    RAISE NOTICE 'Categorías: %', (SELECT COUNT(*) FROM categorias);
    RAISE NOTICE 'Marcas: %', (SELECT COUNT(*) FROM marcas);
    RAISE NOTICE 'Productos: %', (SELECT COUNT(*) FROM productos);
    RAISE NOTICE 'Promociones: %', (SELECT COUNT(*) FROM promociones);
END $$;
