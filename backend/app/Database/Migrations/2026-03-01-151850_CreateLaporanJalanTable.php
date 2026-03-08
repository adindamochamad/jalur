<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLaporanJalanTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => ['type' => 'INT', 'unsigned' => true, 'auto_increment' => true],
            'foto_asli' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'foto_hasil' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'latitude' => ['type' => 'DECIMAL', 'constraint' => '10,8', 'null' => true],
            'longitude' => ['type' => 'DECIMAL', 'constraint' => '11,8', 'null' => true],
            'alamat' => ['type' => 'TEXT', 'null' => true],
            'status' => ['type' => 'ENUM', 'constraint' => ['terdeteksi', 'diproses', 'selesai'], 'default' => 'terdeteksi'],
            'keparahan' => ['type' => 'ENUM', 'constraint' => ['ringan', 'sedang', 'parah'], 'default' => 'ringan'],
            'confidence' => ['type' => 'FLOAT', 'null' => true],
            'jumlah_lubang' => ['type' => 'INT', 'default' => 0],
            'pelapor_nama' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'pelapor_hp' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'catatan' => ['type' => 'TEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('laporan_jalan');
    }

    public function down()
    {
        $this->forge->dropTable('laporan_jalan');
    }
}
