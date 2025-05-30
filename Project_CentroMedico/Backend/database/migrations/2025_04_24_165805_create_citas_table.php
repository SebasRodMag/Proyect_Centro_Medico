<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_paciente')
                ->constrained('pacientes')
                ->onDelete('cascade');
            $table->foreignId('id_medico')
                ->constrained('medicos')
                ->onDelete('cascade');
            $table->foreignId('id_contrato')
                ->constrained('contratos')
                ->onDelete('cascade');
            $table->datetime('fecha_hora_cita');
            $table->enum('estado', ['pendiente', 'realizado', 'cancelado'])
            ->default('pendiente');
            $table->string('observaciones')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citas');
    }
};
