<?php
require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../session_config.php';

// CORS y JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false,'error'=>'Use POST']);
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

// Validar input
$nombre = trim($_POST['nombre'] ?? '');

$input = file_get_contents('php://input');
$data  = json_decode($input, true);
$nombre = trim($data['nombre'] ?? '');

if ($nombre==='') {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Falta nombre']);
    exit;
}

// Insertar
try {
    $stmt = $conn->prepare("INSERT INTO tipos_ocasion (nombre) VALUES (?)");
    $stmt->bind_param('s', $nombre);
    $stmt->execute();
    echo json_encode([
      'success'=>true,
      'data'=>[
        'id'=>$stmt->insert_id,
        'nombre'=>$nombre
      ]
    ]);
} catch (Exception $e) {
    error_log("crear-ocasion error: ".$e->getMessage());
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error al crear ocasión']);
}
