<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Cliente;
use App\Models\Paciente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Database\Seeders\RolesSeeder;

class PacientesControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_crear_paciente_con_exito()
    {
        $cliente = Cliente::factory()->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $data = [
            'nombre' => $this->faker->firstName,
            'apellidos' => $this->faker->lastName,
            'dni' => strtoupper($this->faker->unique()->bothify('#########')),
            'fecha_nacimiento' => $this->faker->date('Y-m-d', '2000-01-01'),
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/clientes/' . $cliente->id . '/pacientes', $data);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Paciente creado con éxito']);

        $this->assertDatabaseHas('pacientes', [
            'email' => $data['email'],
            'nombre' => $data['nombre'],
        ]);
    }

    public function test_actualizar_paciente_con_exito()
    {
        $paciente = Paciente::factory()->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $data = [
            'nombre' => 'UpdatedName',
            'apellidos' => 'UpdatedLastName',
        ];

        $response = $this->putJson('/api/clientes/pacientes/' . $paciente->id, $data);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Paciente actualizado con éxito']);

        $this->assertDatabaseHas('pacientes', [
            'id' => $paciente->id,
            'nombre' => 'UpdatedName',
            'apellidos' => 'UpdatedLastName',
        ]);
    }

    public function test_eliminar_paciente_con_exito()
    {
        $cliente = Cliente::factory()->create();
        $paciente = Paciente::factory()->create(['id_cliente' => $cliente->id]);
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $response = $this->deleteJson('/api/clientes/' . $cliente->id . '/pacientes/' . $paciente->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Paciente eliminado con éxito']);

        $this->assertSoftDeleted('pacientes', ['id' => $paciente->id]);
    }

    public function test_listar_pacientes()
    {
        $pacientes = Paciente::factory()->count(3)->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $response = $this->getJson('/api/pacientes');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_mostrar_paciente()
    {
        $paciente = Paciente::factory()->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $response = $this->getJson('/api/pacientes/' . $paciente->id);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $paciente->id,
                'nombre' => $paciente->nombre,
            ]);
    }
}
