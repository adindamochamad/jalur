<?php

use CodeIgniter\Router\RouteCollection;

/** @var RouteCollection $routes */
$routes->get('/', 'Home::index');

$responCors = static fn () => service('response')->setStatusCode(204);

$routes->get('api/auth/ping', 'Api\AuthController::ping');
$routes->get('api/auth/me', 'Api\AuthController::me', ['filter' => 'jwt']);
$routes->post('api/auth/login', 'Api\AuthController::login');
$routes->post('api/auth/register', 'Api\AuthController::register');
$routes->post('api/auth/ubah-password', 'Api\AuthController::ubahPassword', ['filter' => 'jwt']);
$routes->post('api/auth/logout', 'Api\AuthController::logout', ['filter' => 'jwt']);
$routes->options('api/auth/login', $responCors);
$routes->options('api/auth/register', $responCors);
$routes->options('api/auth/ubah-password', $responCors);
$routes->options('api/auth/logout', $responCors);
$routes->options('api/auth/me', $responCors);
$routes->options('api/laporan', $responCors);
$routes->options('api/laporan/(:num)', $responCors);
$routes->options('api/dashboard/stats', $responCors);
$routes->options('api/dashboard/peta', $responCors);

$routes->get('api/laporan', 'Api\LaporanController::index', ['filter' => 'jwt']);
$routes->get('api/laporan/(:num)', 'Api\LaporanController::show/$1', ['filter' => 'jwt']);
$routes->post('api/laporan', 'Api\LaporanController::create');
$routes->put('api/laporan/(:num)', 'Api\LaporanController::update/$1', ['filter' => 'jwt']);
$routes->delete('api/laporan/(:num)', 'Api\LaporanController::delete/$1', ['filter' => 'jwt']);

$routes->get('api/dashboard/stats', 'Api\DashboardController::stats', ['filter' => 'jwt']);
$routes->get('api/dashboard/peta', 'Api\DashboardController::peta', ['filter' => 'jwt']);

$routes->get('api/publik/laporan/(:num)', 'Api\LaporanController::showPublik/$1');
$routes->get('api/publik/peta', 'Api\DashboardController::peta');
$routes->options('api/publik/laporan/(:num)', $responCors);
$routes->options('api/publik/peta', $responCors);

$routes->get('api/uploads/jalan/(:any)', 'Api\ServeUploadController::index/$1');
$routes->options('api/uploads/jalan/(:any)', $responCors);
