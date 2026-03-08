<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

$routes->get('api/test', 'Api\TestController::index');

// Preflight OPTIONS (CORS) — harus didefinisikan dulu sebelum dipakai
$responCors = static function () {
    return service('response')->setStatusCode(204);
};

// Tes tanpa controller (closure) — jika ini OK, crash ada di AuthController
$routes->get('api/auth/ping-closure', static function () {
    return service('response')->setStatusCode(200)->setJSON(['status' => true, 'message' => 'ci4 closure ok']);
});
$routes->get('api/auth/ping', 'Api\AuthController::ping');
$routes->get('api/auth/me', 'Api\AuthController::me', ['filter' => 'jwt']);
$routes->post('api/auth/login', 'Api\AuthController::login');
$routes->post('api/auth/ubah-password', 'Api\AuthController::ubahPassword', ['filter' => 'jwt']);
$routes->post('api/auth/logout', 'Api\AuthController::logout', ['filter' => 'jwt']);
$routes->options('api/auth/login', $responCors);
$routes->options('api/auth/ubah-password', $responCors);
$routes->options('api/auth/logout', $responCors);
$routes->options('api/auth/me', $responCors);
$routes->options('api/laporan', $responCors);
$routes->options('api/laporan/(:num)', $responCors);
$routes->options('api/dashboard/stats', $responCors);
$routes->options('api/dashboard/peta', $responCors);

// Laporan
$routes->get('api/laporan', 'Api\LaporanController::index', ['filter' => 'jwt']);
$routes->get('api/laporan/(:num)', 'Api\LaporanController::show/$1', ['filter' => 'jwt']);
$routes->post('api/laporan', 'Api\LaporanController::create');
$routes->put('api/laporan/(:num)', 'Api\LaporanController::update/$1', ['filter' => 'jwt']);
$routes->delete('api/laporan/(:num)', 'Api\LaporanController::delete/$1', ['filter' => 'jwt']);

// Dashboard
$routes->get('api/dashboard/stats', 'Api\DashboardController::stats', ['filter' => 'jwt']);
$routes->get('api/dashboard/peta', 'Api\DashboardController::peta', ['filter' => 'jwt']);

// Publik: cek status laporan & peta (tanpa login)
$routes->get('api/publik/laporan/(:num)', 'Api\LaporanController::showPublik/$1');
$routes->get('api/publik/peta', 'Api\DashboardController::peta');
$routes->options('api/publik/laporan/(:num)', $responCors);
$routes->options('api/publik/peta', $responCors);
