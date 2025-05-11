<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;
use App\Models\User;

class PacienteSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        $clientesIds = DB::table('clientes')->pluck('id')->toArray();

        if (empty($clientesIds)) {
            $this->command->warn('No hay clientes disponibles para crear pacientes. Ejecuta primero el ClienteSeeder.');
            return;
        }

        // Obtener todos los usuarios con rol Paciente
        $pacientes = User::role('Paciente')->get();

        foreach ($pacientes as $user) {
            DB::table('pacientes')->insert([
                'id_usuario' => $user->id,
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