<?php
declare(strict_types=1);

// vercel-php runs this Composer hook after installing production dependencies.
$autoload = dirname(__DIR__) . '/vendor/autoload.php';
if (!is_file($autoload)) {
    fwrite(STDERR, "Missing vendor/autoload.php. Keep composer.json and composer.lock in the Vercel project root.\n");
    exit(1);
}
require $autoload;

if (!class_exists(\PHPMailer\PHPMailer\PHPMailer::class)) {
    fwrite(STDERR, "PHPMailer is missing from production dependencies. Check the Composer install build log.\n");
    exit(1);
}
echo "PHPMailer verified for deployment.\n";
