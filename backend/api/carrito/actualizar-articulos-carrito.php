<?php
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$user_id = $_SESSION['id_usuario'];

// Obtener id del URL
$id = null;
if (preg_match('#/api/carrito/(\d+)#', $_SERVER['REQUEST_URI'], $matches)) {
    $id = (int)$matches[1];
}

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['cantidad'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Cantidad requerida']);
    exit;
}

$cantidad = (int)$data['cantidad'];

$update = $conn->prepare("UPDATE articulos_carrito SET cantidad = ? WHERE id = ? AND id_usuario = ?");
$update->bind_param("iii", $cantidad, $id, $user_id);
$update->execute();

if ($update->affected_rows === 1) {
    echo json_encode(['mensaje' => 'Cantidad actualizada']);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Artículo no encontrado']);
}
exit;
