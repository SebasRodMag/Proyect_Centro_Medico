<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Medico;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Database\Seeders\RolesSeeder;
use Carbon\Carbon;

class MedicosControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    public function test_crear_medico_con_exito()
    {
        $user = User::factory()->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $data = [
            'nombre' => $this->faker->firstName,
            'apellidos' => $this->faker->lastName,
            'dni' => strtoupper($this->faker->unique()->bothify('#########')),
            'email' => $user->email,
        ];

        $response = $this->postJson('/api/medicos', $data);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Médico creado con éxito']);

        $this->assertDatabaseHas('medicos', [
            'nombre' => $data['nombre'],
            'apellidos' => $data['apellidos'],
            'dni' => $data['dni'],
            'id_usuario' => $user->id,
        ]);
    }

    public function test_actualizar_medico_conexito()
    {
        $medico = Medico::factory()->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $data = [
            'nombre' => 'UpdatedName',
            'apellidos' => 'UpdatedLastName',
            'fecha_fin' => Carbon::tomorrow()->toDateString(),
        ];

        $response = $this->putJson('/api/medicos/' . $medico->id, $data);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Médico actualizado con éxito']);

        $this->assertDatabaseHas('medicos', [
            'id' => $medico->id,
            'nombre' => 'UpdatedName',
            'apellidos' => 'UpdatedLastName',
            'fecha_fin' => $data['fecha_fin'],
        ]);
    }

    public function test_borrar_medico_con_exito()
    {
        $medico = Medico::factory()->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $response = $this->deleteJson('/api/medicos/' . $medico->id);

        $response->assertStatus(200)
            ->assertJson(['message' => 'Médico eliminado con éxito']);

        $this->assertSoftDeleted('medicos', ['id' => $medico->id]);
    }

    public function test_listat_medicos()
    {
        $medicos = Medico::factory()->count(3)->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $response = $this->getJson('/api/medicos');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    public function test_mostrar_medico_especifico()
    {
        $medico = Medico::factory()->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $response = $this->getJson('/api/medicos/' . $medico->id);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $medico->id,
                'nombre' => $medico->nombre,
            ]);
    }

    public function test_medico_logueado()
    {
        $user = User::factory()->create();
        $user ->assignRole('Medico');
        $medico = Medico::factory()->create(['id_usuario' => $user->id]);
        $this->actingAs($user, 'sanctum');

        $response = $this->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'email',
                    'email_verified_at',
                    'created_at',
                    'updated_at',
                    'rol_id',
                ],
            ]);
    }
}
