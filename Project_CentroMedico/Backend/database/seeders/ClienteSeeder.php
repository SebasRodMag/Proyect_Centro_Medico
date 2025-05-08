<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ClienteSeeder extends Seeder
{
    /**
     * Se crean clientes.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // Correos de clientes para asegurar que no haya repetidos
        $emails = [
            'cliente1@example.com', 
            'cliente2@example.com', 
            'cliente3@example.com', 
            'cliente4@example.com', 
            'cliente5@example.com', 
            'cliente6@example.com', 
            'cliente7@example.com', 
            'cliente8@example.com'
        ];

        // Crea algunos usuarios clientes
        foreach ($emails as $email) {
            // Verificar si el usuario ya existe
            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'email' => $email,
                    'password' => Hash::make('password123'),
                ]);
            
                // Asignar el rol de Cliente
                // $user->assignRole('Cliente', 'sanctum');
            
                DB::table('clientes')->insert([
                    'id_usuario' => $user->id,
                    'razon_social' => $faker->company,
                    'cif' => $this->generarCif(),
                    'direccion' => $faker->address,
                    'municipio' => $faker->city,
                    'provincia' => $faker->state,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]);
            }
        }
    }

    /**
     * Función para generar un CIF ficticio.
     * El formato es una letra, 7 números y otra letra.
     *
     * @return string
     */
    private function generarCif(): string
    {
        $letras = 'ABCDEFGHJKLMNPQRSW';
        $inicio = $letras[rand(0, strlen($letras) - 1)];
        $numero = str_pad(rand(0, 9999999), 7, '0', STR_PAD_LEFT);
        $control = $letras[rand(0, strlen($letras) - 1)];

        return $inicio . $numero . $control;
    }
}
