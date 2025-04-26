<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
use Faker\Factory as Faker;

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
        $emails = [
            'medico1@example.com', 
            'medico2@example.com', 
            'medico3@example.com', 
            'medico4@example.com', 
            'medico5@example.com', 
            'medico6@example.com', 
            'medico7@example.com', 
            'medico8@example.com'
        ];

        // Crea algunos usuarios médicos
        //Se hace de esta forma, por un error en al implementar el seeder y dar conflicto con los correos repetidos
        foreach ($emails as $email) {
            // Verificar si el usuario ya existe
            $user = DB::table('users')->where('email', $email)->first();

            if (!$user) {
                $userId = DB::table('users')->insertGetId([
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'rol' => 'medico',
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);

                DB::table('medicos')->insert([
                    'user_id' => $userId,
                    'nombre' => $faker->firstName,
                    'apellidos' => $faker->lastName . ' ' . $faker->lastName,
                    'dni' => $faker->unique()->dni,
                    'fecha_inicio' => Carbon::now()->subYears(5)->toDateString(),
                    'fecha_fin' => null,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }
    }
}