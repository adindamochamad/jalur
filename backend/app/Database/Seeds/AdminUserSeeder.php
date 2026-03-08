<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = 'admin@localhost';
        $sudah_ada = $this->db->table('users')->where('email', $email)->countAllResults() > 0;
        if ($sudah_ada) {
            return;
        }

        $kata_sandi_mentah = 'admin123'; // ganti di production
        $data = [
            'nama'     => 'Administrator',
            'email'    => $email,
            'password' => password_hash($kata_sandi_mentah, PASSWORD_DEFAULT),
            'role'     => 'admin',
        ];

        $this->db->table('users')->insert($data);
    }
}
