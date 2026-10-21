<?php
declare(strict_types=1);

// Read simple KEY=value lines; never execute configuration as PHP or shell code.
$values = [];
$path = __DIR__ . '/.env';
if (is_readable($path)) {
    foreach (file($path, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = explode('=', $line, 2);
        $value = trim($value);
        if (strlen($value) >= 2 && in_array($value[0], ['"', "'"], true)
            && $value[0] === $value[strlen($value) - 1]) {
            $value = substr($value, 1, -1);
        }
        $values[trim($key)] = $value;
    }
}

$config = [];
foreach ([
    'SWATHONI_MAIL_TO', 'SWATHONI_SMTP_HOST', 'SWATHONI_SMTP_PORT',
    'SWATHONI_SMTP_USERNAME', 'SWATHONI_SMTP_PASSWORD',
    'SWATHONI_SMTP_ENCRYPTION', 'SWATHONI_SMTP_AUTH',
] as $key) {
    // Hosting environment variables take precedence over local file values.
    $environment = getenv($key);
    $config[$key] = $environment !== false ? $environment : ($values[$key] ?? '');
}
return $config;
