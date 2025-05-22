<?php
require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../session_config.php';

// Iniciar sesión limpia
start_clean_session();

// Verificar si el usuario está autenticado
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no autenticado']);
    exit;
}

// Verificar tiempo de inactividad
if (isset($_SESSION['last_activity'])) {
    $inactivo = 3600; // 1 hora
    if (time() - $_SESSION['last_activity'] > $inactivo) {
        session_destroy();
        http_response_code(401);
        echo json_encode(['error' => 'Sesión expirada']);
        exit;
    }
    $_SESSION['last_activity'] = time();
}

try {
    // Consulta para obtener los pedidos con sus detalles
    $query = "
        SELECT 
            p.id,
            p.fecha_pedido,
            p.precio_total,
            p.estado,
            GROUP_CONCAT(
                CONCAT(
                    dp.cantidad,
                    'x ',
                    r.nombre,
                    ' (',
                    dp.precio_unitario,
                    '€)'
                )
                SEPARATOR '; '
            ) as detalles
        FROM pedidos p
        JOIN detalle_pedidos dp ON p.id = dp.id_pedido
        JOIN ramos r ON dp.id_ramo = r.id
        WHERE p.id_usuario = ?
        GROUP BY p.id
        ORDER BY p.fecha_pedido DESC
    ";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $_SESSION['id_usuario']);
    $stmt->execute();
    $result = $stmt->get_result();

    $pedidos = [];
    while ($row = $result->fetch_assoc()) {
        // Formatear la fecha
        $fecha = new DateTime($row['fecha_pedido']);
        $row['fecha_pedido'] = $fecha->format('d/m/Y H:i');
        
        // Formatear el precio
        $row['precio_total'] = number_format($row['precio_total'], 2, ',', '.');
        
        $pedidos[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $pedidos
    ]);

} catch (Exception $e) {
    error_log("Error en get-pedidos-usuario.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener los pedidos'
    ]);
} 