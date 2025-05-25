<?php
// backend/api/carrito/eliminar-articulos-carrito.php

// 1) Desactivar cualquier salida de warning/notices (producción)
ini_set('display_errors', '0');
error_reporting(0);

// 2) Iniciar buffer de salida para limpiar antes de enviar JSON
ob_start();

require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

// 3) Headers CORS + JSON
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 4) Preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // limpieza
    ob_end_clean();
    http_response_code(204);
    exit;
}

// 5) Sesión
session_name('MRBSESSID');
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// 6) Autenticación
if (!isset($_SESSION['id_usuario'])) {
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}
$user_id = (int) $_SESSION['id_usuario'];

// 7) Parámetro ID
if (!isset($_GET['id']) || !ctype_digit($_GET['id'])) {
    ob_end_clean();
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'ID inválido']);
    exit;
}
$id = (int) $_GET['id'];

// 8) DELETE seguro
$stmt = $conn->prepare("
    DELETE FROM articulos_carrito 
    WHERE id = ? 
      AND id_usuario = ?
");
$stmt->bind_param("ii", $id, $user_id);
$stmt->execute();

// 9) Responder JSON
ob_end_clean();  // limpia todo lo bufferizado
if ($stmt->affected_rows > 0) {
    echo json_encode(['success' => true, 'mensaje' => 'Artículo eliminado']);
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Artículo no encontrado']);
}
