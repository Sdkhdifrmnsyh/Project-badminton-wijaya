<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Lapangan; // <-- Tambahkan baris ini supaya Controller kenal dengan Model Lapangan

class LapanganController extends Controller
{
    // Fungsi untuk mengambil semua data lapangan
    public function index()

    {
        $lapangans = Lapangan::all(); // Mengambil semua isi tabel lapangans

        // Mengirimkannya dalam bentuk format JSON (Format standar API)
        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Berhasil mengambil data lapangan',
            'data' => $lapangans
        ]);
    }
    // Fungsi untuk Admin menambah data lapangan baru
    public function store(Request $request)
    {
        // 1. Validasi Keamanan: Pastikan data yang dikirim tidak kosong dan formatnya benar
        $request->validate([
            'nama_lapangan' => 'required|string',
            'jenis_lantai' => 'required|in:Vinyl,Sintetis,Semen',
            'harga_per_jam' => 'required|integer',
        ]);

        // 2. Simpan data ke dalam database
        $lapangan = Lapangan::create([
            'nama_lapangan' => $request->nama_lapangan,
            'jenis_lantai' => $request->jenis_lantai,
            'harga_per_jam' => $request->harga_per_jam,
        ]);

        // 3. Kembalikan struk/pesan sukses ke Frontend (React)
        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Berhasil menambahkan lapangan baru!',
            'data' => $lapangan
        ], 201); // 201 adalah kode standar internet untuk "Data berhasil diciptakan"
    }
}
