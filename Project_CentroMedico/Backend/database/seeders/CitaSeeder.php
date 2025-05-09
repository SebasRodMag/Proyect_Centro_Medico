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

        // Obtiene IDs de pacientes, médicos y contratos existentes
        $pacientesIds = DB::table('pacientes')->pluck('id')->toArray();
        $medicosIds = DB::table('medicos')->pluck('id')->toArray();
        $contratosIds = DB::table('contratos')->pluck('id')->toArray();

        if (empty($pacientesIds) || empty($medicosIds) || empty($contratosIds)) {
            $this->command->warn('No hay pacientes, médicos o contratos disponibles para crear citas. Ejecuta los seeders correspondientes primero.');
            return;
        }

        for ($i = 0; $i < 20; $i++) {
            $fechaHoraCita = Carbon::instance($faker->dateTimeBetween('now', '+2 months')); // Se Convertir a Carbon
            $fechaHoraInicio = (clone $fechaHoraCita)->addMinutes(rand(5, 15)); // Se usa Carbon para addMinutes porque no funciona con DateTime
            $fechaHoraFin = (clone $fechaHoraInicio)->addMinutes(rand(15, 30));  

            DB::table('citas')->insert([
                'id_paciente' => $faker->randomElement($pacientesIds),
                'id_medico' => $faker->randomElement($medicosIds),
                'id_contrato' => $faker->randomElement($contratosIds),
                'fecha_hora_cita' => $fechaHoraCita,
                'estado' => $faker->randomElement(['pendiente', 'realizado', 'cancelado']),
                'observaciones' => $faker->sentence(10),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }
    }
}