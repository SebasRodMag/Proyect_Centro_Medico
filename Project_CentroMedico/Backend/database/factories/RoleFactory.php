<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Spatie\Permission\Models\Role;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition()
    {
        $roles = ['Administrador', 'Medico', 'Paciente', 'Cliente'];

        return [
            'name' => $this->faker->unique()->randomElement($roles),
            'guard_name' => 'sanctum',
        ];
    }
}
