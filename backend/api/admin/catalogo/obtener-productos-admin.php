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
        r.id,
        r.nombre,
        r.descripcion,
        r.precio,
        r.stock,
        r.tipo_flor,
        r.color,
        r.disponible,
        r.activo,
        r.img,
        r.es_ocasion_especial,
        

        t.nombre AS nombre_ocasion
        FROM ramos r
        LEFT JOIN tipos_ocasion t
        ON r.id_ocasion = t.id
        ORDER BY r.id ASC
    ";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $productos = [];
    while ($row = $result->fetch_assoc()) {
        // Formatear fecha y precio_tota

        $productos[] = [
                'id'                   => intval($row['id']),
                'nombre'               => $row['nombre'],
                'descripcion'          => $row['descripcion'],
                'precio'               => number_format($row['precio'], 2, ',', '.'),
                'stock'                => intval($row['stock']),
                'tipo_flor'            => $row['tipo_flor'],
                'color'                => $row['color'],
                'disponible'           => (bool)$row['disponible'],
                'activo'               => (bool)$row['activo'],
                'img'                  => $row['img'],
                'es_ocasion_especial'  => (bool)$row['es_ocasion_especial'],
                'nombre_ocasion'       => $row['nombre_ocasion']
        ];
    }

    echo json_encode([
        'success' => true,
        'data'    => $productos
    ]);
} catch (Exception $e) {
    error_log("Error en obtener-pedidos-admin.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al obtener los pedidos'
    ]);
}
