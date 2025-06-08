<?php
// 1) Desactivar la salida de errores en HTML
ini_set('display_errors', 0);
error_reporting(0);

// 2) Encabezados CORS y JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Preflight: OK pero sin cuerpo
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error'   => 'Método no permitido. Use GET.'
    ]);
    exit;
}

// 3) Conexión a BBDD (ajusta la ruta si es distinta)
require_once __DIR__ . '/../conexion.php';

try {
    $sql  = "SELECT id, nombre FROM tipos_ocasion ORDER BY id ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $res  = $stmt->get_result();

    $ocasiones = [];
    while ($row = $res->fetch_assoc()) {
        $ocasiones[] = [
            'id'     => (int) $row['id'],
            'nombre' => $row['nombre']
        ];
    }

    // 4) Devolver JSON limpio
    echo json_encode([
        'success' => true,
        'data'    => $ocasiones
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    error_log("Error en get-ocasion.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al obtener las ocasiones'
    ]);
}
