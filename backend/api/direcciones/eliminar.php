<?php
// backend/api/direcciones/eliminar.php

require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

$usuario_id = $_SESSION['id_usuario'];
$id         = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta id']);
    exit;
}

$stmt = $conn->prepare("DELETE FROM direcciones WHERE id = ? AND usuario_id = ?");
$stmt->bind_param("ii", $id, $usuario_id);
$stmt->execute();

if ($stmt->affected_rows !== 1) {
    http_response_code(404);
    echo json_encode(['error' => 'Dirección no encontrada']);
    exit;
}

echo json_encode(['mensaje' => 'Dirección eliminada']);
