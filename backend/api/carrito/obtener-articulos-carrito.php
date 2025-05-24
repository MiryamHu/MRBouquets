<?php
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$id_usuario = $_SESSION['id_usuario'];

$stmt = $conn->prepare("
  SELECT ac.id, ac.id_usuario, ac.id_ramo, ac.cantidad, ac.fecha_agregado,
         r.nombre, r.precio, r.img
  FROM articulos_carrito ac
  JOIN ramos r ON ac.id_ramo = r.id
  WHERE ac.id_usuario = ?
");
$stmt->bind_param("i", $id_usuario);
$stmt->execute();

$result = $stmt->get_result();
$items = [];
while ($row = $result->fetch_assoc()) {
  $items[] = $row;
}

echo json_encode($items);
