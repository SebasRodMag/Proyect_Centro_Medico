<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;
use App\Models\User;

class ClienteSeeder extends Seeder
{
    /**
     * Se crean clientes.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // Obtiene el ID del rol "cliente"
        $clienteUsersIds = User::role('Cliente')->pluck('id')->toArray();


        if (empty($clienteUsersIds)) {
            $this->command->warn('No hay usuarios con rol "cliente" disponibles para crear clientes.');
            return;
        }

        foreach ($clienteUsersIds as $userId) {
            $cif = $this->generarCif(); // Usamos la función para generar un CIF

            DB::table('clientes')->insert([
                'id_usuario' => $userId,
                'razon_social' => $faker->company,
                'cif' => $cif,
                'direccion' => $faker->address,
                'municipio' => $faker->city,
                'provincia' => $faker->state,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }

    /**
     * Estamos generando un CIF ficticio.
     * El formato es una letra, 7 números y otra letra.
     * De una manera muy simplificada
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
