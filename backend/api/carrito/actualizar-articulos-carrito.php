<?php
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

// — CORS & JSON —
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// — Sesión limpia —
start_clean_session();

// — Autenticación —
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}
// refrescar inactividad
if (isset($_SESSION['last_activity']) && time() - $_SESSION['last_activity'] > 3600) {
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Sesión expirada']);
    exit;
}
$_SESSION['last_activity'] = time();

$user_id = (int) $_SESSION['id_usuario'];

// — Obtener ID del artículo desde query string —
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
}

// — Leer nuevo valor de cantidad —
$body = json_decode(file_get_contents('php://input'), true);
if (!isset($body['cantidad']) || !is_numeric($body['cantidad']) || (int)$body['cantidad'] < 1) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Cantidad requerida o inválida']);
    exit;
}
$cantidad = (int) $body['cantidad'];

try {
    $stmt = $conn->prepare(
        "UPDATE articulos_carrito
         SET cantidad = ?
         WHERE id = ? AND id_usuario = ?"
    );
    if (!$stmt) {
        throw new Exception("Error en prepare(): " . $conn->error);
    }
    $stmt->bind_param("iii", $cantidad, $id, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows === 1) {
        echo json_encode(['success' => true, 'message' => 'Cantidad actualizada']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Artículo no encontrado o sin cambios']);
    }
    $stmt->close();

} catch (Exception $e) {
    error_log("Error en actualizar-articulos-carrito.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error interno al actualizar cantidad'
    ]);
}

