<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ===============================================
    // 1. FUNGSI REGISTRASI (Buat Akun Baru)
    // ===============================================
    public function register(Request $request)
    {
        // Validasi data yang dikirim dari React
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:6'
        ]);

        // Simpan ke database (Password di-enkripsi menggunakan Hash)
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'password' => Hash::make($request->password)
        ]);

        // Cetak Tiket (Token) untuk User ini
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Registrasi Berhasil!',
            'data' => $user,
            'token' => $token
        ]);
    }

    // ===============================================
    // 2. FUNGSI LOGIN (Masuk Akun)
    // ===============================================
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required'
        ]);

        // 👇 PERBAIKAN: Gunakan $request->username, bukan $request->user 👇
        $user = User::where('username', $request->username)->first();

        // Cek apakah username ada DAN apakah password ketikan sama dengan password di database
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Username atau Password salah!'
            ], 401); 
        }

        // Jika lolos, Cetak Tiket (Token)
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Login Berhasil!',
            'data' => $user, // React butuh ini untuk mengambil nama Admin
            'token' => $token
        ]);
    }

    // ===============================================
    // 3. FUNGSI LOGOUT (Keluar Akun & Hapus Tiket)
    // ===============================================
    public function logout(Request $request)
    {
        // Hapus tiket token yang sedang dipakai oleh user ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Anda telah berhasil logout.'
        ]);
    }
}