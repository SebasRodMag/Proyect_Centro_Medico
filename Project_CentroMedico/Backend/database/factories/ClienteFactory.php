<?php

namespace Database\Factories;

use App\Models\Cliente;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ClienteFactory extends Factory
{
    protected $model = Cliente::class;

    public function definition()
    {
        $user = User::factory()->create()->assignRole('Cliente');

        return [
            'razon_social' => $this->faker->company(),
            'cif' => strtoupper($this->faker->unique()->bothify('?#?#?#?#')),
            'direccion' => $this->faker->streetAddress(),
            'municipio' => $this->faker->city(),
            'provincia' => $this->faker->state(),
            'id_usuario' => $user->id,
        ];
    }
}
