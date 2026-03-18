<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'nama_pemesan',
        'lapangan_id',
        'tanggal_main',
        'jam_mulai',
        'jam_selesai',
        'total_harga',
        'status_pembayaran',
        'order_id_midtrans',
        'snap_token'
    ];
}
