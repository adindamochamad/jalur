<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Libraries\PotholeDetector;
use App\Models\LaporanModel;
use CodeIgniter\HTTP\ResponseInterface;

class LaporanController extends BaseController
{
    public function index()
    {
        $model    = model(LaporanModel::class);
        $page     = max(1, (int) ($this->request->getGet('page') ?? 1));
        $per_page = (int) ($this->request->getGet('per_page') ?? 10);
        if ($per_page < 1 || $per_page > 100) {
            $per_page = 10;
        }
        $status    = $this->request->getGet('status');
        $keparahan = $this->request->getGet('keparahan');

        $kondisi = [];
        if ($status !== null && $status !== '') {
            $kondisi['status'] = $status;
        }
        if ($keparahan !== null && $keparahan !== '') {
            $kondisi['keparahan'] = $keparahan;
        }

        $total  = $model->where($kondisi)->countAllResults();
        $offset = ($page - 1) * $per_page;
        $daftar = $model->where($kondisi)->orderBy('created_at', 'DESC')->findAll($per_page, $offset);

        return $this->response->setJSON([
            'status'  => true,
            'message' => 'Daftar laporan',
            'data'    => $daftar,
            'meta'    => ['total' => (int) $total, 'page' => $page, 'per_page' => $per_page],
        ]);
    }

