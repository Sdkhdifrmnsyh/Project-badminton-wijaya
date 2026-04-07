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

    public function active() {
        $hariIni = date('Y-m-d');

        $promos = \App\Models\Promo::where('is_active', 1) 
                       ->whereDate('tgl_mulai', '<=', $hariIni) 
                       ->where(function($query) use ($hariIni) {
                           $query->whereDate('tgl_selesai', '>=', $hariIni)
                                 ->orWhereNull('tgl_selesai'); 
                       })
                       ->get();

        return response()->json(['data' => $promos]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_promo' => 'nullable|string',
            'tgl_mulai' => 'required|date',
            'tgl_selesai' => 'nullable|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'minimal_jam_main' => 'required|integer',
            'harga_promo' => 'required|numeric',
            'hari_spesifik' => 'nullable|string',
            'kecualikan_libur' => 'required|boolean',
            'hari_berlaku' => 'nullable|string',
            'tampilkan_tgl' => 'required|boolean',
            'tampilkan_min_jam' => 'required|boolean'
        ]);

        $promo = Promo::create([
            'nama_promo' => $request->nama_promo,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
            'minimal_jam_main' => $request->minimal_jam_main,
            'harga_promo' => $request->harga_promo,
            'is_active' => true,
            'hari_spesifik' => $request->hari_spesifik,
            'kecualikan_libur' => $request->kecualikan_libur,
            'hari_berlaku' => $request->hari_berlaku,
            'tampilkan_tgl' => $request->tampilkan_tgl,
            'tampilkan_min_jam' => $request->tampilkan_min_jam
        ]);

        return response()->json(['pesan' => 'Promo berhasil ditambahkan', 'data' => $promo]);
    }

   public function update(Request $request, $id)
    {
        $promo = Promo::findOrFail($id);

        // Jika request hanya mengirimkan 'is_active' (Toggle On/Off)
        if ($request->has('is_active') && count($request->all()) == 1) {
            $promo->update(['is_active' => $request->is_active]);
            return response()->json(['pesan' => 'Status promo diperbarui']);
        }

        // Jika request mengirimkan seluruh data form edit
        $promo->update([
            'nama_promo' => $request->nama_promo,
            'tgl_mulai' => $request->tgl_mulai,
            'tgl_selesai' => $request->tgl_selesai,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
            'minimal_jam_main' => $request->minimal_jam_main,
            'hari_spesifik' => $request->hari_spesifik,
            'kecualikan_libur' => $request->kecualikan_libur,
            'harga_promo' => $request->harga_promo,
            'hari_berlaku' => $request->hari_berlaku,
            'tampilkan_tgl' => $request->tampilkan_tgl,
            'tampilkan_min_jam' => $request->tampilkan_min_jam
        ]);

        return response()->json(['pesan' => 'Promo berhasil diperbarui', 'data' => $promo]);
    }

    // 5. Hapus promo (Saat Admin klik tombol sampah)
    public function destroy($id)
    {
        Promo::destroy($id);
        return response()->json(['message' => 'Promo berhasil dihapus!']);
    }

    // FUNGSI UNTUK MENGECEK APAKAH PROMO BERLAKU DI TANGGAL TERTENTU
    public function cekPromoBerlaku($promo, $tanggal_main) {
        $hari_angka = date('N', strtotime($tanggal_main)); // 1 = Senin, 7 = Minggu

        // 1. CEK HARI SPESIFIK (Mengecek Senin - Kamis)
        if (!empty($promo->hari_spesifik)) {
            $hari_berlaku = explode(',', $promo->hari_spesifik);
            if (!in_array($hari_angka, $hari_berlaku)) {
                return false; // Otomatis batal jika bukan hari yang diizinkan (misal Jumat/Sabtu/Minggu)
            }
        }

        // 2. CEK TANGGAL MERAH / CUTI BERSAMA (Hanya data Senin - Kamis tahun 2026)
        if ($promo->kecualikan_libur == 1) {
            $tanggal_merah_seninkamis = [
                '2026-01-01', // (Kamis) Tahun Baru Masehi
                '2026-02-16', // (Senin) Cuti Bersama Imlek
                '2026-02-17', // (Selasa) Tahun Baru Imlek
                '2026-03-18', // (Rabu) Cuti Bersama Nyepi
                '2026-03-19', // (Kamis) Hari Suci Nyepi
                '2026-03-23', // (Senin) Cuti Bersama Idul Fitri
                '2026-03-24', // (Selasa) Cuti Bersama Idul Fitri
                '2026-05-14', // (Kamis) Kenaikan Yesus Kristus
                '2026-05-27', // (Rabu) Idul Adha
                '2026-05-28', // (Kamis) Cuti Bersama Idul Adha
                '2026-06-01', // (Senin) Hari Lahir Pancasila
                '2026-06-16', // (Selasa) Tahun Baru Islam
                '2026-08-17', // (Senin) Hari Kemerdekaan RI
                '2026-08-25', // (Selasa) Maulid Nabi Muhammad SAW
                '2026-12-24', // (Kamis) Cuti Bersama Natal
            ];

            // Jika pelanggan mem-booking di salah satu tanggal di atas
            if (in_array($tanggal_main, $tanggal_merah_seninkamis)) {
                return false; // Promo batal otomatis karena itu tanggal merah!
            }
        }

        return true; // Lolos semua seleksi, promo berhak digunakan!
    }
}