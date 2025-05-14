<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Cliente extends Model
{
    use softDeletes;
    protected $table = 'clientes';
    use HasFactory;

    protected $fillable = [
        'razon_social',
        'cif',
        'direccion',
        'municipio',
        'provincia',
        'id_usuario', 
    ];

    /**
     * Relación con la tabla de Usuarios (un cliente pertenece a un usuario).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    /**
     * Relación con la tabla de Contratos (un cliente puede tener muchos contratos).
     */
    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class, 'id_cliente');
    }

    /**
     * Relación con la tabla de Pacientes (un cliente puede tener muchos pacientes).
     */
    public function pacientes(): HasMany
    {
        return $this->hasMany(Paciente::class, 'id_cliente');
    }

    /**
     * Relación con la tabla de Citas (a través de los contratos).
     */
    public function citas(): HasManyThrough
    {
        return $this->hasManyThrough(Cita::class, Contrato::class, 'id_cliente', 'id_contrato', 'id', 'id');
    }
}