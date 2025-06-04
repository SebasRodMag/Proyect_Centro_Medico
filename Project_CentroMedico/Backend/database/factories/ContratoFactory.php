<?php

namespace Database\Factories;

use App\Models\Contrato;
use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContratoFactory extends Factory
{
    protected $model = Contrato::class;

    public function definition()
    {
        $cliente = Cliente::factory()->create();

        $fecha_inicio = $this->faker->dateTimeBetween('-1 years', 'now');
        $fecha_fin = $this->faker->dateTimeBetween($fecha_inicio, '+1 years');

        return [
            'id_cliente' => $cliente->id,
            'fecha_inicio' => $fecha_inicio->format('Y-m-d'),
            'fecha_fin' => $fecha_fin->format('Y-m-d'),
            'numero_reconocimientos' => $this->faker->numberBetween(1, 10),
            'autorenovacion' => $this->faker->boolean(80),
        ];
    }
}
