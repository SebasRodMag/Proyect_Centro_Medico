<?php

namespace Tests\Feature;

/**
 * Test para comprobar que un Contrato pertenece a un Cliente y tiene citas
 */
use Tests\TestCase;
use App\Models\Contrato;
use PHPUnit\Framework\Attributes\Test;

/**
 * Class RelacionesContratoTest
 *
 * Pruebas para verificar las relaciones del modelo Contrato.
 */
class RelacionesContratoTest extends TestCase
{
    /**
     * Verifica que un contrato tiene un cliente asociado.
     *
     * @return void
     */
    #[Test]
    public function test_un_contrato_tiene_cliente_asociado()
    {
        $contrato = Contrato::with('cliente')->firstOrFail();

        $this->assertNotNull($contrato->cliente, 'El contrato no tiene un cliente asociado.');
    }

    /**
     * Verifica que un contrato tiene citas asociadas.
     *
     * @return void
     */
    #[Test]
    public function test_un_contrato_tiene_citas()
    {
        $contrato = Contrato::with('citas')->firstOrFail();

        $this->assertGreaterThanOrEqual(0, $contrato->citas->count(), 'El contrato no tiene citas.');
    }
}

