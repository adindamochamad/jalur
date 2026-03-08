<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use Firebase\JWT\JWT;
use CodeIgniter\HTTP\ResponseInterface;
use Throwable;

class AuthController extends BaseController
{
    /**
     * GET api/auth/ping — cek
     */
    public function ping(): ResponseInterface
    {
        return $this->response->setJSON(['status' => true, 'message' => 'backend ok']);
    }

    /**
     * POST api/auth/login
     */
    public function login(): ResponseInterface
    {
        try {
            $body   = $this->request->getJSON(true) ?? [];
            $email  = $body['email'] ?? '';
            $sandi  = $body['password'] ?? '';

            if ($email === '' || $sandi === '') {
                return $this->response
                    ->setStatusCode(400)
                    ->setJSON(['status' => false, 'message' => 'Email dan password wajib']);
            }

            $userModel = model(UserModel::class);
            $user = $userModel->where('email', $email)->first();
            if (! $user) {
                return $this->response
                    ->setStatusCode(401)
                    ->setJSON(['status' => false, 'message' => 'Email atau password salah']);
            }

            if (! password_verify($sandi, $user['password'])) {
                return $this->response
                    ->setStatusCode(401)
                    ->setJSON(['status' => false, 'message' => 'Email atau password salah']);
            }

            $secret = env('JWT_SECRET') ?: getenv('JWT_SECRET') ?: '';
            if (strlen($secret) < 32) {
                return $this->response
                    ->setStatusCode(500)
                    ->setJSON(['status' => false, 'message' => 'Set JWT_SECRET di .env (min 32 karakter)']);
            }

            $payload = [
                'user_id' => (int) $user['id'],
                'email'   => $user['email'],
                'exp'     => time() + (60 * 60),
            ];
            $token = JWT::encode($payload, $secret, 'HS256');

            $data_user = [
                'id'    => (int) $user['id'],
                'nama'  => $user['nama'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ];

            // Set token di httpOnly cookie agar tidak terbaca JS (kurangi risiko XSS)
            // CI4 setCookie: name, value, expire, domain, path, prefix, secure, httponly, samesite
            $this->response->setCookie(
                'jalur_token',
                $token,
                time() + (60 * 60),
                '',
                '/',
                '',
                ENVIRONMENT === 'production',
                true,
                'Lax'
            );

            return $this->response
                ->setStatusCode(200)
                ->setJSON([
                    'status'  => true,
                    'message' => 'Berhasil',
                    'data'    => [
                        'token' => $token,
                        'user'  => $data_user,
                    ],
                ]);
        } catch (Throwable $e) {
            log_message('error', 'AuthController::login - ' . $e->getMessage());
            return $this->response
                ->setStatusCode(500)
                ->setJSON([
                    'status'  => false,
                    'message' => 'Terjadi kesalahan server',
                    'debug'   => (ENVIRONMENT === 'development') ? $e->getMessage() : null,
                ]);
        }
    }

    /**
     * GET api/auth/me — data user saat ini (butuh auth). Dipakai frontend untuk cek login via cookie.
     */
    public function me(): ResponseInterface
    {
        $userId = $this->request->user_id ?? null;
        if ($userId === null) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON(['status' => false, 'message' => 'Token tidak valid atau kedaluwarsa']);
        }
        $userModel = model(UserModel::class);
        $user = $userModel->find($userId);
        if (! $user) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON(['status' => false, 'message' => 'User tidak ditemukan']);
        }
        $data_user = [
            'id'    => (int) $user['id'],
            'nama'  => $user['nama'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ];
        return $this->response->setJSON([
            'status' => true,
            'message' => 'OK',
            'data'    => $data_user,
        ]);
    }

    /**
     * POST api/auth/ubah-password — ganti password (butuh auth). Body: password_lama, password_baru.
     */
    public function ubahPassword(): ResponseInterface
    {
        $userId = $this->request->user_id ?? null;
        if ($userId === null) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON(['status' => false, 'message' => 'Token tidak valid']);
        }
        $body = $this->request->getJSON(true) ?? [];
        $passwordLama = $body['password_lama'] ?? '';
        $passwordBaru = $body['password_baru'] ?? '';
        if ($passwordLama === '' || $passwordBaru === '') {
            return $this->response
                ->setStatusCode(400)
                ->setJSON(['status' => false, 'message' => 'Password lama dan password baru wajib diisi']);
        }
        if (strlen($passwordBaru) < 8) {
            return $this->response
                ->setStatusCode(400)
                ->setJSON(['status' => false, 'message' => 'Password baru minimal 8 karakter']);
        }
        $userModel = model(UserModel::class);
        $user = $userModel->find($userId);
        if (! $user || ! password_verify($passwordLama, $user['password'])) {
            return $this->response
                ->setStatusCode(401)
                ->setJSON(['status' => false, 'message' => 'Password lama salah']);
        }
        $hashBaru = password_hash($passwordBaru, PASSWORD_DEFAULT);
        $userModel->update($userId, ['password' => $hashBaru]);
        return $this->response
            ->setStatusCode(200)
            ->setJSON(['status' => true, 'message' => 'Password berhasil diubah']);
    }

    /**
     * POST api/auth/logout — hapus cookie token di client
     */
    public function logout(): ResponseInterface
    {
        $this->response->deleteCookie('jalur_token', '', '/');
        return $this->response
            ->setStatusCode(200)
            ->setJSON(['status' => true, 'message' => 'Berhasil logout']);
    }
}
