<?php

namespace App\Http\Controllers;

use App\Models\Promo;
use Illuminate\Http\Request;

class PromoController extends Controller
{
    // 1. Ambil SEMUA promo (Untuk ditampilkan di tabel Admin)
    public function index()
    {
        $promos = Promo::orderBy('id', 'desc')->get();
        return response()->json(['data' => $promos]);
    }

    // 2. Ambil promo yang AKTIF HARI INI saja (Untuk dihitung di halaman Customer)
    public function active()
    {
        $hariIni = date('Y-m-d');
        
        $promos = Promo::where('is_active', true)
                       ->where('tgl_mulai', '<=', $hariIni)
                       ->where('tgl_selesai', '>=', $hariIni)
                       ->get();
                       
        return response()->json(['data' => $promos]);
    }

    // 3. Simpan promo baru (Saat Admin klik tombol "Simpan")
    public function store(Request $request)
    {
        $request->validate([
            'nama_promo' => 'required',
            'tgl_mulai' => 'required|date',
            'tgl_selesai' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'minimal_jam_main' => 'required|integer',
            'harga_promo' => 'required|integer'
        ]);

        $promo = Promo::create($request->all());
        return response()->json(['message' => 'Promo berhasil ditambahkan!', 'data' => $promo]);
    }

    // 4. Update promo (Bisa untuk edit data, atau tombol On/Off promo)
    public function update(Request $request, $id)
    {
        $promo = Promo::findOrFail($id);
        $promo->update($request->all());
        return response()->json(['message' => 'Promo berhasil diupdate!', 'data' => $promo]);
    }

    // 5. Hapus promo (Saat Admin klik tombol sampah)
    public function destroy($id)
    {
        Promo::destroy($id);
        return response()->json(['message' => 'Promo berhasil dihapus!']);
    }
}