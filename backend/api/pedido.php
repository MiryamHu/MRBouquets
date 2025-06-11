<?php

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
$precio_total = floatval($data['total']);
$items        = $data['items'];
$id_direccion = (int) $data['id_direccion'];

// Verificar que la dirección pertenezca al usuario
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

    // Verificar stock disponible para todos los items
    $stmt = $conn->prepare("
        SELECT id, stock, nombre 
        FROM ramos 
        WHERE id = ? AND stock >= ?
    ");

    foreach ($items as $item) {
        $stmt->bind_param("ii", $item['id'], $item['quantity']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if (!$result->fetch_assoc()) {
            throw new Exception("Stock insuficiente para el ramo con ID: " . $item['id']);
        }
    }
    $stmt->close();

    // 1) Insertar en 'pedidos' con id_estado = 1 (confirmado)
    $estadoPendiente = 1;

    $stmt = $conn->prepare("
        INSERT INTO pedidos (id_usuario, id_direccion, precio_total, id_estado)
        VALUES (?, ?, ?, ?)
    ");

    if ($stmt === false) {
        error_log("Error en prepare(): " . $conn->error);
        http_response_code(500);
        echo json_encode(['error' => 'Error interno del servidor']);
        exit;
    }

    $stmt->bind_param("iidi", $id_usuario, $id_direccion, $precio_total, $estadoPendiente);
    $stmt->execute();

    if ($stmt->affected_rows !== 1) {
        throw new Exception('Error al crear el pedido');
    }

    $id_pedido = $stmt->insert_id;
    $stmt->close();

    // 2) Insertar cada ítem en detalle_pedidos y actualizar stock
    $stmtDetalle = $conn->prepare("
        INSERT INTO detalle_pedidos (id_pedido, id_ramo, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
    ");

    $stmtStock = $conn->prepare("
        UPDATE ramos 
        SET stock = stock - ? 
        WHERE id = ?
    ");

    if ($stmtDetalle === false || $stmtStock === false) {
        throw new Exception("Error en prepare: " . $conn->error);
    }

    foreach ($items as $item) {
        // Insertar detalle
        $stmtDetalle->bind_param("iiid",
            $id_pedido,
            $item['id'],
            $item['quantity'],
            $item['price']
        );
        $stmtDetalle->execute();

        if ($stmtDetalle->affected_rows !== 1) {
            throw new Exception('Error al guardar detalle del pedido');
        }

        // Actualizar stock
        $stmtStock->bind_param("ii", $item['quantity'], $item['id']);
        $stmtStock->execute();

        if ($stmtStock->affected_rows !== 1) {
            throw new Exception('Error al actualizar el stock');
        }
    }

    $stmtDetalle->close();
    $stmtStock->close();

    // 3) Vaciar el carrito del usuario
    $stmtVaciar = $conn->prepare("
        DELETE FROM articulos_carrito 
        WHERE id_usuario = ?
    ");
    $stmtVaciar->bind_param("i", $id_usuario);
    $stmtVaciar->execute();
    $stmtVaciar->close();

    $conn->commit();

    echo json_encode([
        'mensaje'   => 'Pedido registrado como pendiente',
        'id_pedido' => $id_pedido
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => 'Error al procesar el pedido: ' . $e->getMessage()]);
}

ob_end_flush();
