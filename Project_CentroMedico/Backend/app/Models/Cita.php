<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cita extends Model
{
    use SoftDeletes;
    protected $table = 'citas';
    use HasFactory;

    protected $fillable = [
        'id_paciente',
        'id_medico',
        'id_contrato',
        'fecha_hora_cita',
        // 'hora_fecha_inicio',
        // 'hora_fecha_fin',
    ];

    /**
     * Relación con la tabla de Pacientes (una cita pertenece a un paciente).
     */
    public function paciente(): BelongsTo
    {
        return $this->belongsTo(Paciente::class, 'id_paciente');
    }

    /**
     * Relación con la tabla de Médicos (una cita pertenece a un médico).
     */
    public function medico(): BelongsTo
    {
        return $this->belongsTo(Medico::class, 'id_medico');
    }

    /**
     * Relación con la tabla de Contratos (una cita pertenece a un contrato).
     */
    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class, 'id_contrato');
    }
}