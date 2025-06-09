<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;

/**
 * Class UsersControllerTest
 *
 * Pruebas para las rutas API del controlador UsersController.
 */
class UsersControllerTest extends TestCase
{
    /**
     * Prueba que la ruta index devuelve todos los usuarios para el usuario logueado con el rol 'Administrador'.
     *
     * @return void
     */
    public function test_ruta_index_devuelve_todos_los_usuarios_desde_el_rol_administrador()
    {
        $user = User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;

        $this->actingAs($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/usuarios');
        $response->assertStatus(200);
    }

    /**
     * Prueba que la ruta index devuelve todos los usuarios para el usuario logueado con el rol 'Pacientes'.
     *
     * @return void
     */
    public function test_ruta_index_devuelve_todos_los_usuarios_desde_el_rol_paciente()
    {
        $user = User::factory()->create();
        $user->assignRole('Paciente');
        $token = $user->createToken('test-token')->plainTextToken;

        $this->actingAs($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/usuarios');
        $response->assertStatus(403);
    }

    /**
     * Prueba que la ruta index devuelve todos los usuarios para el usuario logueado con el rol 'Medico'.
     *
     * @return void
     */
    public function test_ruta_index_devuelve_todos_los_usuarios_desde_el_rol_medico()
    {
        $user = User::factory()->create();
        $user->assignRole('Medico');
        $token = $user->createToken('test-token')->plainTextToken;

        $this->actingAs($user);

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/usuarios');
        $response->assertStatus(403);
    }

    /**
     * Prueba que la ruta show devuelve un usuario específico desde el rol 'Administrador'.
     *
     * @return void
     */
    public function test_ruta_show_devuelve_usuario()
    {
        $user = User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/usuarios/{$user->id}");
        $response->assertStatus(200);
        $response->assertJsonFragment(['id' => $user->id]);
    }

    /**
     * Prueba que la ruta show devuelve un usuario específico desde el rol 'Paciente'.
     *
     * @return void
     */
    public function test_ruta_show_devuelve_usuario_desde_el_rol_paciente()
    {
        $user = User::factory()->create();
        $user->assignRole('Paciente');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/usuarios/{$user->id}");
        $response->assertStatus(403);
    }

    /**
     * Prueba que la ruta show devuelve un usuario específico desde el rol 'Medico'.
     *
     * @return void
     */
    public function test_ruta_show_devuelve_usuario_desde_el_rol_medico()
    {
        $user = User::factory()->create();
        $user->assignRole('Medico');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/usuarios/{$user->id}");
        $response->assertStatus(403);
    }

    /**
     * Prueba que la ruta store crea un nuevo usuario desde el rol 'Administrador'.
     *
     * @return void
     */
    public function test_ruta_store_usuario_desde_el_rol_administrador()
    {
        $user = User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'email' => 'uniqueuser' . uniqid('', true) . '@example.com',
            'password' => 'password123',
            'rol' => 'Administrador',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/usuarios', $data);
        $response->assertStatus(201);
        $this->assertStringContainsString('Usuario creado con éxito. ID:', $response->json('message'));
    }

    /**
     * Prueba que la ruta store crea un nuevo usuario desde el rol 'Paciente'.
     *
     * @return void
     */
    public function test_ruta_store_usuario_desde_el_rol_paciente()
    {
        $user = User::factory()->create();
        $user->assignRole('Paciente');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'email' => 'uniqueuser' . uniqid('', true) . '@example.com',
            'password' => 'password123',
            'rol' => 'Paciente',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/usuarios', $data);
        $response->assertStatus(403);
    }

    /**
     * Prueba que la ruta store crea un nuevo usuario desde el rol 'Medico'.
     *
     * @return void
     */
    public function test_ruta_store_usuario_desde_el_rol_medico()
    {
        $user = User::factory()->create();
        $user->assignRole('Medico');
        $token = $user->createToken('test-token')->plainTextToken;

        $data = [
            'email' => 'uniqueuser' . uniqid('', true) . '@example.com',
            'password' => 'password123',
            'rol' => 'Medico',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/usuarios', $data);
        $response->assertStatus(403);
    }

    /**
     * Prueba que la ruta destroy elimina un usuario desde el rol 'Administrador'.
     *
     * @return void
     */
    public function test_ruta_destroy_usuario_desde_el_rol_administrador()
    {
        $user = User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/usuarios/{$user->id}");
        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Usuario eliminado con éxito']);
    }

    /**
     * Prueba que la ruta destroy elimina un usuario desde el rol 'Paciente'.
     *
     * @return void
     */
    public function test_ruta_destroy_usuario_desde_el_rol_paciente()
    {
        $user = User::factory()->create();
        $user->assignRole('Paciente');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/usuarios/{$user->id}");
        $response->assertStatus(403);
    }

    /**
     * Prueba que la ruta destroy elimina un usuario desde el rol 'Medico'.
     *
     * @return void
     */
    public function test_ruta_destroy_usuario_desde_el_rol_medico()
    {
        $user = User::factory()->create();
        $user->assignRole('Medico');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/usuarios/{$user->id}");
        $response->assertStatus(403);
    }

    /**
     * Comprobar que la ruta update permite actualizar un usuario desde el rol 'Administrador'.
     *
     * @return void
     */
    public function test_ruta_update_usuario_desde_el_rol_administrador()
    {
        $user = User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;
        $data = [
            'email' => 'ejemploemail@correo.es',
            'rol' => 'Administrador',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/usuarios/{$user->id}", $data);
        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Rol actualizado correctamente']);
    }

    /**
     * Comprobar que la ruta update permite actualizar un usuario desde el rol 'Paciente'.
     *
     * @return void
     */
    public function test_ruta_update_usuario_con_el_rol_paciente()
    {
        $user = User::factory()->create();
        $user->assignRole('Paciente');
        $token = $user->createToken('test-token')->plainTextToken;
        $data = [
            'email' => 'ejemploemail@correo.es',
            'rol' => 'Paciente',
        ];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/usuarios/{$user->id}", $data);
        $response->assertStatus(403);
    }

    /**
     * Prueba que la ruta update devuelve 404 si el usuario no existe.
     *
     * @return void
     */
    public function test_ruta_update_no_encontrada()
    {
        $user = User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;
        $data = ['email' => 'user', 'rol' => 'Administrador'];

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->putJson("/api/usuarios/999999999999", $data);
        $response->assertStatus(404);
    }

    /**
     * Prueba que la ruta destroy devuelve 404 si el usuario no existe.
     *
     * @return void
     */
    public function test_destroy_ruta_no_encontrada()
    {
        $user = User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->deleteJson("/api/usuarios/999999");
        $response->assertStatus(404);
    }

    /**
     * Prueba que la ruta show devuelve 404 si el usuario no existe.
     *
     * @return void
     */
    public function test_show_ruta_no_encontrada()
    {
        $user = User::factory()->create();
        $user->assignRole('Administrador');
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson("/api/usuarios/999999");
        $response->assertStatus(404);
    }
}
