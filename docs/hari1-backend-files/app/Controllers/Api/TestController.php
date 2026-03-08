<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

/**
 * Controller untuk cek Hari 1: routing dan env jalan.
 * Return JSON agar bisa di-hit dari frontend (cek CORS).
 */
class TestController extends ResourceController
{
    public function index()
    {
        return $this->response
            ->setJSON([
                'status' => true,
                'message' => 'API CI4 jalan',
                'env'    => ENVIRONMENT,
            ])
            ->setStatusCode(200);
    }
}
