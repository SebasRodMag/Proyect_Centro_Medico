<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medico extends Model
{
    use SoftDeletes;
    protected $table = 'medicos';
    use HasFactory;

    protected $fillable = [
        'id',
        'nombre',
        'apellidos',
        'dni',
        'fecha_inicio',
        'fecha_fin',
        'id_usuario',
    ];

    /**
     * Relación con la tabla de Usuarios (un médico pertenece a un usuario).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    /**
     * Relación con la tabla de Citas (un médico puede tener muchas citas).
     */
    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class, 'id_medico');
    }
}