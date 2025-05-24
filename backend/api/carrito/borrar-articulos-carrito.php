<?php
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
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

$delete = $conn->prepare("DELETE FROM articulos_carrito WHERE id = ? AND id_usuario = ?");
$delete->bind_param("ii", $id, $user_id);
$delete->execute();

if ($delete->affected_rows === 1) {
    echo json_encode(['mensaje' => 'Artículo eliminado']);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Artículo no encontrado']);
}
exit;
