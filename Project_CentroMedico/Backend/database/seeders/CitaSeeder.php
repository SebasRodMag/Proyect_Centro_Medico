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

        // Inicia el cursor de tiempo a las 08:00 de hoy
        $fecha = Carbon::today()->setHour(8)->setMinute(0);
        $finDia = Carbon::today()->setHour(14)->setMinute(0); // Fin de jornada
        $totalCitas = 400;// Total de citas a crear

        for ($i = 0; $i < $totalCitas; $i++) {
            // Si ya es hora de cerrar, salta al día siguiente a las 08:00
            if ($fecha->greaterThanOrEqualTo($finDia)) {
                $fecha = $fecha->copy()->addDay()->setHour(8)->setMinute(0);
                $finDia = $fecha->copy()->setHour(14)->setMinute(0);
            }

            $fechaInicio = $fecha->copy();
            $fechaFin = $fechaInicio->copy()->addMinutes(5); // Duración fija

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

            // Avanza exactamente 5 minutos
            $fecha->addMinutes(5);
        }
    }

}