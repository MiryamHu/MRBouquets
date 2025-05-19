INSERT INTO usuarios (
    nombre_usuario, nombre, apellido, correo, contrasena, telefono, rol
) VALUES (
    'juanito', 'Juan', 'Pérez', 'juan@example.com',
    '$2y$10$WzOfqLb6GZYa1BbHoBj6j.O/S1NlDmXEKGCH4FCgHE9JzhcwCWYyG',
    '675673405', 'cliente'
);
//123456

INSERT INTO usuarios (
  nombre_usuario,
  nombre,
  apellido,
  correo,
  contrasena,
  telefono,
  rol
) VALUES (
  'admin',                                    -- nombre de usuario
  'Administrador',                            -- nombre
  'Principal',                                -- apellido
  'admin@example.com',                        -- correo
  '$2b$12$F1uUN1RhZzcz392T1RYEMOTCSrFV6LE0yqxKx0C9tEF1IPt8zgre.',  -- hash bcrypt de 'admin123'
  '600123456',                                -- teléfono (opcional)
  'admin'                                     -- rol: cliente|admin
);
