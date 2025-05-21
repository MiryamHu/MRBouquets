-- cambios en direcciones hay que ponerle nombre a la direccion

CREATE TABLE direcciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
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