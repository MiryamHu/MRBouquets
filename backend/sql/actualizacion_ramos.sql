-- Agregar nuevas columnas a la tabla ramos
ALTER TABLE ramos
ADD COLUMN tipo_flor VARCHAR(50) NOT NULL DEFAULT 'Variado' AFTER img,
ADD COLUMN color VARCHAR(50) NOT NULL DEFAULT 'Multicolor' AFTER tipo_flor,
ADD COLUMN disponible BOOLEAN NOT NULL DEFAULT TRUE AFTER color,
ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE AFTER disponible;

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
('Ramo Primaveral', 'Hermoso ramo con flores de temporada', 39.99, '/assets/images/ramo-primaveral.jpg', 'Tulipanes', 'Rosa', true),
('Ramo Romántico', 'Rosas rojas con acabado elegante', 49.99, '/assets/images/ramo-romantico.jpg', 'Rosas', 'Rojo', true),
('Ramo Silvestre', 'Flores silvestres variadas', 29.99, '/assets/images/ramo-silvestre.jpg', 'Margaritas', 'Multicolor', true),
('Ramo Exótico', 'Combinación de flores tropicales', 59.99, '/assets/images/ramo-exotico.jpg', 'Orquídeas', 'Morado', true),
('Ramo Clásico', 'Rosas blancas con gypsophila', 44.99, '/assets/images/ramo-clasico.jpg', 'Rosas', 'Blanco', true),
('Ramo Girasoles', 'Girasoles con flores silvestres', 34.99, '/assets/images/ramo-girasoles.jpg', 'Girasoles', 'Amarillo', true),
('Ramo Delicado', 'Flores en tonos pastel', 39.99, '/assets/images/ramo-delicado.jpg', 'Peonías', 'Rosa Pastel', true),
('Ramo Campestre', 'Flores de campo variadas', 32.99, '/assets/images/ramo-campestre.jpg', 'Margaritas', 'Multicolor', true),
('Ramo Elegante', 'Rosas y liliums', 54.99, '/assets/images/ramo-elegante.jpg', 'Lilium', 'Blanco y Rosa', true),
('Ramo Tropical', 'Flores exóticas coloridas', 64.99, '/assets/images/ramo-tropical.jpg', 'Ave del Paraíso', 'Naranja', true); 