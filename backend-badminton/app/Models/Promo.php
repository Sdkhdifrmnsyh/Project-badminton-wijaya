<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promo extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_promo',
        'tgl_mulai',
        'tgl_selesai',
        'jam_mulai',
        'jam_selesai',
        'minimal_jam_main',
        'harga_promo',
        'is_active',
        'hari_spesifik',
        'kecualikan_libur',
        'hari_berlaku',
        'tampilkan_tgl',
        'tampilkan_min_jam'
    ];
}