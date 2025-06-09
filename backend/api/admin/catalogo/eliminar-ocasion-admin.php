<?php
require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../session_config.php';

// CORS y JSON
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
// Autenticación + rol admin
if (!isset($_SESSION['id_usuario'], $_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success'=>false,'error'=>'No autenticado']);
    exit;
}
if (($_SESSION['rol'] ?? '')!=='admin') {
    http_response_code(403);
    echo json_encode(['success'=>false,'error'=>'Acceso denegado']);
    exit;
}
// timeout
if (isset($_SESSION['last_activity']) && time()-$_SESSION['last_activity']>3600) {
    session_unset(); session_destroy();
    http_response_code(401);
    echo json_encode(['success'=>false,'error'=>'Sesión expirada']);
    exit;
}
$_SESSION['last_activity'] = time();
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Leer parámetro id
parse_str(file_get_contents('php://input'), $params);
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
if ($id<=0) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'ID inválido']);
    exit;
}

// Eliminar
try {
    $stmt = $conn->prepare("DELETE FROM tipos_ocasion WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    if ($stmt->affected_rows>0) {
        echo json_encode(['success'=>true]);
    } else {
        http_response_code(404);
        echo json_encode(['success'=>false,'error'=>'Ocasión no encontrada']);
    }
} catch (Exception $e) {
    error_log("eliminar-ocasion error: ".$e->getMessage());
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error al eliminar ocasión']);
}
