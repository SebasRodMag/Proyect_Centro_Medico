<?php

namespace Database\Factories;

use App\Models\Medico;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedicoFactory extends Factory
{
    protected $model = Medico::class;

    public function definition()
    {
        $user = User::factory()->create()->assignRole('Medico');

        return [
            'nombre' => $this->faker->firstName(),
            'apellidos' => $this->faker->lastName() . ' ' . $this->faker->lastName(),
            'dni' => strtoupper($this->faker->unique()->bothify('########?')),
            'fecha_inicio' => $this->faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d'),
            'fecha_fin' => null,
            'id_usuario' => $user->id,
        ];
    }
}
