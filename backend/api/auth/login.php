<?php
require_once '../conexion.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"));

if (!$data || !$data->correo || !$data->contrasena) {
    echo json_encode(['error' => 'Campos requeridos']);
    exit;
}

$correo = $data->correo;
$contrasena = $data->contrasena;

$stmt = $conn->prepare("SELECT * FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($usuario = $result->fetch_assoc()) {
    if (password_verify($contrasena, $usuario['contrasena'])) {
        unset($usuario['contrasena']);
        echo json_encode(['mensaje' => 'Login exitoso', 'usuario' => $usuario]);
    } else {
        echo json_encode(['error' => 'Contraseña incorrecta']);
    }
} else {
    echo json_encode(['error' => 'Usuario no encontrado']);
}
$stmt->close();
