<?php
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

$user_id = $_SESSION['id_usuario'];
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id_ramo']) || empty($data['cantidad'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

$id_ramo = (int)$data['id_ramo'];
$cantidad = (int)$data['cantidad'];

// Verifica si ya existe
$stmt = $conn->prepare("SELECT id, cantidad FROM articulos_carrito WHERE id_usuario = ? AND id_ramo = ?");
$stmt->bind_param("ii", $user_id, $id_ramo);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Actualiza cantidad
    $new_cantidad = $row['cantidad'] + $cantidad;
    $update = $conn->prepare("UPDATE articulos_carrito SET cantidad = ? WHERE id = ?");
    $update->bind_param("ii", $new_cantidad, $row['id']);
    $update->execute();
    echo json_encode(['mensaje' => 'Cantidad actualizada']);
} else {
    // Inserta nuevo
    $insert = $conn->prepare("INSERT INTO articulos_carrito (id_usuario, id_ramo, cantidad) VALUES (?, ?, ?)");
    $insert->bind_param("iii", $user_id, $id_ramo, $cantidad);
    $insert->execute();
    echo json_encode(['mensaje' => 'Producto agregado al carrito']);
}

exit;
