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
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_usuario')
                ->constrained('users')
                ->onDelete('cascade');
            $table->foreignId('id_cliente')
                ->constrained('clientes')
                ->onDelete('cascade');
            $table->string('nombre');
            $table->string('apellidos');
            $table->string('dni')->unique();
            $table->date('fecha_nacimiento');
            $table->string('email');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pacientes');
    }
};
