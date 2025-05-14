<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Paciente extends Model
{
    use SoftDeletes;
    protected $table = 'pacientes';
    use HasFactory;

    protected $fillable = [
        'id',
        'id_cliente',
        'nombre',
        'apellidos',
        'dni',
        'fecha_nacimiento',
        'email',
    ];

    /**
     * Relación con la tabla de Clientes (un paciente pertenece a un cliente).
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    /**
     * Relación con la tabla de Citas (un paciente puede tener muchas citas).
     */
    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class, 'id_paciente');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}