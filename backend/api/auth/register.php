<?php
require_once '../conexion.php';

// Configurar CORS para permitir credenciales
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");


// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data['nombre_usuario']) ||
    empty($data['nombre']) ||
    empty($data['apellido']) ||
    empty($data['correo']) ||
    empty($data['contrasena'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos obligatorios']);
    exit;
}

$nombre_usuario = $data['nombre_usuario'];
$nombre = $data['nombre'];
$apellido = $data['apellido'];
$correo = $data['correo'];
$telefono = $data['telefono'] ?? null;
$contrasena = password_hash($data['contrasena'], PASSWORD_DEFAULT);

// 1) Verificar duplicados
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ? OR nombre_usuario = ?");
$stmt->bind_param("ss", $correo, $nombre_usuario);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['error' => 'El correo o nombre de usuario ya existe']);
    exit;
}
$stmt->close();

// 2) Insertar usuario
$stmt = $conn->prepare("
  INSERT INTO usuarios
    (nombre_usuario, nombre, apellido, correo, contrasena, telefono)
  VALUES (?,?,?,?,?,?)
");
$stmt->bind_param("ssssss",
  $nombre_usuario, $nombre, $apellido, $correo, $contrasena, $telefono
);
$stmt->execute();
if ($stmt->affected_rows !== 1) {
    http_response_code(500);
    echo json_encode(['error'=>'Error al crear usuario']);
    exit;
}
$stmt->close();

echo json_encode(['mensaje'=>'Registro exitoso']);
