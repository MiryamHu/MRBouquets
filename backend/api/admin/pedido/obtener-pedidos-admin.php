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

// Verificar sesión
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
    
}

if ( ($_SESSION['rol'] ?? '') !== 'admin' ) {
    http_response_code(403);
    echo json_encode(['success'=>false,'error'=>'Acceso denegado']);
    exit;
}

if (isset($_SESSION['last_activity'])) {
    $inactivo = 3600;
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
    $query = "
        SELECT 
            p.id,
            p.id_usuario,
            CONCAT(u.nombre, ' ', u.apellido) AS cliente,
            p.fecha_pedido,
            p.precio_total,
            p.id_estado,
            e.nombre AS estado_nombre
        FROM pedidos p
        JOIN usuarios u       ON p.id_usuario = u.id
        JOIN estados_pedidos e ON p.id_estado = e.id
        ORDER BY p.fecha_pedido DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
        // Formatear fecha y precio_total
        $fecha = new DateTime($row['fecha_pedido']);
        $row['fecha_pedido'] = $fecha->format('d/m/Y H:i');
        $row['precio_total'] = number_format($row['precio_total'], 2, ',', '.');

        $pedidos[] = [
            'id'            => intval($row['id']),
            'id_usuario'    => intval($row['id_usuario']),
            'cliente'       => $row['cliente'],
            'fecha_pedido'  => $row['fecha_pedido'],
            'precio_total'  => $row['precio_total'],
            'id_estado'     => intval($row['id_estado']),
            'estado_nombre' => $row['estado_nombre']
        ];
    }

    echo json_encode([
        'success' => true,
        'data'    => $pedidos
    ]);
} catch (Exception $e) {
    error_log("Error en obtener-pedidos-admin.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al obtener los pedidos'
    ]);
}
