<?php
/**
 * mail.php
 * Recibe el POST del formulario de consulta (que vive en un .html estático,
 * sin sesión de PHP) y envía el correo con PHPMailer + SMTP.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carga automática de PHPMailer (vía Vendor/Composer o directorio local standalone)
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
} else {
    require __DIR__ . '/phpmailer/Exception.php';
    require __DIR__ . '/phpmailer/PHPMailer.php';
    require __DIR__ . '/phpmailer/SMTP.php';
}

require __DIR__ . '/config.php'; // credenciales SMTP

header('Content-Type: application/json; charset=utf-8');

function jsonError(string $mensaje, int $codigo = 400): void
{
    http_response_code($codigo);
    echo json_encode(['ok' => false, 'error' => $mensaje]);
    exit;
}

/* 1. Solo aceptar POST */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

/* 2. Verificar que la petición venga de tu propio dominio (Origin/Referer).
      Esto reemplaza al CSRF token cuando el formulario es HTML estático. */
define('DOMINIOS_PERMITIDOS', [
    'https://tudominio.com',
    'https://www.tudominio.com',
    'http://localhost',
    'http://localhost:8000',
    'http://127.0.0.1',
    'http://127.0.0.1:8000'
    // agrega aquí tu dominio real, con https://
]);

$origen = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
$origenValido = false;
foreach (DOMINIOS_PERMITIDOS as $dominio) {
    if (str_starts_with($origen, $dominio)) {
        $origenValido = true;
        break;
    }
}
// Si no hay origin/referer (desarrollo local), permitimos la validación o si coincide con la lista
if (!$origenValido && !empty($origen)) {
    jsonError('Origen de la petición no permitido.', 403);
}

/* 3. Honeypot anti-bots */
if (!empty($_POST['website'])) {
    echo json_encode(['ok' => true]); // respuesta falsa de éxito, no delatamos el filtro
    exit;
}

/* 4. Trampa de tiempo: si el formulario se envió en menos de 3 segundos
      desde que cargó, casi seguro es un bot rellenando automáticamente */
$cargadoEn = (int)($_POST['form_loaded_at'] ?? 0);
$ahoraMs   = (int)(microtime(true) * 1000);
if ($cargadoEn <= 0 || ($ahoraMs - $cargadoEn) < 3000) {
    jsonError('No se pudo procesar tu solicitud. Inténtalo nuevamente.');
}

/* 5. Rate limiting por IP (sin depender de sesión de PHP).
      Usa un archivo en disco como almacén simple; para tráfico alto,
      conviene reemplazar esto por Redis o una tabla en base de datos. */
$ip = $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
$directorioLimite = __DIR__ . '/ratelimit';
if (!is_dir($directorioLimite)) {
    mkdir($directorioLimite, 0700, true);
}
$archivoLimite = $directorioLimite . '/' . hash('sha256', $ip) . '.json';

$ahora = time();
$envios = [];
if (is_file($archivoLimite)) {
    $contenido = file_get_contents($archivoLimite);
    $envios = json_decode($contenido, true) ?: [];
}
$envios = array_filter($envios, fn($t) => $t > $ahora - 3600);
if (count($envios) >= 5) {
    jsonError('Has alcanzado el límite de envíos. Inténtalo más tarde.', 429);
}

/* 6. Lista blanca de proyectos válidos */
$proyectosValidos = [
    'andes-macul'       => 'Andes Macul (Macul)',
    'andes-nunoa'       => 'Andes Ñuñoa (Ñuñoa)',
    'camino-villa'      => 'Camino de la Villa (Lo Barnechea)',
    'altos-santa-cruz'  => 'Altos de Santa Cruz (Santa Cruz)',
    'work-plaza'        => 'Work Plaza Egaña (Ñuñoa)',
    'postventa'         => 'Requerimiento de Postventa',
    'general'           => 'Consulta General',
];

/* 7. Recolección de datos */
$nombre   = trim((string)($_POST['nombre'] ?? ''));
$email    = trim((string)($_POST['email'] ?? ''));
$telefono = trim((string)($_POST['telefono'] ?? ''));
$proyecto = trim((string)($_POST['proyecto'] ?? ''));
$mensaje  = trim((string)($_POST['mensaje'] ?? ''));

/* 8. Validaciones estrictas */
if ($nombre === '' || mb_strlen($nombre) > 100) {
    jsonError('El nombre ingresado no es válido.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
    jsonError('El correo electrónico no es válido.');
}
if (!preg_match('/^[0-9+\-\s()]{6,20}$/', $telefono)) {
    jsonError('El teléfono ingresado no es válido.');
}
if (!array_key_exists($proyecto, $proyectosValidos)) {
    jsonError('Selecciona un proyecto o tema válido.');
}
if ($mensaje === '' || mb_strlen($mensaje) > 5000) {
    jsonError('El mensaje ingresado no es válido.');
}

/* 9. Anti header-injection: quitar saltos de línea de campos usados en cabeceras */
function limpiarCabecera(string $valor): string
{
    return preg_replace('/[\r\n]+/', ' ', $valor);
}
$nombre   = limpiarCabecera($nombre);
$telefono = limpiarCabecera($telefono);

/* 10. Escapar el mensaje (por si el correo se visualiza como HTML en algún cliente) */
$mensajeSeguro = htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8');
$proyectoTexto = $proyectosValidos[$proyecto];

/* 11. Envío con PHPMailer */
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    // Remitente fijo del sistema; el email del usuario va solo en Reply-To
    // (nunca lo pongas como From directo: expone tu dominio a spoofing)
    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addReplyTo($email, $nombre);
    $mail->addAddress(DESTINO_EMAIL, DESTINO_NOMBRE);

    $mail->isHTML(false);
    $mail->Subject = "[Consulta Web] $proyectoTexto - $nombre";
    $mail->Body    = "Nuevo mensaje desde el formulario de consulta centralizado\n\n"
                    . "Nombre: $nombre\n"
                    . "Correo: $email\n"
                    . "Teléfono: $telefono\n"
                    . "Proyecto/Tema: $proyectoTexto\n"
                    . "IP: $ip\n\n"
                    . "Mensaje:\n$mensajeSeguro";

    $mail->send();

    // Registrar el envío para el rate limiting por IP
    $envios[] = $ahora;
    file_put_contents($archivoLimite, json_encode(array_values($envios)), LOCK_EX);

    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    error_log('Error PHPMailer (mail.php): ' . $mail->ErrorInfo);
    jsonError('No se pudo enviar tu consulta. Inténtalo más tarde.', 500);
}
