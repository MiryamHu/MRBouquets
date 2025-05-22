<?php
// backend/api/direcciones/crear.php

// ─────────────────────────────────────
// INCLUDES + SESIÓN
// ─────────────────────────────────────
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}


$id_usuario = $_SESSION['id_usuario'];

// ─────────────────────────────────────
// LECTURA DEL JSON
// ─────────────────────────────────────
$input = file_get_contents('php://input');
$data  = json_decode($input, true);

$oblig = ['nombre', 'calle','numero','codigo_postal','localidad','provincia'];
foreach ($oblig as $c) {
    if (empty($data[$c])) {
        http_response_code(422);
        echo json_encode(['error' => "Falta $c"]);
        exit;
    }
}

// Campos
$nombre        = $data['nombre'];
$calle         = $data['calle'];
$numero        = $data['numero'];
$piso          = $data['piso']   ?? null;
$puerta        = $data['puerta'] ?? null;
$cp            = $data['codigo_postal'];
$localidad     = $data['localidad'];
$provincia     = $data['provincia'];
$pais          = $data['pais']   ?? 'España';

try {
    // ───────── TRANSACCIÓN OPCIONAL ─────────
    $conn->begin_transaction();

    $stmt = $conn->prepare("
        INSERT INTO direcciones
        (usuario_id, nombre, calle, numero, piso, puerta, codigo_postal,
         localidad, provincia, pais)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    ");
    $stmt->bind_param(
        "isssssssss",
        $id_usuario, $nombre, $calle, $numero, $piso, $puerta,
        $cp, $localidad, $provincia, $pais
    );
    $stmt->execute();

    if ($stmt->affected_rows !== 1) {
        throw new Exception('No se insertó la dirección');
    }

    $id = $stmt->insert_id;
    $stmt->close();
    $conn->commit();

    echo json_encode([
        'id'            => $id,
        'usuario_id'    => $id_usuario,
        'nombre'        => $nombre,
        'calle'         => $calle,
        'numero'        => $numero,
        'piso'          => $piso,
        'puerta'        => $puerta,
        'codigo_postal' => $cp,
        'localidad'     => $localidad,
        'provincia'     => $provincia,
        'pais'          => $pais
    ]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
