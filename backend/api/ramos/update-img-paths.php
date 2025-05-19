<?php
require_once '../conexion.php';

// Función para limpiar el nombre de archivo
function cleanImagePath($path) {
    // Eliminar cualquier ruta del sistema de archivos
    $filename = basename($path);
    
    // Eliminar cualquier prefijo de ruta
    $filename = str_replace(['img/', 'assets/images/', '/img/', 'frontend/public/img/'], '', $filename);
    
    return $filename;
}

// Obtener todos los ramos
$stmt = $conn->prepare("SELECT id, img FROM ramos");
$stmt->execute();
$result = $stmt->get_result();

// Actualizar cada ramo
while ($row = $result->fetch_assoc()) {
    $newImgPath = cleanImagePath($row['img']);
    
    $updateStmt = $conn->prepare("UPDATE ramos SET img = ? WHERE id = ?");
    $updateStmt->bind_param("si", $newImgPath, $row['id']);
    $updateStmt->execute();
    $updateStmt->close();
    
    echo "Actualizado ID: " . $row['id'] . " - Nueva ruta: " . $newImgPath . "\n";
}

$stmt->close();
echo "\nRutas de imágenes actualizadas correctamente."; 