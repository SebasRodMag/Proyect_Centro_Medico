<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\Permission\Models\Role;

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

        // Crear el usuario administrador
        $admin = User::create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
        ]);
        $admin->assignRole("Administrador");

        // Crear usuarios médicos
        for ($i = 1; $i <= 3; $i++) {
            $medico = User::create([
                'email' => "medico{$i}@example.com",
                'password' => Hash::make('password123'),
            ]);
            $medico->assignRole("Medico");
        }

        // Crear usuarios clientes
        for ($i = 1; $i <= 10; $i++) {
            $cliente = User::create([
                'email' => "cliente{$i}@example.com",
                'password' => Hash::make('password123'),
            ]);
            $cliente->assignRole("Cliente");
        }

        // Crear usuarios pacientes
        for ($i = 1; $i <= 60; $i++) {
            $paciente = User::create([
                'email' => "paciente{$i}@example.com",
                'password' => Hash::make('password123'),
            ]);
            $paciente->assignRole("Paciente");
        }
    }
}