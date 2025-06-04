<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
//use Illuminate\Foundation\Testing\RefreshDatabase;

class UsersControllerTest extends TestCase
{
    //use RefreshDatabase;

    public function prueba_ruta_index_returns_todos_los_usuarios()
    {
        $response = $this->getJson('/usuarios');
        $response->assertStatus(200);
        
    }

    public function prueba_ruta_show_returns_usuario()
    {
        $user = User::factory()->create();

        $response = $this->getJson("/usuarios/{$user->id}");
        $response->assertStatus(200);
        $response->assertJsonIsArray();
        $response->assertJsonFragment(['id' => $user->id]);
    }

    public function prueba_ruta_store_usuario()
    {
        $data = [
            'email' => 'testuser@example.com',
            'password' => 'password123',
        ];

        $response = $this->postJson('/usuarios', $data);
        $response->assertStatus(201);
        $response->assertJsonFragment(['message' => 'Usuario creado con éxito. ID:']);
    }

    public function prueba_ruta_destroy_usuario()
    {
        $user = User::factory()->create();

        $response = $this->deleteJson("/usuarios/{$user->id}");
        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Usuario eliminado con éxito']);
    }

    public function prueba_ruta_update_usuario()
    {
        $user = User::factory()->create();
        $data = ['email'=>'ejemploemail@correo.es'];

        $response = $this->putJson("/usuario/{$user->id}", $data);
        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Usuario creado con éxito.']);
    }

/*     public function test_store_route_validation_errors()
    {
        $response = $this->postJson('/usuario', []);
        $response->assertStatus(404);
        $response->assertJsonValidationErrors(['email', 'password']);
    } */

/*     public function test_assign_route_role_not_found()
    {
        $user = User::factory()->create();
        $data = ['rol' => 'nonexistentrole'];

        $response = $this->postJson("/users/{$user->id}/assign", $data);
        $response->assertStatus(404);
        $response->assertJsonFragment(['message' => 'El rol no existe.']);
    } */

/*     public function test_assign_route_user_not_found()
    {
        $data = ['rol' => 'user'];

        $response = $this->postJson("/users/999999/assign", $data);
        $response->assertStatus(404);
    } */

/*     public function test_update_route_validation_errors()
    {
        $user = User::factory()->create();
        $response = $this->putJson("/users/{$user->id}", []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['rol']);
    } */

    public function test_update_route_user_not_found()
    {
        $data = ['email' => 'user'];
        $response = $this->putJson("/usuario/1", $data);
        $response->assertStatus(404);
    }

    public function test_destroy_route_user_not_found()
    {
        $response = $this->deleteJson("/usuario/999999");
        $response->assertStatus(404);
    }

    public function test_show_route_user_not_found()
    {
        $response = $this->getJson("/usuario/999999");
        $response->assertStatus(404);
    }
}
