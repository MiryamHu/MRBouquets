<?php

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../session_config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');

start_clean_session();

// Verificar sesión (si quieres restringir a admins, agrega esa lógica)
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $sql = "SELECT id, nombre FROM estados_pedidos ORDER BY id ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $res = $stmt->get_result();

    $estados = [];
    while ($row = $res->fetch_assoc()) {
        $estados[] = [
            'id'     => intval($row['id']),
            'nombre' => $row['nombre']
        ];
    }

    echo json_encode([
        'success' => true,
        'data'    => $estados
    ]);
} catch (Exception $e) {
    error_log("Error en get-estados-pedidos.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al obtener estados'
    ]);
}
