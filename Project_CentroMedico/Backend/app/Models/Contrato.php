<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contrato extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_cliente',
        'fecha_inicio',
        'fecha_fin',
        'numero_reconocimientos',
        'autorenovacion',
    ];

    /**
     * Relación con la tabla de Clientes (un contrato pertenece a un cliente).
     */
    public function cliente(): BelongsTo
    {
        return $this->belongsTo(Cliente::class, 'id_cliente');
    }

    /**
     * Relación con la tabla de Citas (un contrato puede tener muchas citas).
     */
    public function citas(): HasMany
    {
        return $this->hasMany(Cita::class, 'id_contrato');
    }
}