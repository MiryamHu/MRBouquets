<?php
// C:\xampp\htdocs\MRBouquets\backend\api\pedido.php
// Mostrar todos los errores y avisos
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Asegurarnos de que no haya output antes de las cabeceras
ob_start();

// Incluir configuración de sesión y conexión
require_once __DIR__ . '/session_config.php';
require_once __DIR__ . '/conexion.php';

// Configurar CORS primero
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Responder preflight y salir
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Iniciar sesión
session_name('MRBSESSID');
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Configurar logging detallado
error_log("=== Inicio de procesamiento de pedido ===");
error_log("ID de sesión actual: " . session_id());
error_log("Contenido de SESSION: " . print_r($_SESSION, true));
error_log("Cookies recibidas: " . print_r($_COOKIE, true));
error_log("Headers recibidos: " . print_r(getallheaders(), true));

// Verificar estado de la sesión
if (!isset($_SESSION['id_usuario']) || !isset($_SESSION['initialized'])) {
    error_log("Error: Usuario no autenticado o sesión no inicializada correctamente");
    error_log("SESSION: " . print_r($_SESSION, true));
    error_log("Cookie de sesión presente: " . (isset($_COOKIE['MRBSESSID']) ? 'Sí' : 'No'));
    if (isset($_COOKIE['MRBSESSID'])) {
        error_log("Valor de cookie MRBSESSID: " . $_COOKIE['MRBSESSID']);
    }
    http_response_code(401);
    echo json_encode(['error' => 'No hay sesión activa. Por favor, inicie sesión nuevamente.']);
    exit;
}

// Verificar tiempo de sesión
if (isset($_SESSION['last_activity'])) {
    $inactivo = 3600; // 1 hora
    if (time() - $_SESSION['last_activity'] > $inactivo) {
        error_log("Sesión expirada por inactividad");
        session_destroy();
        http_response_code(401);
        echo json_encode(['error' => 'Sesión expirada']);
        exit;
    }
    $_SESSION['last_activity'] = time();
}

// Leer JSON recibido
$input = file_get_contents("php://input");
error_log("Datos recibidos: " . $input);
$data = json_decode($input, true);

// Validación de datos
if (empty($data['total']) || empty($data['items'])) {
    error_log("Error: Datos de pedido incompletos");
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos del pedido']);
    exit;
}

$id_usuario = $_SESSION['id_usuario'];
$precio_total = $data['total'];
$items = $data['items'];

error_log("Procesando pedido para usuario: " . $id_usuario);
error_log("Items del pedido: " . json_encode($items));

try {
    // Iniciar transacción
    $conn->begin_transaction();
    error_log("Transacción iniciada");

    // 5) Insertar pedido con estado 'confirmado'
    $stmt = $conn->prepare("
        INSERT INTO pedidos (id_usuario, precio_total, estado)
        VALUES (?, ?, 'confirmado')
    ");
    $stmt->bind_param("id", $id_usuario, $precio_total);
    $stmt->execute();

    if ($stmt->affected_rows !== 1) {
        throw new Exception('Error al crear el pedido');
    }

    $id_pedido = $stmt->insert_id;
    error_log("Pedido creado con ID: " . $id_pedido);
    $stmt->close();

    // 6) Insertar detalles del pedido
    $stmt = $conn->prepare("
        INSERT INTO detalle_pedidos (id_pedido, id_ramo, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
    ");

    foreach ($items as $item) {
        error_log("Procesando item: " . json_encode($item));
        $stmt->bind_param("iiid", 
            $id_pedido, 
            $item['id'], 
            $item['quantity'], 
            $item['price']
        );
        $stmt->execute();
        
        if ($stmt->affected_rows !== 1) {
            throw new Exception('Error al guardar detalle del pedido');
        }
    }
    
    $stmt->close();

    // Confirmar transacción
    $conn->commit();
    error_log("Transacción confirmada");

    // 7) Devolver respuesta exitosa
    echo json_encode([
        'mensaje' => 'Pedido confirmado',
        'id_pedido' => $id_pedido
    ]);

} catch (Exception $e) {
    // Revertir transacción en caso de error
    $conn->rollback();
    error_log("Error en la transacción: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al procesar el pedido: ' . $e->getMessage()
    ]);
}

// Asegurarnos de que todo el output se envíe
ob_end_flush();
