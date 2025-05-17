<?php
// Asegurarnos de que PHP pueda enviar cookies
ini_set('session.use_cookies', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');

// Configuración específica para desarrollo local
$isSecure = false; // Cambiar a true en producción con HTTPS
$sameSite = 'Lax';  // Puede ser 'Strict' en producción

// Obtener el dominio base
$domain = 'localhost';

// Configuración de la cookie de sesión
session_set_cookie_params([
    'lifetime' => 3600,
    'path' => '/',
    'domain' => $domain,
    'secure' => $isSecure,
    'httponly' => true,
    'samesite' => $sameSite
]);

// Establecer el nombre de la sesión
session_name('MRBSESSID');

// Función para iniciar una sesión limpia
function start_clean_session() {
    error_log("=== Iniciando start_clean_session ===");
    error_log("Session status antes: " . session_status());
    error_log("Cookies antes: " . print_r($_COOKIE, true));
    
    // Eliminar cookies antiguas si existen
    if (isset($_COOKIE['PHPSESSID'])) {
        error_log("Eliminando cookie PHPSESSID antigua");
        setcookie('PHPSESSID', '', 1, '/', 'localhost');
        unset($_COOKIE['PHPSESSID']);
    }
    
    // Si hay una sesión activa, guardar datos importantes
    $old_session_data = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        error_log("Guardando datos de sesión actual");
        $old_session_data = $_SESSION;
        session_destroy();
        session_write_close();
    }
    
    // Limpiar cualquier cookie de sesión existente
    if (isset($_COOKIE[session_name()])) {
        error_log("Eliminando cookie de sesión actual");
        setcookie(session_name(), '', 1, '/', 'localhost');
        unset($_COOKIE[session_name()]);
    }
    
    // Iniciar nueva sesión
    if (!session_start()) {
        error_log("Error crítico al iniciar sesión");
        throw new Exception("No se pudo iniciar la sesión");
    }
    
    // Restaurar datos importantes si existían
    if (!empty($old_session_data)) {
        error_log("Restaurando datos de sesión anteriores");
        $_SESSION = array_merge($_SESSION, $old_session_data);
    }
    
    // Regenerar ID por seguridad
    if (empty($_SESSION['initialized'])) {
        $old_session_id = session_id();
        if (!session_regenerate_id(true)) {
            error_log("Error al regenerar ID de sesión");
            throw new Exception("No se pudo regenerar el ID de sesión");
        }
        error_log("ID de sesión regenerado. Antiguo: $old_session_id, Nuevo: " . session_id());
        $_SESSION['initialized'] = true;
        $_SESSION['created'] = time();
        $_SESSION['last_activity'] = time();
    } else {
        $_SESSION['last_activity'] = time();
    }
    
    // Log final
    error_log("=== Estado final de la sesión ===");
    error_log("Session ID: " . session_id());
    error_log("SESSION: " . print_r($_SESSION, true));
    error_log("COOKIES: " . print_r($_COOKIE, true));
} 