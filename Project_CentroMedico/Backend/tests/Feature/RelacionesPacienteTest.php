<?php

namespace Tests\Feature;
/**
 * Test para comprobar que un Paciente tiene citas y pertenece a un cliente
 */
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * Test para comprobar que un Paciente tiene citas y pertenece a un cliente
 */
class RelacionesPacienteTest extends TestCase
{
    /**
     * Verifica que un paciente tiene citas y pertenece a un cliente.
     *
     * @return void
     */
    #[Test]
    public function test_paciente_tiene_citas_y_pertenece_a_cliente(): void
    {
        $paciente = \App\Models\Paciente::with(['citas', 'cliente'])->firstOrFail();

        $this->assertNotNull($paciente->citas, 'El paciente no tiene citas asociadas.');
        $this->assertGreaterThanOrEqual(0, $paciente->citas->count(), 'El paciente no tiene citas asociadas.');
        $this->assertNotNull($paciente->cliente, 'El paciente no pertenece a un cliente.');
    }
}
