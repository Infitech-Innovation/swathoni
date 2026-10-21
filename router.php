<?php
// Local PHP development server: php -S 127.0.0.1:8000 router.php
$path = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/');
$path = str_replace('\\', '/', $path);
if (preg_match('~(?:^|/)\.env~i', $path)) {
    http_response_code(404);
    exit;
}
return false;
