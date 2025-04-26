<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminUserSeeder extends Seeder
{
    /**
     * crea un usuario administrador.
     * Este seeder asume que ya existen usuarios en la base de datos.
     * Si no hay usuarios, se mostrará un mensaje de advertencia.
     * Este seeder crea 2 usuarios administradores con datos ficticios.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            'email' => 'admin1@example.com',
            'password' => Hash::make('password1'), 
            'rol' => 'admin', // Tiene que coincidir con los valores del ENUM ['admin', 'medico', 'cliente', 'paciente']
            'created_at' => Carbon::now(), //Carbon crea instancias de fecha y hora
            'updated_at' => Carbon::now(),
        ]);

        
        DB::table('users')->insert([
            'email' => 'admin2@example.com',
            'password' => Hash::make('password2'),
            'rol' => 'admin',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);
    }
}