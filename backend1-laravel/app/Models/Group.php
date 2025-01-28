<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{

    protected $fillable = [
        'name',
        'description',
        'created_by'
    ];
    
    public function users()
    {
        return $this->belongsToMany(User::class, 'group_user', 'group_id', 'user_id')->withPivot('role'); 
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

}
