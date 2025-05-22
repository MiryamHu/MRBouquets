<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Asegurarnos de que no haya output antes de las cabeceras
ob_start();

// Incluir configuración de sesión
require_once __DIR__ . '/../session_config.php';
require_once __DIR__ . '/../conexion.php';

// Iniciar sesión limpia
start_clean_session();

// Configurar CORS para permitir credenciales
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

error_log('=== Iniciando proceso de login ===');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$input = file_get_contents("php://input");
error_log("Datos recibidos en login: " . $input);
$data = json_decode($input);

if (!$data || !$data->correo || !$data->contrasena) {
    http_response_code(400);
    echo json_encode(['error' => 'Campos requeridos']);
    exit;
}

$correo = $data->correo;
$contrasena = $data->contrasena;

error_log("Intentando login para correo: " . $correo);

$stmt = $conn->prepare("SELECT * FROM usuarios WHERE correo = ?");
$stmt->bind_param("s", $correo);
$stmt->execute();
$result = $stmt->get_result();

if ($usuario = $result->fetch_assoc()) {
    if (password_verify($contrasena, $usuario['contrasena'])) {
        // Regenerar ID de sesión por seguridad
        if (!session_regenerate_id(true)) {
            error_log("Error al regenerar ID de sesión");
            http_response_code(500);
            echo json_encode(['error' => 'Error interno del servidor']);
            exit;
        }
        
        // Guardar datos en la sesión
        $_SESSION['id_usuario'] = $usuario['id'];
        $_SESSION['usuario'] = $usuario['nombre'];
        $_SESSION['initialized'] = true;
        $_SESSION['created'] = time();
        $_SESSION['last_activity'] = time();
        
        error_log("=== Login exitoso ===");
        error_log("Usuario ID: " . $usuario['id']);
        error_log("Contenido de SESSION: " . print_r($_SESSION, true));
        error_log("ID de sesión: " . session_id());
        error_log("Cookies después del login: " . print_r($_COOKIE, true));
        
        // Quitar la contraseña antes de enviar
        unset($usuario['contrasena']);
        
        // Enviar respuesta
        echo json_encode([
            'mensaje' => 'Login exitoso',
            'usuario' => $usuario,
            'session_id' => session_id()
        ]);
    } else {
        error_log("Contraseña incorrecta para correo: " . $correo);
        http_response_code(401);
        echo json_encode(['error' => 'Contraseña incorrecta']);
    }
} else {
    error_log("Usuario no encontrado: " . $correo);
    http_response_code(401);
    echo json_encode(['error' => 'Usuario no encontrado']);
}
$stmt->close();

// Asegurarnos de que todo el output se envíe
ob_end_flush();