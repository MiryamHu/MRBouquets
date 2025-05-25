<?php
// backend/api/carrito/vaciar-articulos-carrito.php

// 1) Desactivar cualquier salida de errores en producción
ini_set('display_errors', '0');
error_reporting(0);

// 2) Iniciar buffer de salida para asegurarnos de devolver sólo JSON
ob_start();

require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

// 3) CORS y JSON
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// 4) Responder preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(204);
    exit;
}

// 5) Arrancar sesión (sin duplicar nombre)
session_name('MRBSESSID');
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

// 6) Verificar autenticación
if (!isset($_SESSION['id_usuario'])) {
    ob_end_clean();
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autenticado']);
    exit;
}
$user_id = (int) $_SESSION['id_usuario'];

// 7) Ejecutar DELETE masivo
$stmt = $conn->prepare("
    DELETE FROM articulos_carrito
    WHERE id_usuario = ?
");
$stmt->bind_param("i", $user_id);
$stmt->execute();

// 8) Limpiar buffer y devolver respuesta JSON
ob_end_clean();

if ($stmt->affected_rows >= 0) {
    // affected_rows = 0 significa que no había nada, pero lo consideramos "vacío"
    echo json_encode([
        'success' => true,
        'mensaje' => 'Carrito vaciado correctamente'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al vaciar el carrito'
    ]);
}
