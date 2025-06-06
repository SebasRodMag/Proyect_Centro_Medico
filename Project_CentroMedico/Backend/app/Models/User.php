<?php

namespace App\Models;

//use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasRoles;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'password',

    ];

    protected $guard_name = 'sanctum'; 

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Relación con la tabla de Clientes (un usuario puede tener un cliente si es de rol 'cliente').
     */
    public function cliente()
    {
        return $this->hasOne(Cliente::class, 'id_usuario');
    }

    /**
     * Relación con la tabla de Médicos (un usuario puede tener un médico si es de rol 'medico').
     */
    public function medico()
    {
        return $this->hasOne(Medico::class, 'id_usuario');
    }

    public function paciente() {
        return $this->hasOne(Paciente::class, 'id_usuario');
    }

    public static function idsByRole(string $role): array
    {
        return User::role($role)->pluck('id')->toArray();
    }
}