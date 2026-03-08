<?php

namespace App\Models;

use CodeIgniter\Model;

class LaporanModel extends Model
{
    protected $table            = 'laporan_jalan';
    protected $primaryKey       = 'id';
    protected $allowedFields    = [
        'foto_asli',
        'foto_hasil',
        'latitude',
        'longitude',
        'alamat',
        'status',
        'keparahan',
        'confidence',
        'jumlah_lubang',
        'pelapor_nama',
        'pelapor_hp',
        'catatan',
        'created_at',
        'updated_at',
    ];
    protected $useTimestamps    = true;
    protected $createdField     = 'created_at';
    protected $updatedField     = 'updated_at';
}