    public function show($id_laporan = null)
    {
        $model   = model(LaporanModel::class);
        $laporan = $model->find((int) $id_laporan);
        if ($laporan === null) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => false,
                'message' => 'Laporan tidak ditemukan',
            ]);
        }
        $laporan = $this->enrichDenganDataFoto($laporan);
        return $this->response->setJSON([
            'status' => true,
            'message' => 'Detail laporan',
            'data' => $laporan,
        ]);
    }

    private function enrichDenganDataFoto(array $laporan): array
    {
        $laporan['foto_asli_data']  = null;
        $laporan['foto_hasil_data'] = null;
        foreach (['foto_asli' => 'foto_asli_data', 'foto_hasil' => 'foto_hasil_data'] as $kolomPath => $kolomData) {
            $pathRelatif = $laporan[$kolomPath] ?? null;
            if (empty($pathRelatif) || $pathRelatif === 'placeholder.jpg') {
                continue;
            }
            $pathPenuh = FCPATH . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $pathRelatif);
            if (! is_file($pathPenuh)) {
                log_message('warning', 'LaporanController: file tidak ditemukan path=' . $pathPenuh);
                continue;
            }
            $bin = file_get_contents($pathPenuh);
            if ($bin === false) {
                continue;
            }
            $mime = $this->mimeDariEkstensi(strtolower(pathinfo($pathPenuh, PATHINFO_EXTENSION)));
            $laporan[$kolomData] = 'data:' . $mime . ';base64,' . base64_encode($bin);
        }
        return $laporan;
    }

    private function mimeDariEkstensi(string $ekstensi): string
    {
        $map = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif', 'webp' => 'image/webp'];
        return $map[$ekstensi] ?? 'image/jpeg';
    }

    public function showPublik($id_laporan = null): ResponseInterface
    {
        $model   = model(LaporanModel::class);
        $laporan = $model->find((int) $id_laporan);
        if ($laporan === null) {
            return $this->response->setStatusCode(404)->setJSON([
                'status' => false,
                'message' => 'Laporan tidak ditemukan',
            ]);
        }
        $ringkas = [
            'id' => (int) $laporan['id'],
            'status' => $laporan['status'],
            'keparahan' => $laporan['keparahan'],
            'jumlah_lubang' => (int) ($laporan['jumlah_lubang'] ?? 0),
            'created_at' => $laporan['created_at'],
        ];
        return $this->response->setJSON(['status' => true, 'message' => 'Status laporan', 'data' => $ringkas]);
    }

    public function create()
    {
        $model = model(LaporanModel::class);
        $data  = ['foto_hasil' => null, 'jumlah_lubang' => 0, 'keparahan' => 'ringan', 'confidence' => null];

        $file = $this->request->getFile('foto');
        if ($file !== null && $file->isValid() && ! $file->hasMoved()) {
            $ekstensi = strtolower($file->getClientExtension());
            if (! in_array($ekstensi, ['jpg', 'jpeg', 'png'], true)) {
                return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Format file harus jpg, jpeg, atau png']);
            }
            if ($file->getSize() > 5 * 1024 * 1024) {
                return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Ukuran file maksimal 5MB']);
            }
            $dirUpload = FCPATH . 'uploads/jalan';
            if (! is_dir($dirUpload)) {
                mkdir($dirUpload, 0755, true);
            }
            $namaUnik = uniqid('', true) . '.' . $ekstensi;
            $file->move($dirUpload, $namaUnik);
            $data['foto_asli'] = 'uploads/jalan/' . $namaUnik;
            $data['latitude'] = $this->request->getPost('latitude');
            $data['longitude'] = $this->request->getPost('longitude');
            $data['alamat'] = $this->request->getPost('alamat');
            $data['pelapor_nama'] = $this->request->getPost('pelapor_nama');
            $data['pelapor_hp'] = $this->request->getPost('pelapor_hp');
            $data['catatan'] = $this->request->getPost('catatan');
            $validasi = $this->validasiPanjangLaporan($data);
            if ($validasi !== null) {
                return $validasi;
            }
        } else {
            $body = $this->request->getJSON(true);
            if (empty($body)) {
                return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Kirim file foto (multipart) atau body JSON']);
            }
            $kolomDiizinkan = [
                'foto_asli', 'foto_hasil', 'latitude', 'longitude', 'alamat',
                'status', 'keparahan', 'confidence', 'jumlah_lubang',
                'pelapor_nama', 'pelapor_hp', 'catatan',
            ];
            foreach ($kolomDiizinkan as $kolom) {
                if (array_key_exists($kolom, $body)) {
                    $data[$kolom] = $body[$kolom];
                }
            }
            $data['foto_asli'] = $data['foto_asli'] ?? 'placeholder.jpg';
            $validasi = $this->validasiPanjangLaporan($data);
            if ($validasi !== null) {
                return $validasi;
            }
        }

        $id = $model->insert($data);
        if ($id === false) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => false,
                'message' => 'Gagal menyimpan laporan',
                'errors' => $model->errors(),
            ]);
        }

        $pathFotoAsli = ! empty($data['foto_asli']) && $data['foto_asli'] !== 'placeholder.jpg'
            ? (FCPATH . $data['foto_asli'])
            : '';
        if ($pathFotoAsli !== '' && is_file($pathFotoAsli)) {
            $hasilDeteksi = (new PotholeDetector())->detect($pathFotoAsli);
            $update       = [
                'jumlah_lubang' => $hasilDeteksi['jumlah_lubang'],
                'keparahan'     => $hasilDeteksi['keparahan'],
                'confidence'    => $hasilDeteksi['confidence'],
            ];
            if (! empty($hasilDeteksi['foto_hasil_base64'])) {
                $bin = base64_decode($hasilDeteksi['foto_hasil_base64'], true);
                if ($bin !== false) {
                    $dirUpload = FCPATH . 'uploads/jalan';
                    if (! is_dir($dirUpload)) {
                        mkdir($dirUpload, 0755, true);
                    }
                    $namaHasil = uniqid('', true) . '_hasil.jpg';
                    $pathHasil = $dirUpload . DIRECTORY_SEPARATOR . $namaHasil;
                    if (file_put_contents($pathHasil, $bin) !== false) {
                        $update['foto_hasil'] = 'uploads/jalan/' . $namaHasil;
                    } else {
                        log_message('error', 'LaporanController: file_put_contents foto_hasil gagal path=' . $pathHasil);
                    }
                } else {
                    log_message('warning', 'LaporanController: base64_decode foto_hasil_base64 gagal');
                }
            }
            $model->update($id, $update);
        }

        $laporan = $model->find($id);
        return $this->response->setStatusCode(201)->setJSON([
            'status' => true,
            'message' => 'Laporan berhasil dibuat',
            'data' => $laporan,
        ]);
    }

    public function update($id_laporan = null)
    {
        $body = $this->request->getJSON(true);
        if (empty($body)) {
            return $this->response->setStatusCode(400)->setJSON(['status' => false, 'message' => 'Body JSON diperlukan']);
        }
        $model   = model(LaporanModel::class);
        $laporan = $model->find((int) $id_laporan);
        if ($laporan === null) {
            return $this->response->setStatusCode(404)->setJSON(['status' => false, 'message' => 'Laporan tidak ditemukan']);
        }
        $kolomDiizinkan = [
            'foto_asli', 'foto_hasil', 'latitude', 'longitude', 'alamat',
            'status', 'keparahan', 'confidence', 'jumlah_lubang',
            'pelapor_nama', 'pelapor_hp', 'catatan',
        ];
        $data = [];
        foreach ($kolomDiizinkan as $kolom) {
            if (array_key_exists($kolom, $body)) {
                $data[$kolom] = $body[$kolom];
            }
        }
        if ($data === []) {
            return $this->response->setJSON([
                'status' => true,
                'message' => 'Tidak ada data yang diubah',
                'data' => $model->find((int) $id_laporan),
            ]);
        }
        $validasi = $this->validasiPanjangLaporan($data);
        if ($validasi !== null) {
            return $validasi;
        }
        if ($model->update((int) $id_laporan, $data) === false) {
            return $this->response->setStatusCode(500)->setJSON([
                'status' => false,
                'message' => 'Gagal mengubah laporan',
                'errors' => $model->errors(),
            ]);
        }
        return $this->response->setJSON([
            'status' => true,
            'message' => 'Laporan berhasil diubah',
            'data' => $model->find((int) $id_laporan),
        ]);
    }

    public function delete($id_laporan = null)
    {
        $model   = model(LaporanModel::class);
        $laporan = $model->find((int) $id_laporan);
        if ($laporan === null) {
            return $this->response->setStatusCode(404)->setJSON(['status' => false, 'message' => 'Laporan tidak ditemukan']);
        }
        $model->delete((int) $id_laporan);
        return $this->response->setJSON([
            'status' => true,
            'message' => 'Laporan berhasil dihapus',
            'data' => ['id' => (int) $id_laporan],
        ]);
    }

    private function validasiPanjangLaporan(array $data): ?ResponseInterface
    {
        $batas = ['pelapor_nama' => 100, 'pelapor_hp' => 20, 'alamat' => 2000, 'catatan' => 2000];
        $errors = [];
        foreach ($batas as $kolom => $max) {
            $nilai = $data[$kolom] ?? null;
            if ($nilai !== null && $nilai !== '' && (is_string($nilai) ? mb_strlen($nilai) : 0) > $max) {
                $errors[$kolom] = "Maksimal {$max} karakter.";
            }
        }
        if ($errors !== []) {
            return $this->response->setStatusCode(400)->setJSON([
                'status' => false,
                'message' => 'Data melebihi batas panjang yang diizinkan',
                'errors' => $errors,
            ]);
        }
        return null;
    }
}
