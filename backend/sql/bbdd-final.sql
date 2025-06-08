-- Combined mrbouquets database schema and data separated: CREATES then INSERTS

-- =============================
-- SCHEMA: CREATE DATABASE & TABLES
-- =============================
DROP DATABASE IF EXISTS mrbouquets;
CREATE DATABASE mrbouquets;
USE mrbouquets;

-- Table: usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol ENUM('cliente','admin') DEFAULT 'cliente',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: direcciones
CREATE TABLE direcciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(50) NOT NULL DEFAULT '',
    calle VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    piso VARCHAR(10),
    puerta VARCHAR(10),
    codigo_postal CHAR(5) NOT NULL,
    localidad VARCHAR(50) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    pais VARCHAR(50) DEFAULT 'España',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Table: tipos_ocasion
CREATE TABLE tipos_ocasion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- Table: ramos
CREATE TABLE ramos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    img VARCHAR(255),
    tipo_flor VARCHAR(50) NOT NULL DEFAULT 'Variado',
    color VARCHAR(50) NOT NULL DEFAULT 'Multicolor',
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    es_ocasion_especial BOOLEAN NOT NULL DEFAULT FALSE,
    id_ocasion INT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ocasion) REFERENCES tipos_ocasion(id) ON DELETE SET NULL
);

-- Índices en ramos
CREATE INDEX idx_ramos_tipo_flor ON ramos(tipo_flor);
CREATE INDEX idx_ramos_color ON ramos(color);
CREATE INDEX idx_ramos_disponible ON ramos(disponible);
CREATE INDEX idx_ramos_activo ON ramos(activo);
CREATE INDEX idx_ramos_ocasion ON ramos(id_ocasion);

-- Table: promociones
CREATE TABLE promociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    porcentaje_descuento DECIMAL(5,2) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: ramo_promociones
CREATE TABLE ramo_promociones (
    id_ramo INT NOT NULL,
    id_promocion INT NOT NULL,
    PRIMARY KEY (id_ramo, id_promocion),
    FOREIGN KEY (id_ramo) REFERENCES ramos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_promocion) REFERENCES promociones(id) ON DELETE CASCADE
);

-- Table: estados_pedidos
CREATE TABLE estados_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
ALTER TABLE estados_pedidos ADD UNIQUE INDEX uq_estados_nombre (nombre);

-- Table: pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_direccion INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    precio_total DECIMAL(10,2) NOT NULL,
    id_estado INT,
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_pedidos_direccion FOREIGN KEY (id_direccion) REFERENCES direcciones(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pedidos_estados FOREIGN KEY (id_estado) REFERENCES estados_pedidos(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Table: detalle_pedidos
CREATE TABLE detalle_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_ramo INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ramo) REFERENCES ramos(id) ON DELETE CASCADE
);

-- Table: articulos_carrito
CREATE TABLE articulos_carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_ramo INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ramo) REFERENCES ramos(id) ON DELETE CASCADE
);

-- Table: entregas
CREATE TABLE entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    direccion_entrega VARCHAR(255) NOT NULL,
    fecha_programada DATETIME NOT NULL,
    fecha_entrega DATETIME,
    numero_seguimiento VARCHAR(50),
    estado_entrega ENUM('programada','en_transito','entregado','fallido') DEFAULT 'programada',
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE
);

-- Table: soporte_cliente
CREATE TABLE soporte_cliente (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);


-- =============================
-- DATA: INSERTS
-- =============================
-- Seed data para direcciones
-- INSERT INTO direcciones (id, usuario_id, calle, numero, piso, puerta, codigo_postal, localidad, provincia, pais) VALUES
-- (1, 4, 'Calle Polvoranca', '46', '2', 'c', '28923', 'MADRID', 'Madrid', 'España'),
-- (2, 4, 'Calle ABC', '47', '1', 'c', '28923', 'MADRID', 'Madrid', 'España'),
-- (3, 4, 'Calle Heduan', '47', '1', 'c', '28923', 'Barcelona', 'Barcelona', 'España');

