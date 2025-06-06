<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Cita extends Model
{
    use SoftDeletes;
    protected $table = 'citas';
    use HasFactory;

    protected $fillable = [
        'id',
        'id_paciente',
        'id_medico',
        'id_contrato',
        'fecha_hora_cita',
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

    public function getClienteAttribute()
    {
        return $this->contrato ? $this->contrato->cliente : null;
    }
}