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

$data = json_decode(file_get_contents("php://input"), true);

// Valida que las claves existan y no estén vacías
if (empty($data['password_actual']) || empty($data['password_nueva'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos obligatorios']);
    exit;
}

$password_actual = $data['password_actual'];
$password_nueva = $data['password_nueva'];

try {
    // Primero obtén el hash actual almacenado para validar password_actual
    $stmt = $conn->prepare("SELECT contrasena FROM usuarios WHERE id = ?");
    if (!$stmt) throw new Exception("Error en prepare(): " . $conn->error);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($hash_actual);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
        exit;
    }
    $stmt->close();

    // Verifica que la contraseña actual coincida
    if (!password_verify($password_actual, $hash_actual)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Contraseña actual incorrecta']);
        exit;
    }

    // Hashea la nueva contraseña
    $hash_nueva = password_hash($password_nueva, PASSWORD_DEFAULT);

    // Actualiza la contraseña en la base de datos
    $stmt = $conn->prepare("UPDATE usuarios SET contrasena = ? WHERE id = ?");
    if (!$stmt) throw new Exception("Error en prepare(): " . $conn->error);
    $stmt->bind_param("si", $hash_nueva, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows === 1) {
        echo json_encode(['success' => true, 'message' => 'Contraseña actualizada']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudo actualizar la contraseña']);
    }
    $stmt->close();

} catch (Exception $e) {
    error_log("Error en cambiar-contrasena.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno al actualizar la contraseña'
    ]);
}
