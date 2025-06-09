<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Cliente;
use PHPUnit\Framework\Attributes\Test;

/**
 *  Test para comprobar las relaciones del modelo Cliente
 *
 * Class RelacionesClientesTest
 *
 * Pruebas para verificar las relaciones del modelo Cliente.
 */
class RelacionesClientesTest extends TestCase
{
    /**
     * Verifica que un cliente tiene un usuario asociado.
     *
     * @return void
     */
    #[Test]
    public function un_cliente_tiene_usuario_asociado()
    {
        $cliente = Cliente::with('user')->firstOrFail();

        $this->assertNotNull($cliente->user, 'El cliente no tiene un usuario asociado.');
    }

    /**
     * Verifica que un cliente tiene pacientes asociados.
     *
     * @return void
     */
    #[Test]
    public function test_un_cliente_tiene_pacientes()
    {
        $cliente = Cliente::with('pacientes')->firstOrFail();

        $this->assertGreaterThan(0, $cliente->pacientes->count(), 'El cliente no tiene pacientes asociados.');
    }

    /**
     * Verifica que un cliente tiene contratos asociados.
     *
     * @return void
     */
    #[Test]
    public function test_un_cliente_tiene_contratos()
    {
        $cliente = Cliente::with('contratos')->firstOrFail();

        $this->assertGreaterThan(0, $cliente->contratos->count(), 'El cliente no tiene contratos asociados.');
    }
}
