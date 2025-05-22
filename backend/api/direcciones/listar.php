<?php

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../session_config.php';

// Iniciar sesión limpia
start_clean_session();

// Verificar si el usuario está autenticado
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit;
}

// Verificar tiempo de inactividad
if (isset($_SESSION['last_activity'])) {
    $inactivo = 3600; // 1 hora
    if (time() - $_SESSION['last_activity'] > $inactivo) {
        session_destroy();
        http_response_code(401);
        echo json_encode(['error' => 'Sesión expirada']);
        exit;
    }
    $_SESSION['last_activity'] = time();
}

$uid = $_SESSION['id_usuario'];
$stmt = $conn->prepare("SELECT * FROM direcciones WHERE usuario_id = ?");
$stmt->bind_param("i", $uid);
$stmt->execute();
$res = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
echo json_encode($res);
