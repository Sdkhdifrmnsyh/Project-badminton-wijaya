<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lapangan extends Model
{
    // Mengizinkan Laravel untuk mengisi kolom-kolom ini
    protected $fillable = [
        'nama_lapangan',
        'jenis_lantai',
        'harga_per_jam',
        'foto_lapangan'
    ];
}