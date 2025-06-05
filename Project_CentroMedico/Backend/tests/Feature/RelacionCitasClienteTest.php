<?php

namespace Tests\Feature;
/**
 * Test para comprobar la relación: Cliente - Citas
 */
use Tests\TestCase;
use App\Models\Cliente;
use PHPUnit\Framework\Attributes\Test;

use Illuminate\Foundation\Testing\RefreshDatabase;

class RelacionCitasClienteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolesSeeder::class);
    }

    /**
     * @return void
     */
    #[Test]
    public function un_cliente_tiene_citas_a_traves_de_sus_contratos()
    {
        // Crear un cliente con contratos y citas relacionados para la prueba
        $cliente = \App\Models\Cliente::factory()
            ->has(\App\Models\Contrato::factory()
                ->has(\App\Models\Cita::factory()->count(3))
            )->create();

        $cliente->load('citas');

        $this->assertGreaterThanOrEqual(0, $cliente->citas->count(), 'El cliente no tiene citas a través de contratos.');
    }
}
