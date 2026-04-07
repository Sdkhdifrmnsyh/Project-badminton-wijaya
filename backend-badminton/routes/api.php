<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

use App\Http\Controllers\LapanganController;
use App\Http\Controllers\BookingController;

// Rute untuk mengambil data (GET)
Route::get('/lapangan', [LapanganController::class, 'index']);

// Rute untuk menambah data (POST) - BARU!
Route::post('/lapangan', [LapanganController::class, 'store']);

// Rute untuk membuat transaksi baru
Route::post('/booking', [BookingController::class, 'store']);

// Rute Khusus Admin: Pelunasan Booking (Gunakan PUT karena ini mengubah data)
Route::put('/booking/pelunasan/{id}', [BookingController::class, 'pelunasan']);

// Rute untuk mengecek jadwal yang penuh
Route::get('/booking/cek-jadwal', [BookingController::class, 'cekJadwal']); 

// Rute Khusus Admin
Route::get('/admin/bookings', [BookingController::class, 'getAllBookings']);

// Rute untuk mengubah status jadi lunas/dp setelah sukses bayar
Route::put('/booking/sukses/{id}', [BookingController::class, 'paymentSuccess']);

// Rute Khusus Admin: Reschedule Jadwal
Route::put('/admin/booking/reschedule/{id}', [BookingController::class, 'rescheduleBooking']);

// Rute untuk mengecek dan mengubah status GOR
Route::get('/gor/status', [BookingController::class, 'cekStatusGor']);
Route::put('/admin/gor/status', [BookingController::class, 'ubahStatusGor']);

// Rute Pelunasan Manual oleh Admin
Route::put('/admin/booking/pelunasan/{id}', [BookingController::class, 'pelunasanManual']);

// Rute untuk Membatalkan Pesanan
Route::delete('/admin/booking/batal/{id}', [BookingController::class, 'batalkanPesanan']);

// ========================================================
// RUTE AUTHENTICATION (PINTU GERBANG)
// ========================================================

// Rute Umum (Bisa diakses siapa saja tanpa tiket)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rute Terlindungi (Wajib bawa Tiket Token yang sah!)
Route::middleware('auth:sanctum')->group(function () {
    
    // Rute Logout hanya bisa diakses kalau dia sudah login
    Route::post('/logout', [AuthController::class, 'logout']);

    // Nanti, semua Rute Admin (seperti ambil data pesanan, tutup GOR, dll)
    // akan kita pindahkan ke dalam blok ini agar aman dari Hacker!
});

use App\Http\Controllers\PromoController;

// --- JALUR PIPA UNTUK PROMO ---
// Ini untuk Customer (Bebas tanpa login)
Route::get('/promos/active', [PromoController::class, 'active']);

// Ini untuk Admin
Route::get('/promos', [PromoController::class, 'index']);
Route::post('/promos', [PromoController::class, 'store']);
Route::put('/promos/{id}', [PromoController::class, 'update']);
Route::delete('/promos/{id}', [PromoController::class, 'destroy']);

Route::delete('/booking/batal-bayar/{id}', [\App\Http\Controllers\BookingController::class, 'hapusBatalBayar']);

Route::post('/admin/booking/manual', [BookingController::class, 'storeManualAdmin']);