<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;

class ContratoSeeder extends Seeder
{
    /**
     * Se necesitan contratos para los pacientes.
     * Este seeder asume que ya existen pacientes en la base de datos.
     * Si no hay pacientes, se mostrará un mensaje de advertencia.
     * Este seeder crea contratos con datos ficticios.
     * Se pueden modificar los datos según sea necesario.
     * Se pueden crear más contratos cambiando el número en el bucle for.
     * Este seeder asocia contratos a clientes existentes.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // Obtiene algunos IDs de clientes existentes
        $clientesIds = DB::table('clientes')->pluck('id')->toArray();

        if (empty($clientesIds)) {
            $this->command->warn('No hay clientes disponibles para crear contratos. Ejecuta primero el ClienteSeeder.');
            return;
        }

        foreach ($clientesIds as $clienteId) {
            // Generar una fecha aleatoria entre el 1 de enero y el 31 de mayo de 2025
            $fechaInicio = Carbon::create(2025, 1, 1)->addDays(rand(0, 151)); // enero (0 días) a mayo 31 (151 días)

            DB::table('contratos')->insert([
                'id_cliente' => $clienteId,
                'fecha_inicio' => $fechaInicio->toDateString(),
                'fecha_fin' => $fechaInicio->copy()->addYear()->toDateString(),
                'numero_reconocimientos' => rand(10, 100),
                'autorenovacion' => $faker->boolean(90),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}
