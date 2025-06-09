<?php
namespace Tests\Feature;

use Tests\TestCase;
use Database\Seeders\RolesSeeder;
use App\Models\{User, Cliente, Contrato, Paciente, Medico, Cita};
use Carbon\Carbon;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\WithFaker;

/**
 * Class CitaIntegracionTest
 *
 * Pruebas de integración para la entidad Cita en la API.
 */
class CitaIntegracionTest extends TestCase
{
    use WithFaker;

    /**
     * Configuración inicial para las pruebas.
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    /**
     * Prueba para crear una cita relacionada correctamente con paciente, médico y contrato.
     *
     * @return void
     */
    #[Test]
    public function test_crear_cita_relacionada_correctamente()
    {
        //Crear un usuario
        $userCliente = User::factory()->create(['email' => $this->faker->unique()->safeEmail]);
        $userCliente->assignRole('Cliente');
        $cliente = Cliente::factory()->create(['id_usuario' => $userCliente->id]);
        //Crear un contrato asociado al cliente
        $contrato = Contrato::factory()->create(['id_cliente' => $cliente->id]);

        //Crear paciente y médico (el paciente debe pertenecer al cliente)
        $paciente = Paciente::factory()->create(['id_cliente' => $cliente->id]);
        $medico = Medico::factory()->create();

        //Crear la cita, vinculándola al paciente, médico y contrato
        $cita = Cita::create([
            'id_paciente' => $paciente->id,
            'id_medico' => $medico->id,
            'id_contrato' => $contrato->id,
            'fecha_hora_cita' => Carbon::now()->addDays(1),
        ]);

        //Se verifica que exista en la base de datos
        $this->assertDatabaseHas('citas', [
            'id' => $cita->id,
            'id_paciente' => $paciente->id,
            'id_medico' => $medico->id,
            'id_contrato' => $contrato->id,
        ]);

        //Las aserciones para las relaciones deben ser correctas
        $this->assertEquals($paciente->id, $cita->paciente->id);
        $this->assertEquals($medico->id, $cita->medico->id);
        $this->assertEquals($contrato->id, $cita->contrato->id);


        //Para verificar la relación indirecta con el cliente
        //Esto ahora debería funcionar porque $cita->cliente() es HasOneThrough
        $this->assertNotNull($cita->cliente);
        $this->assertNotNull($contrato);
        $this->assertNotNull($cliente);
        $this->assertEquals($cliente->id, $contrato->id_cliente);
    }
}
