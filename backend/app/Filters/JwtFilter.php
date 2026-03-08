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
        // Preflight OPTIONS tidak bawa Authorization; biarkan lewat agar CORS jalan
        if (strtoupper($request->getMethod()) === 'OPTIONS') {
            return $request;
        }

        // Baca token dari httpOnly cookie dulu, fallback ke header Authorization
        $token = $request->getCookie('jalur_token');
        if (empty($token)) {
            $header = $request->getHeaderLine('Authorization');
            if (! empty($header) && str_starts_with($header, 'Bearer ')) {
                $token = trim(substr($header, 7));
            }
        }

        if (empty($token)) {
            return $this->responUnauthorized('Token tidak ditemukan');
        }

        if ($token === '') {
            return $this->responUnauthorized('Token tidak valid');
        }

        $secret = getenv('JWT_SECRET');
        if (empty($secret)) {
            return $this->responUnauthorized('Konfigurasi JWT tidak lengkap', 500);
        }

        try {
            $key   = new Key($secret, 'HS256');
            $payload = JWT::decode($token, $key);
        } catch (ExpiredException $e) {
            return $this->responUnauthorized('Token kedaluwarsa');
        } catch (SignatureInvalidException $e) {
            return $this->responUnauthorized('Token tidak valid');
        } catch (InvalidArgumentException | UnexpectedValueException $e) {
            return $this->responUnauthorized('Token tidak valid');
        }

        // Simpan user_id ke request agar controller bisa baca (properti dinamis)
        $request->user_id = $payload->user_id ?? null;
        if ($request->user_id === null) {
            return $this->responUnauthorized('Payload token tidak lengkap');
        }

        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        return $response;
    }


    private function responUnauthorized(string $pesan, int $kode = 401): ResponseInterface
    {
        $respon = service('response');
        $respon->setStatusCode($kode);
        $respon->setJSON([
            'status'  => false,
            'message' => $pesan,
        ]);

        return $respon;
    }
}
