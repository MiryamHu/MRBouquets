<?php
// C:\xampp\htdocs\MRBouquets\backend\api\pedido.php
// Mostrar todos los errores y avisos
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
// 1) CORS headers
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// 2) Responder preflight y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 3) Conectar con la base de datos
require_once __DIR__ . '/../conexion.php';

header("Content-Type: application/json");
session_start();

// 4) Leer JSON recibido
$data = json_decode(file_get_contents("php://input"), true);

if (
    empty($data['total']) ||
    !isset($_SESSION['id_usuario'])
) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos del pedido o no está autenticado']);
    exit;
}

$id_usuario   = $_SESSION['id_usuario'];
$precio_total = $data['total'];

// 5) Insertar pedido con estado 'confirmado'
$stmt = $conn->prepare("
    INSERT INTO pedidos (id_usuario, precio_total, estado)
    VALUES (?, ?, 'confirmado')
");
$stmt->bind_param("id", $id_usuario, $precio_total);
$stmt->execute();

if ($stmt->affected_rows !== 1) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear el pedido']);
    exit;
}

$id_pedido = $stmt->insert_id;
$stmt->close();

// 6) Devolver respuesta
echo json_encode([
    'mensaje'   => 'Pedido confirmado',
    'id_pedido' => $id_pedido
]);
