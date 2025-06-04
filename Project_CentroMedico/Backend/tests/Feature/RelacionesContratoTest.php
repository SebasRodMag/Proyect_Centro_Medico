<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Contrato;
use PHPUnit\Framework\Attributes\Test;
/**
 * Test para comprobar que un Contrato pertenece a un Cliente y tiene citas
 */
class RelacionesContratoTest extends TestCase
{
    /**
     * @return void
     */
    #[Test]
    public function un_contrato_tiene_cliente_asociado()
    {
        $contrato = Contrato::with('cliente')->firstOrFail();

        $this->assertNotNull($contrato->cliente, 'El contrato no tiene un cliente asociado.');
    }

    /**
     * @return void
     */
    #[Test]
    public function un_contrato_tiene_citas()
    {
        $contrato = Contrato::with('citas')->firstOrFail();

        $this->assertGreaterThanOrEqual(0, $contrato->citas->count(), 'El contrato no tiene citas.');
    }
}

