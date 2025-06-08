<?php
require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../session_config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success'=>false,'error'=>'Sólo GET permitido']);
    exit;
}

start_clean_session();
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success'=>false,'error'=>'Usuario no autenticado']);
    exit;
}
if (($_SESSION['rol'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success'=>false,'error'=>'Acceso denegado']);
    exit;
}
if (isset($_SESSION['last_activity']) && time() - $_SESSION['last_activity'] > 3600) {
    session_destroy();
    http_response_code(401);
    echo json_encode(['success'=>false,'error'=>'Sesión expirada']);
    exit;
}
$_SESSION['last_activity'] = time();

if (!isset($_GET['id']) || !ctype_digit($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'ID inválido']);
    exit;
}
$idProducto = (int) $_GET['id'];

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $sql = "
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
        LEFT JOIN tipos_ocasion t ON r.id_ocasion = t.id
        WHERE r.id = ?
        LIMIT 1
    ";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $idProducto);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();

    if (!$row) {
      http_response_code(404);
      echo json_encode(['success'=>false,'error'=>'Producto no encontrado']);
      exit;
    }

    // formatear precio si quieres, o dejarlo en bruto
    $row['precio'] = number_format((float)$row['precio'], 2, ',', '.');

    echo json_encode([
      'success' => true,
      'data'    => [
        'id'                  => (int)   $row['id'],
        'nombre'              => (string)$row['nombre'],
        'descripcion'         => (string)$row['descripcion'],
        'precio'              => (string)$row['precio'],
        'stock'               => (int)   $row['stock'],
        'tipo_flor'           => (string)$row['tipo_flor'],
        'color'               => (string)$row['color'],
        'disponible'          => (bool)  $row['disponible'],
        'activo'              => (bool)  $row['activo'],
        'img'                 => (string)$row['img'],
        'es_ocasion_especial' => (bool)  $row['es_ocasion_especial'],
        'nombre_ocasion'      => $row['nombre_ocasion'] // puede ser null
      ]
    ]);
} catch (Exception $e) {
    error_log("Error en obtener-producto-por-id.php: ".$e->getMessage());
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error interno al obtener producto']);
}
