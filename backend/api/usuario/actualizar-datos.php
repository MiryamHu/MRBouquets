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

if (
    empty($data['nombre_usuario']) ||
    empty($data['nombre']) ||
    empty($data['apellido']) ||
    empty($data['telefono'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos obligatorios']);
    exit;
}

$nombre_usuario = $data['nombre_usuario'];
$nombre = $data['nombre'];
$apellido = $data['apellido'];
$telefono = $data['telefono'];

try {
    $stmt = $conn->prepare(
        "UPDATE usuarios
        SET nombre_usuario = ?, nombre = ?, apellido = ?, telefono = ?
        WHERE id = ?"
    );
    if (!$stmt) {
        throw new Exception("Error en prepare(): " . $conn->error);
    }
    $stmt->bind_param("ssssi", $nombre_usuario, $nombre, $apellido, $telefono, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows === 1) {
        echo json_encode(['success' => true, 'message' => 'Datos actualizados']);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
    }
    $stmt->close();

} catch (Exception $e) {
    error_log("Error en actualizar-datos.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error interno al actualizar los datos del usuario'
    ]);
}

