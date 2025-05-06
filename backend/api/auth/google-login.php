<?php
require_once '../conexion.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// tu CLIENT_ID de Google
define('GOOGLE_CLIENT_ID', '404368959204-ouvmhhtevnj3glddn2ndgjih4ps3eldv.apps.googleusercontent.com');

$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['id_token'])) {
    http_response_code(400);
    echo json_encode(['error'=>'Falta id_token']);
    exit;
}

// 1) Verifica token contra Google
$token = $input['id_token'];
$info = json_decode(file_get_contents("https://oauth2.googleapis.com/tokeninfo?id_token={$token}"), true);
if (empty($info['aud']) || $info['aud'] !== GOOGLE_CLIENT_ID) {
    http_response_code(401);
    echo json_encode(['error'=>'Token inválido']);
    exit;
}
if (time() > intval($info['exp'])) {
    http_response_code(401);
    echo json_encode(['error'=>'Token expirado']);
    exit;
}

// 2) Extrae datos
$email          = $info['email'];
$name           = $info['name']            ?? '';
$googleId       = $info['sub'];
// generamos una contraseña basada en Google ID (no se usará para login normal)
$contrasena     = password_hash($googleId, PASSWORD_DEFAULT);
// si Google no te da given_name/family_name, construimos uno por defecto
$nombre_usuario = $info['given_name']      ?? 'usuario_'.substr($googleId, 0, 5);
$apellido       = $info['family_name']     ?? 'usuario_'.substr($googleId, 5, 5);

// 3) Busca o crea usuario
$stmt = $conn->prepare("SELECT * FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($user = $res->fetch_assoc()) {
    // Usuario ya existía: lo devolvemos tal cual (sin contrasena)
    unset($user['contrasena']);
} else {
    // Usuario nuevo: insertamos con todos los campos
    $insert = $conn->prepare("
      INSERT INTO usuarios
        (nombre_usuario, nombre, apellido, correo, contrasena)
      VALUES (?,?,?,?,?)
    ");
    $insert->bind_param(
      "sssss",
      $nombre_usuario,
      $name,
      $apellido,
      $email,
      $contrasena
    );
    $insert->execute();

    // Construimos el array a devolver
    $user = [
      'id'             => $insert->insert_id,
      'nombre_usuario' => $nombre_usuario,
      'nombre'         => $name,
      'apellido'       => $apellido,
      'correo'         => $email
    ];

    $insert->close();
}

$stmt->close();
                
// 4) Respuesta final
echo json_encode([
  'mensaje' => 'Login Google OK',
  'usuario' => $user
]);
