<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use InvalidArgumentException;
use UnexpectedValueException;

class JwtFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            return $request;
        }

        $token = $request->getCookie('jalur_token');
        if (empty($token)) {
            $header = $request->getHeaderLine('Authorization');
            if (! empty($header) && str_starts_with($header, 'Bearer ')) {
                $token = trim(substr($header, 7));
            }
        }

        if (empty($token)) {
            return $this->respon(401, 'Token tidak ditemukan');
        }

        $secret = getenv('JWT_SECRET');
        if (empty($secret)) {
            return $this->respon(500, 'Konfigurasi JWT tidak lengkap');
        }

        try {
            $key     = new Key($secret, 'HS256');
            $payload = JWT::decode($token, $key);
        } catch (ExpiredException) {
            return $this->respon(401, 'Token kedaluwarsa');
        } catch (SignatureInvalidException | InvalidArgumentException | UnexpectedValueException) {
            return $this->respon(401, 'Token tidak valid');
        }

        $request->user_id = $payload->user_id ?? null;
        if ($request->user_id === null) {
            return $this->respon(401, 'Payload token tidak lengkap');
        }

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return $response;
    }

    private function respon(int $kode, string $pesan): ResponseInterface
    {
        $respon = service('response');
        $respon->setStatusCode($kode);
        $respon->setJSON(['status' => false, 'message' => $pesan]);
        return $respon;
    }
}
