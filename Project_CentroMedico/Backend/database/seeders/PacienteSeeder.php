<?php

namespace Database\Seeders;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;

class PacienteSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // Obtener usuarios con el rol de 'Paciente'
        $usuariosPacientes = User::role('Paciente')->get();

        if ($usuariosPacientes->isEmpty()) {
            $this->command->warn('No hay usuarios con el rol de Paciente.');
            return;
        }

        // Obtener todos los clientes existentes
        $clientes = Cliente::whereHas('user', function($query) {
            $query->role('Cliente'); // o más condiciones si quieres
        })->get();

        if ($clientes->isEmpty()) {
            $this->command->warn('No hay clientes en la base de datos. No se pueden asignar pacientes.');
            return;
        }

        foreach ($usuariosPacientes as $user) {
            $yaExiste = DB::table('pacientes')->where('id_usuario', $user->id)->exists();
            if (!$yaExiste) {

                // Obtener un cliente aleatorio para asociar al paciente
                $cliente = $clientes->random();

                DB::table('pacientes')->insert([
                    'nombre' => $faker->firstName,
                    'apellidos' => $faker->lastName . ' ' . $faker->lastName,
                    'dni' => $faker->unique()->dni,
                    'id_usuario' => $user->id,
                    'fecha_nacimiento' => $faker->dateTimeBetween('-70 years', '-18 years')->format('Y-m-d'),
                    'email' => $user->email,
                    'id_cliente' => $cliente->id,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }
    }
}

