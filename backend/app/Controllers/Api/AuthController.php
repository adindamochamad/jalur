<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Throwable;

class AuthController extends BaseController
{
    public function ping(): ResponseInterface
    {
        return $this->response->setJSON(['status' => true, 'message' => 'backend ok']);
    }

    public function login(): ResponseInterface
    {
        try {
            $body  = $this->request->getJSON(true) ?? [];
            $email = $body['email'] ?? '';
            $sandi = $body['password'] ?? '';
            if ($email === '' || $sandi === '') {
                return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Email dan password wajib']);
            }

            $userModel = model(UserModel::class);
            $user = $userModel->where('email', $email)->first();
            if (! $user || ! password_verify($sandi, $user['password'])) {
                return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'Email atau password salah']);
            }

            $secret = env('JWT_SECRET') ?: getenv('JWT_SECRET') ?: '';
            if (strlen($secret) < 32) {
                return $this->response->setStatusCode(500)->setJSON(['status' => false, 'message' => 'Set JWT_SECRET di .env (min 32 karakter)']);
            }

            $payload = ['user_id' => (int) $user['id'], 'email' => $user['email'], 'exp' => time() + 3600];
            $token   = JWT::encode($payload, $secret, 'HS256');
            $dataUser = ['id' => (int) $user['id'], 'nama' => $user['nama'], 'email' => $user['email'], 'role' => $user['role']];

            $this->response->setCookie(
                'jalur_token',
                $token,
                time() + 3600,
                '',
                '/',
                '',
                ENVIRONMENT === 'production',
                true,
                'Lax'
            );

            return $this->response->setJSON([
                'status' => true,
                'message' => 'Berhasil',
                'data' => ['token' => $token, 'user' => $dataUser],
            ]);
        } catch (Throwable $e) {
            log_message('error', 'AuthController::login - ' . $e->getMessage());
            return $this->response->setStatusCode(500)->setJSON([
                'status' => false,
                'message' => 'Terjadi kesalahan server',
                'debug' => ENVIRONMENT === 'development' ? $e->getMessage() : null,
            ]);
        }
    }

    public function register(): ResponseInterface
    {
        try {
            $body  = $this->request->getJSON(true) ?? [];
            $nama  = trim((string) ($body['nama'] ?? ''));
            $email = trim((string) ($body['email'] ?? ''));
            $sandi = (string) ($body['password'] ?? '');

            if ($nama === '' || strlen($nama) > 100) {
                return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Nama wajib, maksimal 100 karakter']);
            }
            if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100) {
                return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Email wajib dan format valid, maksimal 100 karakter']);
            }
            if ($sandi === '' || strlen($sandi) < 8) {
                return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Password minimal 8 karakter']);
            }

            $userModel = model(UserModel::class);
            if ($userModel->where('email', $email)->first()) {
                return $this->response->setStatusCode(409)->setJSON(['status' => false, 'message' => 'Email sudah terdaftar']);
            }

            $userModel->insert([
                'nama' => $nama,
                'email' => $email,
                'password' => password_hash($sandi, PASSWORD_DEFAULT),
                'role' => 'petugas',
            ]);

            return $this->response->setStatusCode(201)->setJSON(['status' => true, 'message' => 'Registrasi berhasil. Silakan login.']);
        } catch (Throwable $e) {
            log_message('error', 'AuthController::register - ' . $e->getMessage());
            return $this->response->setStatusCode(500)->setJSON([
                'status' => false,
                'message' => 'Terjadi kesalahan server',
                'debug' => ENVIRONMENT === 'development' ? $e->getMessage() : null,
            ]);
        }
    }

    public function me(): ResponseInterface
    {
        $userId = $this->request->user_id ?? null;
        if ($userId === null) {
            return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'Token tidak valid atau kedaluwarsa']);
        }
        $user = model(UserModel::class)->find($userId);
        if (! $user) {
            return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'User tidak ditemukan']);
        }
        return $this->response->setJSON([
            'status' => true,
            'message' => 'OK',
            'data' => ['id' => (int) $user['id'], 'nama' => $user['nama'], 'email' => $user['email'], 'role' => $user['role']],
        ]);
    }

    public function ubahPassword(): ResponseInterface
    {
        $userId = $this->request->user_id ?? null;
        if ($userId === null) {
            return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'Token tidak valid']);
        }
        $body         = $this->request->getJSON(true) ?? [];
        $passwordLama = $body['password_lama'] ?? '';
        $passwordBaru = $body['password_baru'] ?? '';
        if ($passwordLama === '' || $passwordBaru === '') {
            return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Password lama dan baru wajib diisi']);
        }
        if (strlen($passwordBaru) < 8) {
            return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Password baru minimal 8 karakter']);
        }
        $user = model(UserModel::class)->find($userId);
        if (! $user || ! password_verify($passwordLama, (string) ($user['password'] ?? ''))) {
            return $this->response->setStatusCode(401)->setJSON(['status' => false, 'message' => 'Password lama salah']);
        }
        model(UserModel::class)->update($userId, ['password' => password_hash($passwordBaru, PASSWORD_DEFAULT)]);
        return $this->response->setJSON(['status' => true, 'message' => 'Password berhasil diubah']);
    }

    public function logout(): ResponseInterface
    {
        $this->response->deleteCookie('jalur_token', '', '/');
        return $this->response->setJSON(['status' => true, 'message' => 'Berhasil logout']);
    }
}
