<?php
require_once __DIR__ . '/../session_config.php';

// Configurar COOP y COEP
header('Cross-Origin-Opener-Policy: same-origin');
header('Cross-Origin-Embedder-Policy: require-corp');

// Configurar CORS
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Iniciar sesión -- no se debe volver a llamar cuando ya se esta llamando en sesion_config
// session_name('MRBSESSID');
// session_start();

// Verificar si la sesión está activa y válida
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['last_activity'])) {
    error_log("Sesión inválida - no hay datos de usuario o última actividad");
    http_response_code(401);
    echo json_encode(['error' => 'Sesión inválida']);
    exit;
}

// Verificar tiempo de inactividad
$inactivo = 3600; // 1 hora
if (time() - $_SESSION['last_activity'] > $inactivo) {
    error_log("Sesión expirada por inactividad");
    session_destroy();
    http_response_code(401);
    echo json_encode(['error' => 'Sesión expirada']);
    exit;
}

// Actualizar tiempo de última actividad
$_SESSION['last_activity'] = time();

// Devolver respuesta exitosa
echo json_encode([
    'status' => 'active',
    'user_id' => $_SESSION['id_usuario'],
    'last_activity' => $_SESSION['last_activity']
]);
exit;