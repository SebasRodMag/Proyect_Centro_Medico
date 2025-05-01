<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Se limpian los roles y permisos en caché
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Se crean los roles
        Role::firstOrCreate(['name' => 'Administrador', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Medico', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Paciente', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'Cliente', 'guard_name' => 'web']);
    }
}
