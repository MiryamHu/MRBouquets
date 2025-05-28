<?php
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

// — CORS & JSON —
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$user_id = (int) $_SESSION['id_usuario'];

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['password_actual'])) {
    echo json_encode(['valido' => false]);
    exit;
}

$password_actual = $data['password_actual'];

try {
    // Obtiene el hash de la contraseña almacenada
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

    // Verifica la contraseña actual
    $valido = password_verify($password_actual, $hash_actual);

    echo json_encode(['valido' => $valido]);

} catch (Exception $e) {
    error_log("Error en verificar-password-actual.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno en la verificación de la contraseña'
    ]);
}
