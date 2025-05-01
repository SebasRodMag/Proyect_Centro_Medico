<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;

class PacienteSeeder extends Seeder
{
/**
 * 
 * Para tener pacientes, primero hay que tener clientes.
 * Este seeder asume que ya existen clientes en la base de datos.
 * Si no hay clientes, se mostrará un mensaje de advertencia.
 */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // Obtiene algunos IDs de clientes existentes
        $clientesIds = DB::table('clientes')->pluck('id')->toArray();

        if (empty($clientesIds)) {
            $this->command->warn('No hay clientes disponibles para crear pacientes. Ejecuta primero el ClienteSeeder.');
            return;
        }

        for ($i = 0; $i < 10; $i++) {
            DB::table('pacientes')->insert([
                'id_cliente' => $faker->randomElement($clientesIds),
                'nombre' => $faker->firstName,
                'apellidos' => $faker->lastName . ' ' . $faker->lastName,
                'dni' => $faker->unique()->dni,
                'fecha_nacimiento' => $faker->date('Y-m-d'),
                'email' => $faker->unique()->safeEmail,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}