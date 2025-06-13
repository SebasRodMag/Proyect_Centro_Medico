<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Medico;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Database\Seeders\RolesSeeder;
use Carbon\Carbon;

#[\PHPUnit\Framework\Attributes\CoversClass('App\Http\Controllers\MedicosController')]
#[\PHPUnit\Framework\Attributes\Group('medicos-controller')]
#[\PHPUnit\Framework\Attributes\UsesClass(\App\Models\User::class)]
#[\PHPUnit\Framework\Attributes\UsesClass(\App\Models\Medico::class)]
class MedicosControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    /**
     * Comprobar la creación de un médico desde el rol administrador
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_crear_medico_con_exito_con_rol_administrador()
    {
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $data = [
            'nombre' => $this->faker->firstName,
            'apellidos' => $this->faker->lastName,
            'dni' => strtoupper($this->faker->unique()->bothify('#########')),
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/medicos', $data);

        $response->assertStatus(201)
            ->assertJson(['message' => 'Médico creado con éxito']);

        $this->assertDatabaseHas('medicos', [
            'nombre' => $data['nombre'],
            'apellidos' => $data['apellidos'],
            'dni' => $data['dni'],
        ]);
    }

    /**
     * Comprobar la creación fallida de un médico desde el rol medico
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_crear_medico_fallido_con_rol_medico()
    {
        $user = User::factory()->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $data = [
            'nombre' => $this->faker->firstName,
            'apellidos' => $this->faker->lastName,
            'dni' => strtoupper($this->faker->unique()->bothify('#########')),
            'email' => $user->email,
        ];

        $response = $this->postJson('/api/medicos', $data);

        $response->assertStatus(403);
    }

    /**
     * Comprobar la creación fallida de un médico desde el rol paciente
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_crear_medico_fallido_con_rol_paciente()
    {
        $user = User::factory()->create();
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $data = [
            'nombre' => $this->faker->firstName,
            'apellidos' => $this->faker->lastName,
            'dni' => strtoupper($this->faker->unique()->bothify('#########')),
            'email' => $user->email,
        ];

        $response = $this->postJson('/api/medicos', $data);

        $response->assertStatus(403);
    }

    /**
     * Comprobar la creación exitosa de un médico desde el rol administrador
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_actualizar_medico_con_exito()
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

    /**
     * Comprobar la creación fallida de un médico desde el rol medico
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_actualizar_medico_fallida_desde_rol_medico()
    {
        $medico = Medico::factory()->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $data = [
            'nombre' => 'UpdatedName',
            'apellidos' => 'UpdatedLastName',
            'fecha_fin' => Carbon::tomorrow()->toDateString(),
        ];

        $response = $this->putJson('/api/medicos/' . $medico->id, $data);

        $response->assertStatus(403);
    }

    /**
     * Comprobar la creación fallida de un médico desde el rol paciente
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_actualizar_medico_fallida_desde_rol_paciente()
    {
        $medico = Medico::factory()->create();
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $data = [
            'nombre' => 'UpdatedName',
            'apellidos' => 'UpdatedLastName',
            'fecha_fin' => Carbon::tomorrow()->toDateString(),
        ];

        $response = $this->putJson('/api/medicos/' . $medico->id, $data);

        $response->assertStatus(403);
    }

    /**
     * Comprobar el borrado de forma exitosa de un médico desde el rol administrador
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_borrar_medico_con_exito_con_rol_administrador()
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

    /**
     * Comprobar el borrado de forma fallida de un médico desde el rol Medico
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_borrar_medico_fallido_con_rol_medico()
    {
        $medico = Medico::factory()->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $response = $this->deleteJson('/api/medicos/' . $medico->id);

        $response->assertStatus(403);
    }

    /**
     * Comprobar el borrado de forma fallida de un médico desde el rol paciente
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_borrar_medico_fallido_con_rol_paciente()
    {
        $medico = Medico::factory()->create();
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $response = $this->deleteJson('/api/medicos/' . $medico->id);

        $response->assertStatus(403);
    }

    /**
     * Comprobar el listado de médicos con rol administrador
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_listat_medicos_con_rol_administrador()
    {
        $medicos = Medico::factory()->count(3)->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $response = $this->getJson('/api/medicos');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /**
     * Comprobar el listado de médicos con rol medico
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_listar_medicos_con_rol_medico()
    {
        $medicos = Medico::factory()->count(3)->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $response = $this->getJson('/api/medicos');

        $response->assertStatus(403);
    }

    /**
     * Comprobar el listado de médicos con rol paciente
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_listar_medicos_con_rol_paciente()
    {
        $medicos = Medico::factory()->count(3)->create();
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $response = $this->getJson('/api/medicos');

        $response->assertStatus(403);
    }


    /**
     * Comprobar mostrar un medico especifico con rol administrador
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_mostrar_medico_especifico_con_rol_administrador()
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

    /**
     * Comprobar mostrar un medico especifico con rol medico
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_mostrar_medico_especifico_con_rol_medico()
    {
        $medico = Medico::factory()->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $response = $this->getJson('/api/medicos/' . $medico->id);

        $response->assertStatus(403);
    }

    /**
     * Comprobar mostrar un medico especifico con rol paciente
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
    public function test_mostrar_medico_especifico_con_rol_paciente()
    {
        $medico = Medico::factory()->create();
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $response = $this->getJson('/api/medicos/' . $medico->id);

        $response->assertStatus(403);
    }

    /**
     * Comprobar el usuario logueado con rol medico
     */
    #[\PHPUnit\Framework\Attributes\Group('medicos')]
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
