<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UserSeeder extends Seeder
{
    /**
     * Se crean usuarios médicos y clientes.
     * Este seeder asume que ya existen clientes en la base de datos.
     * Si no hay clientes, se mostrará un mensaje de advertencia.
     * Este seeder crea 3 médicos y 5 clientes con datos ficticios.
     */
    public function run(): void
    {
        // Crear el usuario administrador (si no lo hiciste en AdminUserSeeder)
        DB::table('users')->insert([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Crear algunos usuarios médicos
        for ($i = 1; $i <= 3; $i++) {
            DB::table('users')->insert([
                'email' => 'medico' . $i . '@example.com',
                'password' => Hash::make('password123'),
                'role' => 'medico',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // Crear algunos usuarios cliente (para asociarlos a los clientes)
        for ($i = 1; $i <= 5; $i++) {
            DB::table('users')->insert([
                'email' => 'cliente' . $i . '@example.com',
                'password' => Hash::make('password123'),
                'role' => 'cliente',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // Puedes crear más usuarios con diferentes roles si es necesario
    }
}