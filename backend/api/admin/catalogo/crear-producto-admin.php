<?php
require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../session_config.php';

// CORS y tipo de respuesta
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Responder al preflight de CORS
    http_response_code(204);
    exit;
}

// A partir de aquí, SOLO aceptamos PUT
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido. Use PUT.']);
    exit;
}

start_clean_session();

// Verificar sesión
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Usuario no autenticado']);
    exit;
}

if ( ($_SESSION['rol'] ?? '') !== 'admin' ) {
    http_response_code(403);
    echo json_encode(['success'=>false,'error'=>'Acceso denegado']);
    exit;
}



if (isset($_SESSION['last_activity'])) {
    $inactivo = 3600;
    if (time() - $_SESSION['last_activity'] > $inactivo) {
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Sesión expirada']);
        exit;
    }
}
$_SESSION['last_activity'] = time();

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);


// Validar campos obligatorios
$req = ['nombre','precio','stock','tipo_flor','color','descripcion'];
foreach ($req as $f) {
    if (empty($_POST[$f]) && $_POST[$f] !== '0') {
        http_response_code(400);
        echo json_encode(['success'=>false,'error'=>"Falta campo $f"]);
        exit;
    }
}

// Procesar subida de imagen
if (!isset($_FILES['imagen']) || $_FILES['imagen']['error']!==UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Error al subir la imagen']);
    exit;
}

$file = $_FILES['imagen'];
$ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg','jpeg','png','gif','webp'])) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'Formato de imagen no permitido']);
    exit;
}

// 1) Define la carpeta del frontend public/img
$uploadDir = realpath(__DIR__ . '/../../../../frontend/public/img');
if (!$uploadDir) {
    // Si no existe, intenta crearla (y recálcula la ruta)
    $base = realpath(__DIR__ . '/../../../../frontend/public');
    if (!is_dir($base.'/img')) {
        mkdir($base.'/img', 0755, true);
    }
    $uploadDir = realpath($base.'/img');
}
$uploadDir .= '/';

// 2) Nombre de archivo único
$uniqueName = uniqid('img_') . '.' . $ext;
$targetPath = $uploadDir . $uniqueName;

// 3) Mueve el fichero al public/img
if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'No se pudo guardar la imagen']);
    exit;
}

// 4) Ruta relativa para guardar en la BD (debe apuntar a /img/...)
$imgPath = "/$uniqueName";

// Leer resto de campos
$nombre      = $_POST['nombre'];
$precio      = floatval($_POST['precio']);
$stock       = intval($_POST['stock']);
$tipo_flor   = $_POST['tipo_flor'];
$color       = $_POST['color'];
$descripcion = $_POST['descripcion'];
$activo      = isset($_POST['activo']) && $_POST['activo'] === 'true' ? 1 : 0;
$esOcasion   = isset($_POST['es_ocasion_especial']) && $_POST['es_ocasion_especial']==='true' ? 1 : 0;

// Resolver id_ocasion
$idOcasion = null;
if ($esOcasion && !empty($_POST['nombre_ocasion'])) {
    $stmt = $conn->prepare("SELECT id FROM tipos_ocasion WHERE nombre = ? LIMIT 1");
    $stmt->bind_param('s', $_POST['nombre_ocasion']);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();
    $idOcasion = $res ? intval($res['id']) : null;
}

// Insertar en la tabla ramos
try {
    $sql = "INSERT INTO ramos
        (nombre, descripcion, precio, img, tipo_flor, color, stock, es_ocasion_especial, id_ocasion, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
        'ssdsssiiii',
        $nombre,
        $descripcion,
        $precio,
        $imgPath,
        $tipo_flor,
        $color,
        $stock,
        $esOcasion,
        $idOcasion,
        $activo
        );
        $stmt->execute();

        echo json_encode([
        'success' => true,
        'message' => 'Producto creado con éxito',
        'data'    => ['id' => $stmt->insert_id]
        ]);

} catch (Exception $e) {

    error_log("crear-producto error: ".$e->getMessage());
    http_response_code(500);
    echo json_encode([
    'success' => false,
    'message' => 'Error al crear producto'
    ]);
}