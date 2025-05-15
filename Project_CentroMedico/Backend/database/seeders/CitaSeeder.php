<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Faker\Factory as Faker;

class CitaSeeder extends Seeder
{
    /**
     * Crea citas médicas con datos ficticios.
     * Este seeder asume que ya existen pacientes, médicos y contratos en la base de datos.
     * Si no hay pacientes, médicos o contratos, se mostrará un mensaje de advertencia.
     * Este seeder crea 20 citas con datos ficticios.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        $pacientesIds = DB::table('pacientes')->pluck('id')->toArray();
        $medicosIds = DB::table('medicos')->pluck('id')->toArray();
        $contratosIds = DB::table('contratos')->pluck('id')->toArray();

        if (empty($pacientesIds) || empty($medicosIds) || empty($contratosIds)) {
            $this->command->warn('No hay pacientes, médicos o contratos disponibles para crear citas. Ejecuta los seeders correspondientes primero.');
            return;
        }

        // Fecha inicial: hoy a las 08:00
        $fecha = Carbon::today()->setHour(8)->setMinute(0);
        $finDia = Carbon::today()->setHour(14)->setMinute(0); // límite diario
        $totalCitas = 600;//Definir la cantidad de citas a crear

        for ($i = 0; $i < $totalCitas; $i++) {
            // Si pasamos de las 14:00, saltamos al día siguiente a las 08:00
            if ($fecha->greaterThanOrEqualTo($finDia)) {
                $fecha = $fecha->copy()->addDay()->setHour(8)->setMinute(0);
                $finDia = $fecha->copy()->setHour(14)->setMinute(0);
            }

            // Duración aleatoria (múltiplo de 5, entre 5 y 30 minutos)
            $duracion = $faker->randomElement([5, 10, 15, 20, 25, 30]);
            $fechaInicio = $fecha->copy();
            $fechaFin = $fecha->copy()->addMinutes($duracion);

            DB::table('citas')->insert([
                'id_paciente' => $faker->randomElement($pacientesIds),
                'id_medico' => $faker->randomElement($medicosIds),
                'id_contrato' => $faker->randomElement($contratosIds),
                'fecha_hora_cita' => $fechaInicio,
                'estado' => $faker->randomElement(['pendiente', 'realizado', 'cancelado']),
                'observaciones' => $faker->sentence(10),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);

            // Avanzamos al siguiente bloque de 5 minutos
            $fecha->addMinutes(5);
        }
    }

}