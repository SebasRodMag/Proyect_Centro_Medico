<?php

namespace Database\Factories;

use App\Models\Paciente;
use App\Models\User;
use App\Models\Cliente;
use Illuminate\Database\Eloquent\Factories\Factory;

class PacienteFactory extends Factory
{
    protected $model = Paciente::class;

    public function definition()
    {
        $user = User::factory()->create()->assignRole('Paciente');
        $cliente = Cliente::factory()->create();

        return [
            'id_cliente' => $cliente->id,
            'nombre' => $this->faker->firstName(),
            'apellidos' => $this->faker->lastName() . ' ' . $this->faker->lastName(),
            'dni' => strtoupper($this->faker->unique()->bothify('########?')),
            'fecha_nacimiento' => $this->faker->date('Y-m-d', '-18 years'),
            'email' => $this->faker->unique()->safeEmail(),
            'id_usuario' => $user->id,
        ];
    }
}
