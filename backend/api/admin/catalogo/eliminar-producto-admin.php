<?php
require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../session_config.php';

// CORS y respuesta JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success'=>false,'error'=>'Use DELETE']);
    exit;
}

start_clean_session();

if (!isset($_SESSION['id_usuario']) || ($_SESSION['rol'] ?? '')!=='admin') {
    http_response_code(403);
    echo json_encode(['success'=>false,'error'=>'Acceso denegado']);
    exit;
}

// Obtener ID de la query string
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'ID inválido']);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM ramos WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode(['success'=>true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'No se pudo eliminar']);
}
