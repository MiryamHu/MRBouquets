<?php
require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../session_config.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

start_clean_session();

// comprobamos sesión
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

// refrescar inactividad
if (isset($_SESSION['last_activity']) && time() - $_SESSION['last_activity'] > 3600) {
    session_destroy();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Sesión expirada']);
    exit;
}
$_SESSION['last_activity'] = time();

// **Obtener el ID del usuario de la sesión**
$user_id = (int) $_SESSION['id_usuario'];

try {
    $sql = "
      SELECT 
        ac.id,
        ac.id_usuario,
        ac.id_ramo,
        ac.cantidad,
        ac.fecha_agregado,
        r.nombre,
        r.precio,
        r.img
      FROM articulos_carrito ac
      JOIN ramos r ON ac.id_ramo = r.id
      WHERE ac.id_usuario = ?
      ORDER BY ac.fecha_agregado DESC
    ";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error en prepare(): ' . $conn->error);
    }
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data'    => $items
    ]);

} catch (Exception $e) {
    error_log("Error en obtener-articulos-carrito.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Error al obtener los artículos del carrito'
    ]);
}
