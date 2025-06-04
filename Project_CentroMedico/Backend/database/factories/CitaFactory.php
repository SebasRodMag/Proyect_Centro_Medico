<?php

namespace Database\Factories;

use App\Models\Cita;
use App\Models\Paciente;
use App\Models\Medico;
use App\Models\Contrato;
use Illuminate\Database\Eloquent\Factories\Factory;

class CitaFactory extends Factory
{
    protected $model = Cita::class;

    public function definition()
    {
        $paciente = Paciente::factory()->create();
        $medico = Medico::factory()->create();
        $contrato = Contrato::factory()->create();

        $fecha_hora_cita = $this->faker->dateTimeBetween('now', '+1 month');
        
        $estado = $this->faker->randomElement(['pendiente', 'realizado', 'cancelado']);
        $observaciones = $this->faker->text(30);


        return [
            'id_paciente' => $paciente->id,
            'id_medico' => $medico->id,
            'id_contrato' => $contrato->id,
            'fecha_hora_cita' => $fecha_hora_cita->format('Y-m-d H:i:s'),
            'estado' => $estado,
            'observaciones' => $observaciones,
        ];
    }
}
