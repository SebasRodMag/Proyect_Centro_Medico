<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesSeeder::class);
    }

    /**
     * Test the home page returns a successful response.
     */
    public function test_home_page_returns_successful_response()
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /**
     * Test creating a new client via API.
     */
    public function test_create_client()
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
     * Test fetching clients list via API.
     */
    public function test_get_clients_list()
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
     * Test user login.
     */
    public function test_user_login()
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
     * Test user logout.
     */
    public function test_user_logout()
    {
        $user = \App\Models\User::factory()->create();

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/auth/logout');

        $response->assertStatus(200);
    }

    /**
     * Test fetching authenticated user info.
     */
    public function test_get_authenticated_user()
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
