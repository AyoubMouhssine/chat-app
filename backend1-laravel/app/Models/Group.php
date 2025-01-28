<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Group extends Model
{

    protected $fillable = [
        'name',
        'description',
    ];
    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withDefault(['role' => 'member']);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by'); 
    }
}
