<?php

namespace App\Libraries;

use CURLFile;

class PotholeDetector
{
    private const TIMEOUT = 30;

    private const DEFAULT_HASIL = [
        'jumlah_lubang' => 0,
        'keparahan' => 'ringan',
        'confidence' => null,
        'foto_hasil_base64' => null,
    ];

    public function detect(string $pathGambar): array
    {
        if (! is_file($pathGambar)) {
            return self::DEFAULT_HASIL;
        }

        $url = rtrim(getenv('AI_SERVICE_URL') ?: 'http://127.0.0.1:8000', '/') . '/detect';
        $pathResolved = realpath($pathGambar) ?: $pathGambar;
        $mime         = mime_content_type($pathResolved) ?: 'image/jpeg';
        $namaFile     = basename($pathGambar);

        try {
            // Pakai native cURL agar file biner terkirim persis tanpa modifikasi framework
            $ch = curl_init($url);
            if ($ch === false) {
                return self::DEFAULT_HASIL;
            }
            $postData = ['image' => new CURLFile($pathResolved, $mime, $namaFile)];
            curl_setopt_array($ch, [
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $postData,
                CURLOPT_TIMEOUT => self::TIMEOUT,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => ['Accept: application/json'],
            ]);
            $bodyRaw    = curl_exec($ch);
            $statusCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlErr    = curl_error($ch);
            curl_close($ch);
            if ($curlErr !== '') {
                log_message('error', 'PotholeDetector curl: ' . $curlErr);
                return self::DEFAULT_HASIL;
            }
            $body = is_string($bodyRaw) ? json_decode($bodyRaw, true) : null;

            if ($statusCode !== 200) {
                $preview = is_string($bodyRaw) ? substr($bodyRaw, 0, 200) : '';
                log_message('warning', 'PotholeDetector: AI HTTP ' . $statusCode . ' body=' . $preview);
                return self::DEFAULT_HASIL;
            }

            if (! is_array($body)) {
                log_message('warning', 'PotholeDetector: AI respons bukan JSON valid');
                return self::DEFAULT_HASIL;
            }

            $keparahan = $body['keparahan'] ?? 'ringan';
            $allowed   = ['ringan', 'sedang', 'parah'];
            $k         = is_string($keparahan) ? strtolower(trim($keparahan)) : '';
            $keparahan = in_array($k, $allowed, true) ? $k : 'ringan';

            return [
                'jumlah_lubang' => (int) ($body['jumlah_lubang'] ?? 0),
                'keparahan' => $keparahan,
                'confidence' => isset($body['confidence']) ? (float) $body['confidence'] : null,
                'foto_hasil_base64' => $body['foto_hasil_base64'] ?? null,
            ];
        } catch (\Throwable $e) {
            log_message('error', 'PotholeDetector: ' . $e->getMessage());
            return self::DEFAULT_HASIL;
        }
    }
}
