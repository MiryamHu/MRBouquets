<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mrbouquets";

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    // Verificar conexión
    if ($conn->connect_error) {
        error_log("Error de conexión: " . $conn->connect_error);
        throw new Exception("Error de conexión a la base de datos");
    }

    // Establecer charset
    if (!$conn->set_charset("utf8mb4")) {
        error_log("Error cargando el conjunto de caracteres utf8mb4: " . $conn->error);
    }

} catch (Exception $e) {
    error_log("Error en conexion.php: " . $e->getMessage());
    die("Error de conexión: " . $e->getMessage());
}


?>