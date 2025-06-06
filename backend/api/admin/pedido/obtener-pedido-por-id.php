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

// A partir de aquí, SOLO aceptamos PUT
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido. Use GET.']);
    exit;
}
start_clean_session();

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

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    // 3) Validar que llega ?id= y es numérico
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Falta parámetro id o no es válido']);
        exit;
    }
    $idPedido = intval($_GET['id']);

    // 4) Obtener los datos generales del pedido, incluyendo id_estado y estado_nombre
    $sqlPedido = "
        SELECT
            p.id,
            p.id_usuario,
            CONCAT(u.nombre, ' ', u.apellido) AS cliente,
            p.fecha_pedido,
            p.precio_total,
            p.id_estado,
            e.nombre AS estado_nombre
        FROM pedidos p
        JOIN usuarios u  ON p.id_usuario = u.id
        JOIN estados_pedidos e ON p.id_estado = e.id
        WHERE p.id = ?
        LIMIT 1
    ";
    $stmt1 = $conn->prepare($sqlPedido);
    $stmt1->bind_param('i', $idPedido);
    $stmt1->execute();
    $resPedido = $stmt1->get_result();

    if ($resPedido->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Pedido no encontrado']);
        exit;
    }
    $rowP = $resPedido->fetch_assoc();

    // Formatear fecha y precio_total:
    $fechaObj = new DateTime($rowP['fecha_pedido']);
    $rowP['fecha_pedido'] = $fechaObj->format('d/m/Y H:i');
    $rowP['precio_total'] = number_format($rowP['precio_total'], 2, ',', '.');

    // 5) Obtener los ítems de detalle_pedidos para este pedido
    $sqlItems = "
        SELECT
            dp.id_ramo AS id_producto,
            r.nombre AS producto,
            dp.cantidad,
            dp.precio_unitario
        FROM detalle_pedidos dp
        JOIN ramos r ON dp.id_ramo = r.id
        WHERE dp.id_pedido = ?
    ";
    $stmt2 = $conn->prepare($sqlItems);
    $stmt2->bind_param('i', $idPedido);
    $stmt2->execute();
    $resItems = $stmt2->get_result();

    $items = [];
    while ($rowI = $resItems->fetch_assoc()) {
        // precio unitario formateado: "60,00" → number_format(...)
        $pu_formateado = number_format($rowI['precio_unitario'], 2, ',', '.');
        // subtotal en número y luego formateado
        $subtotal_num = $rowI['cantidad'] * floatval($rowI['precio_unitario']);
        $sub_formateado = number_format($subtotal_num, 2, ',', '.');

        $items[] = [
            'id_producto'     => intval($rowI['id_producto']),
            'cantidad'        => intval($rowI['cantidad']),
            'producto'        => $rowI['producto'],
            'precio_unitario' => $pu_formateado,
            'subtotal'        => $sub_formateado
        ];
    }

    // 6) Armar la respuesta final, con id_estado y estado_nombre
    $detallePedido = [
        'id'            => intval($rowP['id']),
        'id_usuario'    => intval($rowP['id_usuario']),
        'cliente'       => $rowP['cliente'],
        'fecha_pedido'  => $rowP['fecha_pedido'],
        'precio_total'  => $rowP['precio_total'],
        'id_estado'     => intval($rowP['id_estado']),
        'estado_nombre' => $rowP['estado_nombre'],
        'items'         => $items
    ];

    echo json_encode([
        'success' => true,
        'data'    => $detallePedido
    ]);

} catch (Exception $e) {
    error_log("Error en obtener-pedido-por-id.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al obtener el pedido'
    ]);
}
