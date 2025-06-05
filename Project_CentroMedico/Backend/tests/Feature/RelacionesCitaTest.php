<?php
/**
 * Test para comprobar una Cita completa: paciente, médico, contrato, cliente
 */
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Cita;
use App\Models\Cliente;
use App\Models\User;
use App\Models\Medico;
use App\Models\Contrato;
use App\Models\Paciente;
use PHPUnit\Framework\Attributes\Test;
use Illuminate\Foundation\Testing\WithFaker;
use Database\Seeders\RolesSeeder;

class RelacionesCitaTest extends TestCase
{
    use WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesSeeder::class);
    }

    /**
     * @return void
     */
    #[Test]
    public function una_cita_tiene_todos_los_modelos_asociados()
    {
        $usuarioCliente = User::factory()->create(['email' => $this->faker->unique()->safeEmail]);
        $usuarioCliente->assignRole('Cliente');
        $cliente = Cliente::factory()->create(['id_usuario' => $usuarioCliente->id]);
        $contrato = Contrato::factory()->create(['id_cliente' => $cliente->id]);
        $paciente = Paciente::factory()->create(['id_cliente' => $cliente->id]);
        $medico = Medico::factory()->create();

        $cita = Cita::create([
            'id_paciente' => $paciente->id,
            'id_medico' => $medico->id,
            'id_contrato' => $contrato->id,
            'fecha_hora_cita' => $this->faker->dateTimeBetween('+1 day', '+1 month'),
        ]);

        $cita->load(['paciente', 'medico', 'contrato.cliente']);


        $this->assertNotNull($cita->paciente, 'La cita no tiene paciente asociado.');
        $this->assertNotNull($cita->medico, 'La cita no tiene médico asociado.');
        $this->assertNotNull($cita->contrato, 'La cita no tiene contrato asociado.');
        $this->assertNotNull($cita->contrato->cliente, 'La cita no tiene cliente asociado a través del contrato.');


        $this->assertEquals($paciente->id, $cita->paciente->id, 'El ID del paciente no coincide.');
        $this->assertEquals($medico->id, $cita->medico->id, 'El ID del médico no coincide.');
        $this->assertEquals($contrato->id, $cita->contrato->id, 'El ID del contrato no coincide.');

        $this->assertEquals($cliente->id, $cita->contrato->cliente->id, 'El ID del cliente no coincide.');
    }
}
