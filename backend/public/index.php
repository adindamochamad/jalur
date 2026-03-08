<?php

use CodeIgniter\Boot;
use Config\Paths;

// Debug: pastikan request sampai ke index.php (path /tmp selalu writable di container)
file_put_contents('/tmp/jalur-request-hit.log', date('c') . ' index.php reached' . "\n", FILE_APPEND);
$log_dir = __DIR__ . '/../writable/logs';
if (is_dir($log_dir)) {
    @file_put_contents($log_dir . '/request-debug.log', date('c') . ' request reached index.php' . "\n", FILE_APPEND);
}

// Tangkap error fatal dan tulis ke file agar bisa dibaca (debug ECONNRESET)
register_shutdown_function(static function (): void {
    $err = error_get_last();
    if ($err !== null && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        $logDir = __DIR__ . '/../writable/logs';
        if (is_dir($logDir) || @mkdir($logDir, 0775, true)) {
            @file_put_contents(
                $logDir . '/fatal-debug.log',
                date('Y-m-d H:i:s') . ' ' . $err['type'] . ' ' . $err['message'] . ' in ' . $err['file'] . ' on ' . $err['line'] . "\n",
                FILE_APPEND
            );
        }
    }
});

/*
 *---------------------------------------------------------------
 * CHECK PHP VERSION
 *---------------------------------------------------------------
 */

$minPhpVersion = '8.2'; // If you update this, don't forget to update `spark`.
if (version_compare(PHP_VERSION, $minPhpVersion, '<')) {
    $message = sprintf(
        'Your PHP version must be %s or higher to run CodeIgniter. Current version: %s',
        $minPhpVersion,
        PHP_VERSION,
    );

    header('HTTP/1.1 503 Service Unavailable.', true, 503);
    echo $message;

    exit(1);
}

/*
 *---------------------------------------------------------------
 * SET THE CURRENT DIRECTORY
 *---------------------------------------------------------------
 */

// Path to the front controller (this file)
define('FCPATH', __DIR__ . DIRECTORY_SEPARATOR);

// Ensure the current directory is pointing to the front controller's directory
if (getcwd() . DIRECTORY_SEPARATOR !== FCPATH) {
    chdir(FCPATH);
}

/*
 *---------------------------------------------------------------
 * BOOTSTRAP THE APPLICATION
 *---------------------------------------------------------------
 * This process sets up the path constants, loads and registers
 * our autoloader, along with Composer's, loads our constants
 * and fires up an environment-specific bootstrapping.
 */

// LOAD OUR PATHS CONFIG FILE
// This is the line that might need to be changed, depending on your folder structure.
require FCPATH . '../app/Config/Paths.php';
// ^^^ Change this line if you move your application folder

$paths = new Paths();

// LOAD THE FRAMEWORK BOOTSTRAP FILE
require $paths->systemDirectory . '/Boot.php';

exit(Boot::bootWeb($paths));
