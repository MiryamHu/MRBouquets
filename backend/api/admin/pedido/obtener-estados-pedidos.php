<?php

require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../session_config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Responder al preflight de CORS
    http_response_code(204);
    exit;
}

// A partir de aquí, SOLO aceptamos GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido. Use GET.']);
    exit;
}

start_clean_session();

// Verificar sesión (si quieres restringir a admins, agrega esa lógica)
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}
// 1) Verificar que el usuario está autenticado
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

// 2) Control de timeout de sesión (1 hora)
if (isset($_SESSION['last_activity'])) {
    $inactivo = 3600; // 1 hora en segundos
    if (time() - $_SESSION['last_activity'] > $inactivo) {
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Sesión expirada']);
        exit;
    }
}
$_SESSION['last_activity'] = time();

try {
    $sql = "SELECT id, nombre FROM estados_pedidos ORDER BY id ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $res = $stmt->get_result();

    $estados = [];
    while ($row = $res->fetch_assoc()) {
        $estados[] = [
            'id'     => intval($row['id']),
            'nombre' => $row['nombre']
        ];
    }

    echo json_encode([
        'success' => true,
        'data'    => $estados
    ]);
} catch (Exception $e) {
    error_log("Error en get-estados-pedidos.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al obtener estados'
    ]);
}
