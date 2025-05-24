<?php
// ======================================================================
//  CONFIGURACIÓN GLOBAL DE SESIÓN
// ======================================================================

// Configurar COOP y COEP
header('Cross-Origin-Opener-Policy: same-origin');
header('Cross-Origin-Embedder-Policy: require-corp');

//Cors
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit;
}
// Configuración sesión
session_name('MRBSESSID');

// Asegurarnos de que PHP pueda enviar cookies
ini_set('session.use_cookies',      '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.use_strict_mode',  '1');
ini_set('session.cookie_httponly',  '1');

// Configuración específica para desarrollo local
$isSecure = false;   // Cambia a true en producción (HTTPS)
$sameSite = 'Lax';   // 'Strict' en producción si lo prefieres
$domain   = '';      // Dejamos vacío para que funcione tanto en localhost como en 127.0.0.1

// Cookie de sesión
session_set_cookie_params([
    'lifetime' => 3600,   // 1 h — ajusta a tu gusto (0 = sesión del navegador)
    'path'     => '/',    // <──  IMPORTANTE: toda la web
    'domain'   => $domain,
    'secure'   => $isSecure,
    'httponly' => true,
    'samesite' => $sameSite
]);

session_start();

// Nombre coherente en TODOS los scripts
// session_name('MRBSESSID');

// ======================================================================
//  FUNCIÓN AUXILIAR
//  – Reanuda la sesión si existe                 (peticiones normales)
//  – Reinicia y regenera ID sólo cuando es necesario (login, logout…)
// ======================================================================
function start_clean_session() {
    error_log("=== start_clean_session ===");

    /* ── 0) Eliminar posible cookie legacy PHPSESSID ────────────────── */
    if (isset($_COOKIE['PHPSESSID'])) {
        setcookie('PHPSESSID', '', 1, '/', 'localhost');
        unset($_COOKIE['PHPSESSID']);
    }

    /* ── 1) CASO NORMAL: el navegador ya trae MRBSESSID ─────────────── */
    if (session_status() === PHP_SESSION_NONE && isset($_COOKIE[session_name()])) {
        session_start();
        error_log("Sesión reanudada → ID: " . session_id());

        // Inicializa campos la primera vez
        if (empty($_SESSION['initialized'])) {
            $_SESSION['initialized'] = true;
            $_SESSION['created']     = time();
        }
        $_SESSION['last_activity'] = time();
        return;             // ⬅️  ¡Listo! no se toca la cookie
    }

    /* ── 2) CASO REINICIO (login, logout, sesiones corruptas…) ─────── */
    $old_session_data = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        $old_session_data = $_SESSION;     // guarda si te hace falta
        session_destroy();
        session_write_close();
    }

    // Forzar borrado de cookie anterior sólo en reinicio
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', 1, '/', 'localhost');
        unset($_COOKIE[session_name()]);
    }

    // Nueva sesión
    session_start();

    // Restaurar datos importantes si los había guardado
    if ($old_session_data) {
        $_SESSION = array_merge($_SESSION, $old_session_data);
    }

    // Regenerar ID por seguridad la primera vez
    if (empty($_SESSION['initialized'])) {
        $old = session_id();
        session_regenerate_id(true);
        error_log("ID regenerado: $old → " . session_id());
        $_SESSION['initialized'] = true;
        $_SESSION['created']     = time();
    }
    $_SESSION['last_activity'] = time();

    error_log("Session ready. ID: " . session_id());
}