-- Insert tipos_ocasion
INSERT INTO tipos_ocasion (nombre) VALUES
    ('Cumpleaños'),
    ('Condolencias'),
    ('Romance'),
    ('Graduación');

-- Insert ramos
INSERT INTO ramos (nombre, descripcion, precio, img, tipo_flor, color, disponible, activo, es_ocasion_especial, id_ocasion) VALUES
('Ramo Primaveral', 'Hermoso ramo con flores de temporada', 39.99, '/Ramo_Primaveral.webp', 'Tulipanes', 'Rosa', true, true, false, NULL),
('Ramo Romántico', 'Rosas rojas con acabado elegante', 49.99, '/Bouquet_Romantico.webp', 'Rosas', 'Rojo', true, true, false, NULL),
('Ramo Silvestre', 'Flores silvestres variadas', 29.99, '/bouquet-silvestre.jpg', 'Margaritas', 'Multicolor', true, true, false, NULL),
('Ramo Exótico', 'Combinación de flores tropicales', 59.99, '/bouquet-exotico.jpg', 'Orquídeas', 'Morado', true, true, false, NULL),
('Ramo Clásico', 'Rosas blancas con gypsophila', 44.99, '/bouquet-clasico.jpg', 'Rosas', 'Blanco', true, true, false, NULL),
('Ramo Girasoles', 'Girasoles con flores silvestres', 34.99, '/bouquet-girasoles.jpg', 'Girasoles', 'Amarillo', true, true, false, NULL),
('Ramo Delicado', 'Flores en tonos pastel', 39.99, '/bouquet-delicado.jpg', 'Peonías', 'Rosa Pastel', true, true, false, NULL),
('Ramo Campestre', 'Flores de campo variadas', 32.99, '/ramo-campestre.jpg', 'Margaritas', 'Multicolor', true, true, false, NULL),
('Ramo Elegante', 'Rosas y liliums', 54.99, '/Bouquet_Elegante.webp', 'Lilium', 'Blanco y Rosa', true, true, false, NULL),
('Ramo Tropical', 'Flores exóticas coloridas', 64.99, '/bouquet-tropical.jpg', 'Ave del Paraíso', 'Naranja', true, true, false, NULL),
('Celebración de Cumpleaños', 'Espectacular ramo festivo con flores vibrantes y globos', 55.00, '/bouquet-cumpleanos.jpg', 'Mixto', 'Multicolor', true, true, true, 1),
('Romance de Aniversario', 'Elegante arreglo de rosas rojas y flores blancas', 38.00, '/bouquet-aniversario.jpg', 'Rosas', 'Rojo y Blanco', true, true, true, 3),
('Éxito en Graduación', 'Sofisticado ramo en tonos del éxito académico', 45.00, '/bouquet-graduacion.jpg', 'Mixto', 'Blanco y Dorado', true, true, true, 4),
('Sentido Pésame', 'Delicado arreglo floral para expresar condolencias', 60.00, '/bouquet-condolencias.jpg', 'Lilium', 'Blanco', true, true, true, 2);

-- Insert estados_pedidos
INSERT INTO estados_pedidos (nombre) VALUES
    ('confirmado'),
    ('en preparación'),
    ('enviado'),
    ('recibido'),
    ('cancelado')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insert usuario admin con contraseña hasheada (SHA2)
INSERT INTO usuarios (nombre_usuario, nombre, apellido, correo, contrasena, telefono, rol) VALUES
    ('admin', 'Admin', 'User', 'admin@example.com', SHA2('admin123',256), NULL, 'admin');

-- Aquí irían más INSERTs si tienes datos existentes (pedidos, detalle_pedidos, articulos_carrito, entregas, soporte_cliente).

-- FIN del script combinado


ALTER TABLE ramos
  DROP COLUMN disponible,
  ADD COLUMN disponible BOOLEAN GENERATED ALWAYS AS (stock > 0) STORED AFTER color;

  -- Establecer stock inicial de 100 unidades en todos los ramos
UPDATE ramos
  SET stock = 100;