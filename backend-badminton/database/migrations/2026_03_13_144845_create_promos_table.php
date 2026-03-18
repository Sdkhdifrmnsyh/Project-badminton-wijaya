<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('promos', function (Blueprint $table) {
            $table->id();
            $table->string('nama_promo'); // Contoh: "Promo Ramadhan 1 Jam"
            $table->date('tgl_mulai');    // Contoh: 2026-02-19
            $table->date('tgl_selesai');  // Contoh: 2026-03-18
            $table->time('jam_mulai');    // Contoh: 07:00:00
            $table->time('jam_selesai');  // Contoh: 17:00:00
            $table->integer('minimal_jam_main')->default(1); // Contoh: 1 atau 2
            $table->integer('harga_promo'); // Contoh: 25000 atau 20000
            $table->boolean('is_active')->default(true); // Tombol on/off promo
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promos');
    }
};
