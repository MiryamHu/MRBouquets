DROP DATABASE IF EXISTS mrbouquets;
CREATE DATABASE mrbouquets;
USE mrbouquets;


CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,  
    telefono VARCHAR(20),
    rol ENUM('cliente','admin') DEFAULT 'cliente',
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE direcciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
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


CREATE TABLE ramos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    url_imagen VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE promociones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    porcentaje_descuento DECIMAL(5,2) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE ramo_promociones (
    id_ramo INT NOT NULL,
    id_promocion INT NOT NULL,
    PRIMARY KEY (id_ramo, id_promocion),
    FOREIGN KEY (id_ramo) REFERENCES ramos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_promocion) REFERENCES promociones(id) ON DELETE CASCADE
);


CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_direccion INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    precio_total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente','confirmado','en_proceso','entregado','cancelado') DEFAULT 'pendiente',
    CONSTRAINT fk_pedidos_usuario
      FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
    CONSTRAINT fk_pedidos_direccion
      FOREIGN KEY (id_direccion) REFERENCES direcciones(id)
      ON DELETE RESTRICT
      ON UPDATE CASCADE
);



CREATE TABLE detalle_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_ramo INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ramo) REFERENCES ramos(id) ON DELETE CASCADE
);


CREATE TABLE articulos_carrito (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_ramo INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_ramo) REFERENCES ramos(id) ON DELETE CASCADE
);


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


CREATE TABLE soporte_cliente (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha DATETIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);