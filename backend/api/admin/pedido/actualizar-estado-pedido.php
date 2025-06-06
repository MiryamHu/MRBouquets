<?php
require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../session_config.php';

// CORS y tipo de respuesta
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Responder al preflight de CORS
    http_response_code(204);
    exit;
}

// A partir de aquí, SOLO aceptamos PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido. Use PUT.']);
    exit;
}

start_clean_session();

// Verificar autenticación
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

// Control de timeout de sesión
if (isset($_SESSION['last_activity'])) {
    $inactivo = 3600;
    if (time() - $_SESSION['last_activity'] > $inactivo) {
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Sesión expirada']);
        exit;
    }
}
$_SESSION['last_activity'] = time();

// Leer el JSON del cuerpo
$input = file_get_contents('php://input');
$data  = json_decode($input, true);

// Validar parámetros
if (!isset($data['id']) || !isset($data['id_estado']) 
    || !is_numeric($data['id']) || !is_numeric($data['id_estado'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parámetros inválidos']);
    exit;
}
$idPedido = intval($data['id']);
$idEstado = intval($data['id_estado']);

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // Verificar que el estado exista
    $verif = $conn->prepare("SELECT COUNT(*) AS cnt FROM estados_pedidos WHERE id = ?");
    $verif->bind_param('i', $idEstado);
    $verif->execute();
    $resVerif = $verif->get_result()->fetch_assoc();
    if (intval($resVerif['cnt']) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Estado no válido']);
        exit;
    }
    $verif->close();

    // Actualizar el pedido
    $stmt = $conn->prepare("
        UPDATE pedidos
        SET id_estado = ?
        WHERE id = ?
    ");
    $stmt->bind_param('ii', $idEstado, $idPedido);
    $stmt->execute();

    if ($stmt->affected_rows === 0) {
        // Revisar si existe el pedido
        $check = $conn->prepare("SELECT COUNT(*) AS cnt2 FROM pedidos WHERE id = ?");
        $check->bind_param('i', $idPedido);
        $check->execute();
        $cnt2 = $check->get_result()->fetch_assoc()['cnt2'];
        if (intval($cnt2) === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Pedido no encontrado']);
            exit;
        }
        // Si existe pero no cambió nada, asumimos que ya estaba en ese mismo estado
    }
    $stmt->close();

    echo json_encode(['success' => true, 'message' => 'Estado actualizado correctamente']);
} catch (Exception $e) {
    error_log("Error en update-pedido-estado.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al actualizar el estado']);
}
