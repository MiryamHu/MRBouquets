<?php
require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../session_config.php';

// Configurar CORS
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $query = "
        SELECT 
            r.id,
            r.nombre,
            r.descripcion,
            r.precio,
            r.img,
            r.tipo_flor,
            r.color,
            r.disponible,
            r.es_ocasion_especial,
            r.id_ocasion,
            r.activo,
            t.nombre as nombre_ocasion
        FROM ramos r
        LEFT JOIN tipos_ocasion t ON r.id_ocasion = t.id
        WHERE r.activo = 1
        ORDER BY r.nombre ASC
    ";

    $result = $conn->query($query);

    if (!$result) {
        throw new Exception("Error en la consulta: " . $conn->error);
    }

    $ramos = [];
    while ($row = $result->fetch_assoc()) {
        // Asegurarse de que los tipos de datos sean correctos
        $row['id'] = (int)$row['id'];
        $row['precio'] = (float)$row['precio'];
        $row['disponible'] = (bool)$row['disponible'];
        $row['activo'] = (bool)$row['activo'];
        $row['es_ocasion_especial'] = (bool)$row['es_ocasion_especial'];
        if ($row['id_ocasion'] !== null) {
            $row['id_ocasion'] = (int)$row['id_ocasion'];
        }
        
        $ramos[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $ramos
    ]);

} catch (Exception $e) {
    error_log("Error en get-ramos.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al obtener los ramos'
    ]);
} 