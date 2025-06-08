<?php
require_once __DIR__ . '/../../conexion.php';
require_once __DIR__ . '/../../session_config.php';

// CORS + JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Sólo POST (con FormData desde el cliente)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false,'error'=>'Método no permitido. Use POST.']);
    exit;
}

start_clean_session();

// 1) validación de sesión y rol
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    http_response_code(401);
    echo json_encode(['success'=>false,'error'=>'Usuario no autenticado']);
    exit;
}
if (($_SESSION['rol'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success'=>false,'error'=>'Acceso denegado']);
    exit;
}
// control de inactividad (1h)
if (isset($_SESSION['last_activity']) && time() - $_SESSION['last_activity'] > 3600) {
    session_unset(); session_destroy();
    http_response_code(401);
    echo json_encode(['success'=>false,'error'=>'Sesión expirada']);
    exit;
}
$_SESSION['last_activity'] = time();

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// 2) recoger y validar campos
$id      = isset($_POST['id']) ? intval($_POST['id']) : 0;
$req     = ['nombre','precio','stock','tipo_flor','color','descripcion'];
foreach ($req as $f) {
    if (!isset($_POST[$f]) || $_POST[$f] === '') {
        http_response_code(400);
        echo json_encode(['success'=>false,'error'=>"Falta campo $f"]);
        exit;
    }
}
if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['success'=>false,'error'=>'ID de producto inválido']);
    exit;
}

$nombre    = $_POST['nombre'];
$precio    = floatval($_POST['precio']);
$stock     = intval($_POST['stock']);
$tipo_flor = $_POST['tipo_flor'];
$color     = $_POST['color'];
$desc      = $_POST['descripcion'];
$activo    = (isset($_POST['activo']) && $_POST['activo']==='true')?1:0;
$esOcas    = (isset($_POST['es_ocasion_especial']) && $_POST['es_ocasion_especial']==='true')?1:0;

// si es ocasión, buscar id_ocasion por nombre
$idOcasion = null;
if ($esOcas && !empty($_POST['nombre_ocasion'])) {
    $stmt = $conn->prepare("SELECT id FROM tipos_ocasion WHERE nombre = ? LIMIT 1");
    $stmt->bind_param('s', $_POST['nombre_ocasion']);
    $stmt->execute();
    $r = $stmt->get_result()->fetch_assoc();
    $idOcasion = $r ? intval($r['id']) : null;
}

// 3) procesar imagen SI viene en FormData
$newImgPath = null;
if (!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['imagen'];
    $ext  = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg','jpeg','png','gif','webp'])) {
        http_response_code(400);
        echo json_encode(['success'=>false,'error'=>'Formato de imagen no permitido']);
        exit;
    }
    // ruta public/img en tu frontend
    $public = realpath(__DIR__ . '/../../../../frontend/public/img');
    if (!$public) {
        mkdir(__DIR__ . '/../../../../frontend/public/img', 0755, true);
        $public = realpath(__DIR__ . '/../../../../frontend/public/img');
    }
    $fname = uniqid('img_').'.'.$ext;
    $dest  = $public.'/'.$fname;
    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        http_response_code(500);
        echo json_encode(['success'=>false,'error'=>'No se pudo guardar la imagen']);
        exit;
    }
    // guardamos sólo el nombre+ext
    $newImgPath = "/$fname";
}

// 4) armar UPDATE dinámico
$fields = [];
$params = [];
$types  = '';

$fields[] = "nombre = ?";           $params[] = &$nombre;    $types .= 's';
$fields[] = "descripcion = ?";      $params[] = &$desc;      $types .= 's';
$fields[] = "precio = ?";           $params[] = &$precio;    $types .= 'd';
$fields[] = "tipo_flor = ?";        $params[] = &$tipo_flor; $types .= 's';
$fields[] = "color = ?";            $params[] = &$color;     $types .= 's';
$fields[] = "stock = ?";            $params[] = &$stock;     $types .= 'i';
$fields[] = "es_ocasion_especial = ?"; $params[] = &$esOcas;  $types .= 'i';
$fields[] = "id_ocasion = ?";       $params[] = &$idOcasion; $types .= 'i';
$fields[] = "activo = ?";           $params[] = &$activo;    $types .= 'i';

// si hay nueva imagen, actualizar img
if ($newImgPath !== null) {
    $fields[] = "img = ?";
    $params[] = &$newImgPath; $types .= 's';
}

// finalmente el WHERE id = ?
$fields_sql = implode(', ', $fields);
$params[] = &$id; $types .= 'i';

try {
    // preparar
    $sql = "UPDATE ramos SET $fields_sql WHERE id = ?";
    $stmt = $conn->prepare($sql);
    array_unshift($params, $types);
    // bind_param requiere variables por referencia
    call_user_func_array([$stmt,'bind_param'], $params);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'id'      => $id,
        'message' => 'Producto actualizado'
    ]);
} catch (Exception $e) {
    error_log("editar-producto error: ".$e->getMessage());
    http_response_code(500);
    echo json_encode(['success'=>false,'error'=>'Error al actualizar producto']);
}
