<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, bool $ok, string $code): never
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'code' => $code]);
    exit;
}

function field(string $key, int $limit = 200): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $limit || str_contains($value, "\0")) {
        respond(422, false, 'invalid');
    }
    return trim($value);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'invalid');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) {
    respond(413, false, 'invalid');
}
if (field('website') !== '') {
    respond(422, false, 'invalid');
}

$type = field('enquiry_type');
if (!in_array($type, ['contact', 'experiences'], true)) {
    respond(422, false, 'invalid');
}
$name = field('name', 120);
$email = field('email', 254);
$travellers = filter_var(field('travellers'), FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 1000],
]);
if ($name === '' || preg_match('/[\r\n]/', $name . $email)
    || !filter_var($email, FILTER_VALIDATE_EMAIL) || $travellers === false) {
    respond(422, false, 'invalid');
}

$experience = field($type === 'contact' ? 'experience' : 'trip');
$choices = $type === 'contact'
    ? ['Safari adventure', 'Beach escape', 'Safari & beach']
    : ['Safari Adventure', 'Beach Escape', 'Safari & Beach'];
if (!in_array($experience, $choices, true)) {
    respond(422, false, 'invalid');
}

$date = field($type === 'contact' ? 'travelMonth' : 'date');
if ($date !== '') {
    $pattern = $type === 'contact' ? '/^(\d{4})-(\d{2})$/' : '/^(\d{4})-(\d{2})-(\d{2})$/';
    if (!preg_match($pattern, $date, $parts)
        || !checkdate((int) $parts[2], (int) ($parts[3] ?? 1), (int) $parts[1])) {
        respond(422, false, 'invalid');
    }
}
$message = field($type === 'contact' ? 'message' : 'notes', 5000);

// The form email has already been validated and checked for header injection.
$config = require __DIR__ . '/mail-config.php';
$from = $email;
$recipient = $config['SWATHONI_MAIL_TO'] ?: 'swafric.wildfotografie@gmail.com';
if (preg_match('/[\r\n]/', $recipient) || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
    error_log('Swathoni enquiry: configure a valid recipient.');
    respond(503, false, 'error');
}

$host = $config['SWATHONI_SMTP_HOST'];
$port = filter_var($config['SWATHONI_SMTP_PORT'], FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 65535],
]);
$auth = filter_var($config['SWATHONI_SMTP_AUTH'] !== '' ? $config['SWATHONI_SMTP_AUTH'] : 'true', FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
$encryption = strtolower($config['SWATHONI_SMTP_ENCRYPTION'] ?: 'tls');
if ($host === '' || strlen($host) > 253 || !preg_match('/^[a-zA-Z0-9.:-]+$/D', $host)
    || $port === false || $auth === null || !in_array($encryption, ['tls', 'ssl', 'none'], true)
    || ($auth && ($encryption === 'none' || $config['SWATHONI_SMTP_USERNAME'] === '' || $config['SWATHONI_SMTP_PASSWORD'] === ''))) {
    error_log('Swathoni enquiry: configure SMTP host, port, encryption, username and app password in .env.');
    respond(503, false, 'error');
}

$autoload = dirname(__DIR__) . '/vendor/autoload.php';
if (!is_file($autoload)) {
    error_log('Swathoni enquiry: PHPMailer is missing. Run composer install.');
    respond(503, false, 'error');
}
require_once $autoload;

$body = implode("\n", [
    'Swathoni Travels - Journey enquiry',
    'Form: ' . $type,
    'Name: ' . $name,
    'Email: ' . $email,
    'Experience: ' . $experience,
    'Preferred travel date/month: ' . ($date ?: 'Flexible'),
    'Travellers: ' . $travellers,
    '',
    'Message:',
    $message ?: 'Not specified',
]);

$mailer = new PHPMailer(true);
try {
    $mailer->isSMTP();
    $mailer->Host = $host;
    $mailer->Port = $port;
    $mailer->SMTPAuth = $auth;
    $mailer->Username = $config['SWATHONI_SMTP_USERNAME'];
    $mailer->Password = $config['SWATHONI_SMTP_PASSWORD'];
    $mailer->SMTPSecure = $encryption === 'none' ? '' : $encryption;
    $mailer->SMTPAutoTLS = $encryption !== 'none';
    $mailer->Timeout = 15;
    $mailer->CharSet = 'UTF-8';
    $mailer->Encoding = 'quoted-printable';
    $mailer->WordWrap = 70;
    $mailer->setFrom($from, 'Swathoni Travels', false);
    // Authenticate the transport separately from the requested form From header.
    if ($auth && filter_var($mailer->Username, FILTER_VALIDATE_EMAIL)) {
        $mailer->Sender = $mailer->Username;
    }
    $mailer->addReplyTo($email, $name);
    $mailer->addAddress($recipient);
    $mailer->Subject = 'Swathoni Travels - Journey enquiry';
    $mailer->Body = $body;
    $mailer->send();
} catch (\Exception $exception) {
    // Keep credentials out of responses and disable SMTP protocol debugging.
    error_log('Swathoni enquiry SMTP: ' . $mailer->ErrorInfo);
    respond(503, false, 'error');
}
respond(200, true, 'success');
