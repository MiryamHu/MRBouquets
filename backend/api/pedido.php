<?php
// C:\xampp\htdocs\MRBouquets\backend\api\pedido.php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

ob_start();

require_once __DIR__ . '/session_config.php';
require_once __DIR__ . '/conexion.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_name('MRBSESSID');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No hay sesión activa. Por favor, inicie sesión nuevamente.']);
    exit;
}

if (isset($_SESSION['last_activity'])) {
    $inactivo = 3600;
    if (time() - $_SESSION['last_activity'] > $inactivo) {
        session_destroy();
        http_response_code(401);
        echo json_encode(['error' => 'Sesión expirada']);
        exit;
    }
    $_SESSION['last_activity'] = time();
}

$input = file_get_contents("php://input");
$data  = json_decode($input, true);

if (empty($data['total']) || empty($data['items']) || empty($data['id_direccion'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos del pedido']);
    exit;
}

$id_usuario   = $_SESSION['id_usuario'];
$precio_total = $data['total'];
$items        = $data['items'];
$id_direccion = (int) $data['id_direccion'];

$stmt = $conn->prepare("SELECT id FROM direcciones WHERE id = ? AND usuario_id = ?");
$stmt->bind_param("ii", $id_direccion, $id_usuario);
$stmt->execute();
if (!$stmt->get_result()->fetch_assoc()) {
    http_response_code(403);
    echo json_encode(['error' => 'Dirección no válida']);
    exit;
}
$stmt->close();

try {
    $conn->begin_transaction();

    $stmt = $conn->prepare("
        INSERT INTO pedidos (id_usuario, id_direccion, precio_total, estado)
        VALUES (?, ?, ?, 'confirmado')
    ");
    $stmt->bind_param("iid", $id_usuario, $id_direccion, $precio_total);
    $stmt->execute();

    if ($stmt->affected_rows !== 1) {
        throw new Exception('Error al crear el pedido');
    }

    $id_pedido = $stmt->insert_id;
    $stmt->close();

    $stmt = $conn->prepare("
        INSERT INTO detalle_pedidos (id_pedido, id_ramo, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
    ");

    foreach ($items as $item) {
        $stmt->bind_param("iiid",
            $id_pedido,
            $item['id'],
            $item['quantity'],
            $item['price']
        );
        $stmt->execute();

        if ($stmt->affected_rows !== 1) {
            throw new Exception('Error al guardar detalle del pedido');
        }
    }

    $stmt->close();
    $conn->commit();

    echo json_encode([
        'mensaje'   => 'Pedido confirmado',
        'id_pedido' => $id_pedido
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'Error al procesar el pedido: ' . $e->getMessage()]);
}

ob_end_flush();
