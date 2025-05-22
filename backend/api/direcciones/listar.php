<?php
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$user_id = $_SESSION['id_usuario'];

$stmt = $conn->prepare("SELECT * FROM direcciones WHERE usuario_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$direcciones = [];
while ($row = $result->fetch_assoc()) {
    $direcciones[] = $row;
}

echo json_encode($direcciones);
exit;
