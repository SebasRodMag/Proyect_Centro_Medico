<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;
use App\Models\User;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // Obtener usuarios con el rol de 'Cliente'
        $clientes = User::role('Cliente')->get();

        // Si no hay usuarios con el rol de 'Cliente'
        if ($clientes->isEmpty()) {
            $this->command->warn('No hay usuarios con el rol de Cliente.');
            return;
        }

        foreach ($clientes as $user) {
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

    private function generarCif(): string
    {
        $letras = 'ABCDEFGHJKLMNPQRSW';
        $inicio = $letras[rand(0, strlen($letras) - 1)];
        $numero = str_pad(rand(0, 9999999), 7, '0', STR_PAD_LEFT);
        $control = $letras[rand(0, strlen($letras) - 1)];

        return $inicio . $numero . $control;
    }
}
