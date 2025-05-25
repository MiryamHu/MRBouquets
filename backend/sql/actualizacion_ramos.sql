-- Agregar nuevas columnas a la tabla ramos
ALTER TABLE ramos
ADD COLUMN tipo_flor VARCHAR(50) NOT NULL DEFAULT 'Variado' AFTER img,
ADD COLUMN color VARCHAR(50) NOT NULL DEFAULT 'Multicolor' AFTER tipo_flor,
ADD COLUMN disponible BOOLEAN NOT NULL DEFAULT TRUE AFTER color,
ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE AFTER disponible,
ADD COLUMN es_ocasion_especial BOOLEAN NOT NULL DEFAULT FALSE AFTER activo;

-- Actualizar la columna img si es necesario
ALTER TABLE ramos
CHANGE COLUMN url_imagen img VARCHAR(255);

-- Actualizar la columna precio si es necesario
ALTER TABLE ramos
MODIFY COLUMN precio DECIMAL(10,2) NOT NULL;

-- Crear índices para mejorar el rendimiento de las búsquedas
CREATE INDEX idx_ramos_tipo_flor ON ramos(tipo_flor);
CREATE INDEX idx_ramos_color ON ramos(color);
CREATE INDEX idx_ramos_disponible ON ramos(disponible);
CREATE INDEX idx_ramos_activo ON ramos(activo);

-- Insertar algunos datos de ejemplo
INSERT INTO ramos (nombre, descripcion, precio, img, tipo_flor, color, disponible) VALUES
('Ramo Primaveral', 'Hermoso ramo con flores de temporada', 39.99, '/img/Ramo_Primaveral.webp', 'Tulipanes', 'Rosa', true),
('Ramo Romántico', 'Rosas rojas con acabado elegante', 49.99, '/img/Bouquet_Romantico.webp', 'Rosas', 'Rojo', true),
('Ramo Silvestre', 'Flores silvestres variadas', 29.99, '/img/bouquet-silvestre.jpg', 'Margaritas', 'Multicolor', true),
('Ramo Exótico', 'Combinación de flores tropicales', 59.99, '/img/bouquet-exotico.jpg', 'Orquídeas', 'Morado', true),
('Ramo Clásico', 'Rosas blancas con gypsophila', 44.99, '/img/bouquet-clasico.jpg', 'Rosas', 'Blanco', true),
('Ramo Girasoles', 'Girasoles con flores silvestres', 34.99, '/img/bouquet-girasoles.jpg', 'Girasoles', 'Amarillo', true),
('Ramo Delicado', 'Flores en tonos pastel', 39.99, '/img/bouquet-delicado.jpg', 'Peonías', 'Rosa Pastel', true),
('Ramo Campestre', 'Flores de campo variadas', 32.99, '/img/ramo-campestre.jpg', 'Margaritas', 'Multicolor', true),
('Ramo Elegante', 'Rosas y liliums', 54.99, '/img/Bouquet_Elegante.webp', 'Lilium', 'Blanco y Rosa', true),
('Ramo Tropical', 'Flores exóticas coloridas', 64.99, '/img/bouquet-tropical.jpg', 'Ave del Paraíso', 'Naranja', true);

-- Insertar ramos para ocasiones especiales
INSERT INTO ramos (nombre, descripcion, precio, img, tipo_flor, color, disponible) VALUES
('Celebración de Cumpleaños', 'Espectacular ramo festivo con flores vibrantes y globos', 55.00, '/img/bouquet-cumpleanos.jpg', 'Mixto', 'Multicolor', true),
('Romance de Aniversario', 'Elegante arreglo de rosas rojas y flores blancas', 38.00, '/img/bouquet-aniversario.jpg.jpg', 'Rosas', 'Rojo y Blanco', true),
('Éxito en Graduación', 'Sofisticado ramo en tonos del éxito académico', 45.00, '/img/bouquet-graduacion.jpg', 'Mixto', 'Blanco y Dorado', true),
('Sentido Pésame', 'Delicado arreglo floral para expresar condolencias', 60.00, '/img/bouquet-condolencias.jpg', 'Lilium', 'Blanco', true);

-- Actualizar los ramos existentes para marcar los que son de ocasiones especiales
UPDATE ramos 
SET es_ocasion_especial = TRUE 
WHERE nombre IN (
    'Celebración de Cumpleaños',
    'Romance de Aniversario',
    'Éxito en Graduación',
    'Sentido Pésame'
);

-- Actualizar las rutas de las imágenes y marcar como ocasiones especiales
UPDATE ramos
SET img = '/img/ramo-cumpleanos.jpg',
    es_ocasion_especial = TRUE,
    tipo_flor = 'Mixto',
    color = 'Multicolor'
WHERE nombre = 'Celebración de Cumpleaños';

UPDATE ramos
SET img = '/img/ramo-aniversario.jpg',
    es_ocasion_especial = TRUE,
    tipo_flor = 'Rosas',
    color = 'Rojo y Blanco'
WHERE nombre = 'Romance de Aniversario';

UPDATE ramos
SET img = '/img/ramo-graduacion.jpg',
    es_ocasion_especial = TRUE,
    tipo_flor = 'Mixto',
    color = 'Blanco y Dorado'
WHERE nombre = 'Éxito en Graduación';

UPDATE ramos
SET img = '/img/ramo-condolencias.jpg',
    es_ocasion_especial = TRUE,
    tipo_flor = 'Lilium',
    color = 'Blanco'
WHERE nombre = 'Sentido Pésame';

-- Asegurarse de que los demás ramos estén marcados como no ocasiones especiales
UPDATE ramos
SET es_ocasion_especial = FALSE
WHERE nombre NOT IN (
    'Celebración de Cumpleaños',
    'Romance de Aniversario',
    'Éxito en Graduación',
    'Sentido Pésame'
); 
