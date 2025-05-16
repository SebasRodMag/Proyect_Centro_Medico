<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Faker\Factory as Faker;
use App\Models\User;
use Spatie\Permission\Models\Role;


class MedicoSeeder extends Seeder
{
    /**
     * Necesitamos crear usuarios médicos antes de crear médicos.
     * Este seeder asume que ya existen usuarios en la base de datos.
     * Si no hay usuarios, se mostrará un mensaje de advertencia.
     * Este seeder crea 3 médicos con datos ficticios.
     * Se pueden modificar los datos según sea necesario.
     * Se pueden crear más médicos cambiando el número en el bucle for.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // Obtener usuarios con el rol de 'Medico'
        $usuariosMedicos = User::role('Medico')->get();

        if ($usuariosMedicos->isEmpty()) {
            $this->command->warn('No hay usuarios con el rol de Medico.');
            return;
        }

        foreach ($usuariosMedicos as $user) {
            // Verifica si ya tiene entrada en la tabla 'medicos'
            $yaExiste = DB::table('medicos')->where('id_usuario', $user->id)->exists();
            if (!$yaExiste) {
                DB::table('medicos')->insert([
                    'id_usuario' => $user->id,
                    'nombre' => $faker->firstName,
                    'apellidos' => $faker->lastName . ' ' . $faker->lastName,
                    'dni' => $faker->unique()->dni,
                    'fecha_inicio' => Carbon::now()->subYears(rand(1, 5))->toDateString(),
                    'fecha_fin' => null,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }
    }

}