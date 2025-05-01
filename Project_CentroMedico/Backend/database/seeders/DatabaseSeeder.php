<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Desde aquí se llaman a los seeders de las tablas.
     * Se pueden crear usuarios de prueba usando la factory.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        //User::factory()->create([
        //    'name' => 'Test User',
        //    'email' => 'test@example.com',
        //]);

        $this->call([
            UserSeeder::class,
            ClienteSeeder::class, // ClienteSeeder debe ejecute antes que el ContratoSeeder
            PacienteSeeder::class,
            MedicoSeeder::class,
            ContratoSeeder::class, // Los contratos dependen de los clientes
            CitaSeeder::class,     // Las citas dependen de pacientes, médicos y contratos
            AdminUserSeeder::class, // Crea un usuarios administrador específicamente
        ]);
    }
}
