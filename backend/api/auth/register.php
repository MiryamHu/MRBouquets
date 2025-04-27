<?php
require_once '../conexion.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));

if (
    !$data || !$data->nombre_usuario || !$data->nombre || !$data->apellido ||
    !$data->correo || !$data->contrasena
) {
    echo json_encode(['error' => 'Faltan campos obligatorios']);
    exit;
}

$nombre_usuario = $data->nombre_usuario;
$nombre = $data->nombre;
$apellido = $data->apellido;
$correo = $data->correo;
$telefono = $data->telefono ?? null;
$contrasena = password_hash($data->contrasena, PASSWORD_DEFAULT);

// Verifica si ya existe correo o usuario
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ? OR nombre_usuario = ?");
$stmt->bind_param("ss", $correo, $nombre_usuario);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['error' => 'El correo o nombre de usuario ya existe']);
    exit;
}
$stmt->close();

// Inserta el nuevo usuario
$stmt = $conn->prepare(
    "INSERT INTO usuarios (nombre_usuario, nombre, apellido, correo, contrasena, telefono) VALUES (?, ?, ?, ?, ?, ?)"
);
$stmt->bind_param("ssssss", $nombre_usuario, $nombre, $apellido, $correo, $contrasena, $telefono);
$stmt->execute();

echo json_encode(['mensaje' => 'Registro exitoso']);
$stmt->close();
