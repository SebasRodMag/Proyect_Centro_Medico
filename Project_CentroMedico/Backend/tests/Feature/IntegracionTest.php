<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Class IntegracionTest
 *
 * Pruebas de integración para la API del sistema.
 */
class IntegracionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Configuración inicial para las pruebas.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesSeeder::class);
    }

    /**
     * Comprobar que la respuesta de la API es exitosa al navegar a la ruta de inicio.
     *
     * @return void
     */
    public function test_navegacion_a_home_page()
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /**
     * Comprobar que la respuesta de la api es exitosa al solicitar la creación de un nuevo cliente mediante el rol administrador.
     *
     * @return void
     */
    public function test_crear_cliente_desde_rol_administrador()
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;

        $clientData = [
            'email' => 'testclient@example.com',
            'password' => 'password123',
            'razon_social' => 'Fruteria Test',
            'cif' => '99999999Z',
            'direccion' => 'Plaza la prueba1',
            'municipio' => 'La Test',
            'provincia' => 'Almería',
            'reconocimientos' => 88,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/clientes', $clientData);

        $response->assertStatus(201)
                ->assertJsonFragment(['message' => 'Cliente y contrato creados con éxito']);
    }

    /**
     * Comprobar que la respuesta de la api es fallida al solicitar la creación de un nuevo cliente mediante el rol medico.
     *
     * @return void
     */
    public function test_crear_cliente_desde_rol_medico()
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('Medico');
        $token = $user->createToken('test-token')->plainTextToken;

        $clientData = [
            'email' => 'testclient@example.com',
            'password' => 'password123',
            'razon_social' => 'Fruteria Test',
            'cif' => '99999999Z',
            'direccion' => 'Plaza la prueba1',
            'municipio' => 'La Test',
            'provincia' => 'Almería',
            'reconocimientos' => 88,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/clientes', $clientData);

        $response->assertStatus(403);
    }

    /**
     * Comprobar que la respuesta de la api es fallida al solicitar la creación de un nuevo cliente mediante el rol paciente.
     *
     * @return void
     */
    public function test_crear_cliente_desde_rol_paciente()
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('Paciente');
        $token = $user->createToken('test-token')->plainTextToken;

        $clientData = [
            'email' => 'testclient@example.com',
            'password' => 'password123',
            'razon_social' => 'Fruteria Test',
            'cif' => '99999999Z',
            'direccion' => 'Plaza la prueba1',
            'municipio' => 'La Test',
            'provincia' => 'Almería',
            'reconocimientos' => 88,
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/clientes', $clientData);

        $response->assertStatus(403);
    }

    /**
     * Comprobar la ruta API para listar los clientes con el rol administrador.
     *
     * @return void
     */
    public function test_listar_clientes_desde_rol_administrador()
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/clientes');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    '*' => [
                        'id',
                        'razon_social',
                        'cif',
                        'direccion',
                        'municipio',
                        'provincia',
                        'id_usuario',
                        'created_at',
                        'updated_at',
                        'deleted_at',
                        'contrato_vigente' => [
                            'id',
                            'id_cliente',
                            'fecha_inicio',
                            'fecha_fin',
                            'numero_reconocimientos',
                            'autorenovacion',
                            'created_at',
                            'updated_at',
                            'deleted_at',
                            'reconocimientos_restantes',
                        ],
                        'contratos' => [
                            '*' => [
                                'id',
                                'id_cliente',
                                'fecha_inicio',
                                'fecha_fin',
                                'numero_reconocimientos',
                                'autorenovacion',
                                'created_at',
                                'updated_at',
                                'deleted_at',
                                'reconocimientos_restantes',
                            ],
                        ],
                    ],
                ]);
    }


    /**
     * Comprobar la ruta API para listar los clientes con el rol medico.
     *
     * @return void
     */
    public function test_listar_clientes_desde_rol_medico()
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('Medico');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/clientes');

        $response->assertStatus(403);
    }

    /**
     * Comprobar la ruta API para listar los clientes con el rol paciente.
     *
     * @return void
     */
    public function test_listar_clientes_desde_rol_paciente()
    {
        $user = \App\Models\User::factory()->create();
        $user->assignRole('Paciente');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/clientes');

        $response->assertStatus(403);
    }

    /**
     * Comprobar la respuesta de la API a la ruta /login.
     *
     * @return void
     */
    public function test_usuario_login()
    {
        $password = 'password123';
        $user = \App\Models\User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt($password),
        ]);
        $user->assignRole('Administrador');

        $userData = [
            'email' => 'admin@example.com',
            'password' => $password,
        ];

        $response = $this->postJson('/api/auth/login', $userData);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'token',
                    'user' => [
                        'id',
                        'email',
                        'email_verified_at',
                        'created_at',
                        'updated_at',
                        'deleted_at',
                        'rol',
                        'name',
                    ],
                ]);
    }

    /**
     * Comprobar la respuesta de la API al ruta /logout.
     *
     * @return void
     */
    public function test_usuario_logout()
    {
        $user = \App\Models\User::factory()->create();

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }

    /**
     * Comprobar la respuesta de la API al ruta /auth/me para obtener información del usuario logueado.
     *
     * @return void
     */
    public function test_obtener_usuario_autenticado()
    {
        $user = \App\Models\User::factory()->create();

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/auth/me');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'user' => [
                        "id",
                        "email",
                        "email_verified_at",
                        "created_at",
                        "updated_at",
                        "deleted_at",
                        "rol_id",
                    ],
                ]);
    }
}
