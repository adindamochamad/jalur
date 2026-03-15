<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\LaporanModel;

class DashboardController extends BaseController
{
    public function stats()
    {
        $model = model(LaporanModel::class);
        $total = (int) $model->countAllResults();

        $perStatus = ['terdeteksi' => 0, 'diproses' => 0, 'selesai' => 0];
        foreach ($model->builder()->select('status, COUNT(*) as jumlah')->groupBy('status')->get()->getResultArray() as $row) {
            if (isset($perStatus[$row['status']])) {
                $perStatus[$row['status']] = (int) $row['jumlah'];
            }
        }

        $perKeparahan = ['ringan' => 0, 'sedang' => 0, 'parah' => 0];
        foreach ($model->builder()->select('keparahan, COUNT(*) as jumlah')->groupBy('keparahan')->get()->getResultArray() as $row) {
            if (isset($perKeparahan[$row['keparahan']])) {
                $perKeparahan[$row['keparahan']] = (int) $row['jumlah'];
            }
        }

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Statistik dashboard',
            'data' => ['total' => $total, 'per_status' => $perStatus, 'per_keparahan' => $perKeparahan],
        ]);
    }

    public function peta()
    {
        $model  = model(LaporanModel::class);
        $daftar = $model->select('id, latitude, longitude, keparahan, alamat, created_at')
            ->where('latitude IS NOT NULL')
            ->where('longitude IS NOT NULL')
            ->orderBy('created_at', 'DESC')
            ->findAll();

        $marker = array_map(static fn ($row) => [
            'id' => (int) $row['id'],
            'latitude' => (float) $row['latitude'],
            'longitude' => (float) $row['longitude'],
            'keparahan' => $row['keparahan'] ?? 'ringan',
            'alamat' => $row['alamat'],
            'created_at' => $row['created_at'],
        ], $daftar);

        return $this->response->setJSON([
            'status' => true,
            'message' => 'Data peta laporan',
            'data' => $marker,
        ]);
    }
}
