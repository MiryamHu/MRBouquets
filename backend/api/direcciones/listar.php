<?php

require_once __DIR__ . '/../conexion.php';
require_once __DIR__ . '/../session_config.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

start_clean_session();
if (!isset($_SESSION['id_usuario'])) { http_response_code(401); exit; }

$uid = $_SESSION['id_usuario'];
$stmt = $conn->prepare("SELECT * FROM direcciones WHERE usuario_id = ?");
$stmt->bind_param("i", $uid);
$stmt->execute();
$res = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
echo json_encode($res);
