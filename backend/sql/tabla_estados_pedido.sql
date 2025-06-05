-- 1.1) Creamos la tabla que contendrá el catálogo de estados de pedido
CREATE TABLE IF NOT EXISTS estados_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 1.2) Insertamos algunos estados iniciales.
INSERT INTO estados_pedidos (nombre) VALUES
    ('confirmado'),
    ('en preparación'),
    ('enviado'),
    ('recibido'),
    ('cancelado')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);


-- 2.1) (Opcional) Renombrar temporalmente la columna de texto que existía    
ALTER TABLE pedidos CHANGE COLUMN estado estado_textual VARCHAR(50);


-- 2.2) Añadir columna id_estado, enlazada como clave foránea a estados_pedidos(id)
ALTER TABLE pedidos
    ADD COLUMN id_estado INT AFTER precio_total,
    ADD CONSTRAINT fk_pedidos_estados
        FOREIGN KEY (id_estado)
        REFERENCES estados_pedidos(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;


-- 3.1) Actualizar cada pedido para que id_estado apunte al id correcto
UPDATE pedidos AS p
JOIN estados_pedidos AS e
    ON e.nombre = p.estado_textual
SET p.id_estado = e.id;


-- 4.1) (Opcional) Borrar la columna textual antigua
ALTER TABLE pedidos DROP COLUMN estado_textual;




-- 5.1) Eliminar la tabla temporal para modificar los estados
-- 1) Asegurar que 'nombre' sea único
-- 1) Asegurar que 'nombre' sea único
ALTER TABLE estados_pedidos
ADD UNIQUE INDEX uq_estados_nombre (nombre);

-- 2) Eliminar cualquier estado distinto a esos cinco
DELETE FROM estados_pedidos
WHERE nombre NOT IN ('confirmado','en preparación','enviado','recibido','cancelado');

-- 3) Insertar/actualizar los cinco estados
INSERT INTO estados_pedidos (nombre) VALUES
  ('confirmado'),
  ('en preparación'),
  ('enviado'),
  ('recibido'),
  ('cancelado')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
