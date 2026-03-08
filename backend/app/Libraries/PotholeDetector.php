<?php

namespace App\Libraries;

use CodeIgniter\HTTP\ResponseInterface;

/**
 * Library untuk memanggil layanan AI deteksi lubang jalan.
 * Mengirim gambar (base64) ke AI_SERVICE_URL/detect dan mengembalikan hasil.
 */
class PotholeDetector
{
    /** Timeout request ke AI service (detik) */
    private const TIMEOUT = 30;

    /** Nilai default jika AI error/timeout */
    private const DEFAULT_HASIL = [
        'jumlah_lubang'      => 0,
        'keparahan'          => 'ringan',
        'confidence'         => null,
        'foto_hasil_base64'  => null,
    ];

    /**
     * Deteksi lubang dari file gambar.
     *
     * @param string $pathGambar Path absolut ke file gambar (foto_asli).
     * @return array{jumlah_lubang: int, keparahan: string, confidence: float|null, foto_hasil_base64: string|null}
     */
    public function detect(string $pathGambar): array
    {
        if (! is_file($pathGambar)) {
            return self::DEFAULT_HASIL;
        }

        $isiFile = file_get_contents($pathGambar);
        if ($isiFile === false) {
            return self::DEFAULT_HASIL;
        }

        $base64 = base64_encode($isiFile);
        $urlAi  = getenv('AI_SERVICE_URL') ?: 'http://127.0.0.1:8000';
        $url    = rtrim($urlAi, '/') . '/detect';

        try {
            $client   = service('curlrequest', ['timeout' => self::TIMEOUT]);
            $response = $client->post($url, [
                'json' => ['image_base64' => $base64],
            ]);

            if ($response->getStatusCode() !== 200) {
                log_message('error', 'PotholeDetector: AI service mengembalikan HTTP ' . $response->getStatusCode() . ' — pakai hasil default. URL: ' . $url);

                return self::DEFAULT_HASIL;
            }

            $body = json_decode($response->getBody(), true);
            if (! is_array($body)) {
                log_message('error', 'PotholeDetector: respons AI bukan JSON valid — pakai hasil default. URL: ' . $url);

                return self::DEFAULT_HASIL;
            }

            return [
                'jumlah_lubang'     => (int) ($body['jumlah_lubang'] ?? 0),
                'keparahan'         => $this->normalisasiKeparahan($body['keparahan'] ?? 'ringan'),
                'confidence'        => isset($body['confidence']) ? (float) $body['confidence'] : null,
                'foto_hasil_base64' => $body['foto_hasil_base64'] ?? null,
            ];
        } catch (\Throwable $e) {
            log_message('error', 'PotholeDetector: ' . $e->getMessage());

            return self::DEFAULT_HASIL;
        }
    }

    /**
     * Pastikan keparahan hanya nilai yang diizinkan di DB.
     */
    private function normalisasiKeparahan(?string $keparahan): string
    {
        $allowed = ['ringan', 'sedang', 'parah'];
        $k       = is_string($keparahan) ? strtolower(trim($keparahan)) : '';

        return in_array($k, $allowed, true) ? $k : 'ringan';
    }
}
