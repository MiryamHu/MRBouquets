<?php
header('Content-Type: application/json');

$request = $_SERVER['REQUEST_URI'];

// strpos() para verificar si la URL contiene /api/auth/register
if (strpos($request, 'backend/api/auth/register') !== false) {
    require 'auth/register.php';
    //si es login 
} elseif (strpos($request, 'backend/api/auth/login') !== false) {
    require 'auth/login.php';
} else {
    http_response_code(404);
    echo json_encode(['message' => 'Ruta no encontrada']);
}
