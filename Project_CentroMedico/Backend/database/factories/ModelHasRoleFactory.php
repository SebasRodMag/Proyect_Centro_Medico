<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use Spatie\Permission\Models\Role;

class ModelHasRoleFactory extends Factory
{
    protected $model = \Spatie\Permission\Models\ModelHasRole::class;

    public function definition()
    {
        return [
            'role_id' => Role::inRandomOrder()->first()->id ?? 1,
            'model_type' => User::class,
            'model_id' => User::inRandomOrder()->first()->id ?? 1,
        ];
    }
}
