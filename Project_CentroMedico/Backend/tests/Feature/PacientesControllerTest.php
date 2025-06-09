<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Cliente;
use App\Models\Paciente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Database\Seeders\RolesSeeder;

#[\PHPUnit\Framework\Attributes\CoversClass('App\Http\Controllers\PacienteController')]
#[\PHPUnit\Framework\Attributes\Group('pacientes-controller')]
#[\PHPUnit\Framework\Attributes\UsesClass(\App\Models\Cliente::class)]
#[\PHPUnit\Framework\Attributes\UsesClass(\App\Models\User::class)]
#[\PHPUnit\Framework\Attributes\UsesClass(\App\Models\Paciente::class)]
class PacientesControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    /**
     * Configuración inicial para cada test.
     *
     * Se ejecuta antes de cada método de test.
     * Siembra los roles necesarios para la asignación de permisos, asegurando que los roles
     * 'Administrador', 'Medico' y 'Paciente' estén disponibles para los tests.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    /**
     * Verifica que un paciente puede ser creado exitosamente por un usuario con rol 'Administrador'.
     *
     * Se espera que el endpoint POST /api/clientes/{cliente_id}/pacientes
     * devuelva un estado 201 (Created) y un mensaje de éxito.
     * Se comprueba la persistencia de los datos del paciente en la base de datos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_crear_paciente_con_exito_con_rol_administrador(): void
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

    /**
     * Verifica que un usuario con rol 'Medico' NO puede crear un paciente.
     *
     * Se espera que el endpoint POST /api/clientes/{cliente_id}/pacientes
     * devuelva un estado 403 (Forbidden) debido a la falta de permisos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_crear_paciente_con_exito_con_rol_medico(): void
    {
        $cliente = Cliente::factory()->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $data = [
            'nombre' => $this->faker->firstName,
            'apellidos' => $this->faker->lastName,
            'dni' => strtoupper($this->faker->unique()->bothify('#########')),
            'fecha_nacimiento' => $this->faker->date('Y-m-d', '2000-01-01'),
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/clientes/' . $cliente->id . '/pacientes', $data);

        $response->assertStatus(403);
    }

    /**
     * Verifica que un usuario con rol 'Paciente' NO puede crear un paciente.
     *
     * Se espera que el endpoint POST /api/clientes/{cliente_id}/pacientes
     * devuelva un estado 403 (Forbidden) debido a la falta de permisos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_crear_paciente_con_exito_con_rol_paciente(): void
    {
        $cliente = Cliente::factory()->create();
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $data = [
            'nombre' => $this->faker->firstName,
            'apellidos' => $this->faker->lastName,
            'dni' => strtoupper($this->faker->unique()->bothify('#########')),
            'fecha_nacimiento' => $this->faker->date('Y-m-d', '2000-01-01'),
            'email' => $this->faker->unique()->safeEmail,
            'password' => 'password123',
        ];

        $response = $this->postJson('/api/clientes/' . $cliente->id . '/pacientes', $data);

        $response->assertStatus(403);
    }

    /**
     * Verifica que un paciente puede ser actualizado exitosamente por un usuario con rol 'Administrador'.
     *
     * Se espera que el endpoint PUT /api/clientes/pacientes/{paciente_id}
     * devuelva un estado 200 (OK) y un mensaje de éxito.
     * Se comprueba que los datos del paciente se actualizan correctamente en la base de datos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_actualizar_paciente_con_exito(): void
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

    /**
     * Verifica que un paciente NO puede ser actualizado por un usuario con rol 'Paciente'.
     *
     * Se espera que el endpoint PUT /api/clientes/pacientes/{paciente_id}
     * devuelva un estado 403 (Forbidden).
     * Se comprueba que los datos del paciente no son actualizados en la base de datos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_actualizar_paciente_con_exito_con_rol_paciente(): void
    {
        $paciente = Paciente::factory()->create();
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $data = [
            'nombre' => 'UpdatedName',
            'apellidos' => 'UpdatedLastName',
        ];

        $response = $this->putJson('/api/clientes/pacientes/' . $paciente->id, $data);

        $response->assertStatus(403);
    }

    /**
     * Verifica que un paciente NO puede ser actualizado por un usuario con rol 'Medico'.
     *
     * Se espera que el endpoint PUT /api/clientes/pacientes/{paciente_id}
     * devuelva un estado 403 (Forbidden).
     * Se comprueba que los datos del paciente no son actualizados en la base de datos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_actualizar_paciente_con_exito_con_rol_medico(): void
    {
        $paciente = Paciente::factory()->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $data = [
            'nombre' => 'UpdatedName',
            'apellidos' => 'UpdatedLastName',
        ];

        $response = $this->putJson('/api/clientes/pacientes/' . $paciente->id, $data);

        $response->assertStatus(403);
    }

    /**
     * Verifica que un paciente puede ser eliminado (soft deleted) exitosamente por un usuario con rol 'Administrador'.
     *
     * Se espera que el endpoint DELETE /api/clientes/{cliente_id}/pacientes/{paciente_id}
     * devuelva un estado 200 (OK) y un mensaje de éxito.
     * Se comprueba que el paciente se marca como eliminado lógicamente en la base de datos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_eliminar_paciente_con_exito_con_rol_administrador(): void
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

    /**
     * Verifica que un paciente NO puede ser eliminado por un usuario con rol 'Medico'.
     *
     * Se espera que el endpoint DELETE /api/clientes/{cliente_id}/pacientes/{paciente_id}
     * devuelva un estado 403 (Forbidden).
     * Se comprueba que el paciente no es eliminado de la base de datos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_eliminar_paciente_con_exito_con_rol_medico(): void
    {
        $cliente = Cliente::factory()->create();
        $paciente = Paciente::factory()->create(['id_cliente' => $cliente->id]);
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $response = $this->deleteJson('/api/clientes/' . $cliente->id . '/pacientes/' . $paciente->id);

        $response->assertStatus(403);
    }

    /**
     * Verifica que un paciente NO puede ser eliminado por un usuario con rol 'Paciente'.
     *
     * Se espera que el endpoint DELETE /api/clientes/{cliente_id}/pacientes/{paciente_id}
     * devuelva un estado 403 (Forbidden).
     * Se comprueba que el paciente no es eliminado de la base de datos.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_eliminar_paciente_con_exito_con_rol_paciente(): void
    {
        $cliente = Cliente::factory()->create();
        $paciente = Paciente::factory()->create(['id_cliente' => $cliente->id]);
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $response = $this->deleteJson('/api/clientes/' . $cliente->id . '/pacientes/' . $paciente->id);

        $response->assertStatus(403);
    }

    /**
     * Verifica que se pueden listar todos los pacientes existentes por un usuario con rol 'Administrador'.
     *
     * Se espera que el endpoint GET /api/pacientes devuelva un estado 200 (OK)
     * y la cantidad correcta de pacientes.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_listar_pacientes_con_rol_administrador(): void
    {
        Paciente::factory()->count(3)->create();
        $adminUser = User::factory()->create();
        $adminUser->assignRole('Administrador');
        $this->actingAs($adminUser, 'sanctum');

        $response = $this->getJson('/api/pacientes');

        $response->assertStatus(200)
            ->assertJsonCount(3);
    }

    /**
     * Verifica que NO se pueden listar los pacientes existentes por un usuario con rol 'Medico'.
     *
     * Se espera que el endpoint GET /api/pacientes devuelva un estado 403 (Forbidden).
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_listar_pacientes_con_rol_medico(): void
    {
        Paciente::factory()->count(3)->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $response = $this->getJson('/api/pacientes');

        $response->assertStatus(403);
    }

    /**
     * Verifica que se puede mostrar un paciente específico por su ID por un usuario con rol 'Administrador'.
     *
     * Se espera que el endpoint GET /api/pacientes/{paciente_id}
     * devuelva un estado 200 (OK) y los datos correctos del paciente.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_mostrar_paciente_con_rol_administrador(): void
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

    /**
     * Verifica que se puede mostrar un paciente específico por su ID por un usuario con rol 'Medico'.
     *
     * Se espera que el endpoint GET /api/pacientes/{paciente_id}
     * devuelva un estado 200 (OK) y los datos correctos del paciente.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_mostrar_paciente_con_rol_medico(): void
    {
        $paciente = Paciente::factory()->create();
        $medicoUser = User::factory()->create();
        $medicoUser->assignRole('Medico');
        $this->actingAs($medicoUser, 'sanctum');

        $response = $this->getJson('/api/pacientes/' . $paciente->id);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $paciente->id,
                'nombre' => $paciente->nombre,
            ]);
    }

    /**
     * Verifica que se puede mostrar un paciente específico por su ID por un usuario con rol 'Paciente'.
     *
     * Se espera que el endpoint GET /api/pacientes/{paciente_id}
     * devuelva un estado 200 (OK) y los datos correctos del paciente.
     *
     * @return void
     */
    #[\PHPUnit\Framework\Attributes\Group('pacientes')]
    public function test_mostrar_paciente_con_rol_paciente(): void
    {
        $paciente = Paciente::factory()->create();
        $pacienteUser = User::factory()->create();
        $pacienteUser->assignRole('Paciente');
        $this->actingAs($pacienteUser, 'sanctum');

        $response = $this->getJson('/api/pacientes/' . $paciente->id);

        $response->assertStatus(200)
            ->assertJson([
                'id' => $paciente->id,
                'nombre' => $paciente->nombre,
            ]);
    }
}