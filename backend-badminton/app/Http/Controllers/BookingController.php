<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Lapangan;
use App\Models\User; 
use Carbon\Carbon;

class BookingController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validasi Data (Tambahkan validasi total_harga)
        $request->validate([
            'user_id' => 'nullable|integer',
            'nama_pemesan' => 'required|string|max:255',
            'lapangan_id' => 'required|exists:lapangans,id',
            'tanggal_main' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'total_harga' => 'required|numeric', // <-- KITA WAJIBKAN TERIMA TOTAL HARGA DARI REACT
        ]);

        // 2. AMBIL HARGA DARI REACT (Harga Promo)
        // Kita tidak lagi menghitung manual pakai harga_per_jam, kita percaya sama hitungan React
        $total_harga_asli = $request->total_harga;

        // 3. LOGIKA DP
        $opsi_bayar = $request->opsi_bayar;
        $tagihan_midtrans = ($opsi_bayar == 'dp') ? ($total_harga_asli / 2) : $total_harga_asli;

        // 4. Siapkan Midtrans
        \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        \Midtrans\Config::$isProduction = false;
        \Midtrans\Config::$isSanitized = true;
        \Midtrans\Config::$is3ds = true;

        $order_id = 'BOOK-' . time();

        $params = array(
            'transaction_details' => array(
                'order_id' => $order_id,
                'gross_amount' => $tagihan_midtrans, 
            ),
            'customer_details' => array(
                'first_name' => $request->nama_pemesan,
            )
        );

        $snapToken = \Midtrans\Snap::getSnapToken($params);

        // 5. Simpan ke Database (TANPA KOLOM SNAP_TOKEN AGAR TIDAK ERROR)
        $status_awal = ($opsi_bayar == 'dp') ? 'Pending DP' : 'Pending Lunas';

        $booking = \App\Models\Booking::create([
            'user_id' => $request->user_id,
            'nama_pemesan' => $request->nama_pemesan,
            'no_wa' => $request->no_wa,
            'lapangan_id' => $request->lapangan_id,
            'tanggal_main' => $request->tanggal_main,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
            'total_harga' => $total_harga_asli, 
            'status_pembayaran' => $status_awal,
        ]);

        // 6. Kirim data dan token ke React
        return response()->json([
            'status' => 'sukses',
            'data' => [
                'id' => $booking->id,
                'snap_token' => $snapToken 
            ]
        ]);
    }
    
    // Fungsi Khusus Admin/Kasir untuk Pelunasan Cash di GOR
    public function pelunasan($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Data booking tidak ditemukan!'
            ], 404);
        }

        $booking->update([
            'status_pembayaran' => 'lunas'
        ]);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Sisa pembayaran cash diterima, status menjadi Lunas!',
            'data' => $booking
        ]);
    }

    // Fungsi untuk mengecek jam berapa saja yang sudah dibooking
    public function cekJadwal(Request $request)
    {
        $lapangan_id = $request->query('lapangan_id');
        $tanggal_main = $request->query('tanggal_main');

        if (!$lapangan_id || !$tanggal_main) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Parameter lapangan_id dan tanggal_main wajib diisi!'
            ], 400);
        }

        $bookings = \App\Models\Booking::where('lapangan_id', $lapangan_id)
            ->where('tanggal_main', $tanggal_main)
            ->whereIn('status_pembayaran', [
                'Pending DP', 
                'Pending Lunas', 
                'DP', 
                'Lunas'
            ])
            ->get();

        $jamPenuh = [];

        foreach ($bookings as $booking) {
            $jamMulai = (int) explode(':', $booking->jam_mulai)[0];
            $jamSelesai = (int) explode(':', $booking->jam_selesai)[0];

            for ($i = $jamMulai; $i < $jamSelesai; $i++) {
            $formatJam = ($i < 10 ? '0' : '') . $i . ':00';
            $jamPenuh[] = $formatJam;
        }
        }

        return response()->json([
            'status' => 'sukses',
            'data' => $jamPenuh
        ]);
    }

    // FUNGSI KHUSUS ADMIN: Mengambil semua data pesanan (TANPA PENDING)
    public function getAllBookings()
    {
        $bookings = \App\Models\Booking::join('lapangans', 'bookings.lapangan_id', '=', 'lapangans.id')
            ->select('bookings.*', 'lapangans.nama_lapangan')
            // 👇 INI GEMBOKNYA: Jangan ambil yang statusnya mengandung kata 'Pending' 👇
            ->where('bookings.status_pembayaran', 'not like', '%Pending%')
            ->orderBy('bookings.created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'sukses',
            'data' => $bookings
        ]);
    }

    // Fungsi untuk mengubah status pesanan setelah sukses bayar di QRIS
    public function paymentSuccess($id)
    {
        $booking = \App\Models\Booking::find($id);
        
        if($booking) {
            if($booking->status_pembayaran == 'Pending DP') {
                $booking->status_pembayaran = 'DP';
            } else {
                $booking->status_pembayaran = 'Lunas';
            }
            $booking->save();

            return response()->json(['status' => 'sukses']);
        }
    }

    // FUNGSI KHUSUS ADMIN: Memindahkan Jadwal (Reschedule)
    public function rescheduleBooking(Request $request, $id)
    {
        $request->validate([
            'tanggal_main' => 'required',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
        ]);

        $booking = \App\Models\Booking::find($id);
        
        if (!$booking) {
            return response()->json(['status' => 'gagal', 'pesan' => 'Pesanan tidak ditemukan'], 404);
        }

        $booking->tanggal_main = $request->tanggal_main;
        $booking->jam_mulai = $request->jam_mulai;
        $booking->jam_selesai = $request->jam_selesai;
        $booking->save(); 

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Jadwal berhasil dipindahkan!'
        ]);
    }
    
    // ==========================================================
    // FUNGSI SAKLAR GOR (BUKA / TUTUP + TANGGAL OTOMATIS)
    // ==========================================================
    public function cekStatusGor() 
    {
        date_default_timezone_set('Asia/Jakarta');

        $status = \Illuminate\Support\Facades\DB::table('settings')->where('nama_pengaturan', 'status_gor')->first();
        $pesan = \Illuminate\Support\Facades\DB::table('settings')->where('nama_pengaturan', 'pesan_tutup_gor')->first();
        $tgl_mulai = \Illuminate\Support\Facades\DB::table('settings')->where('nama_pengaturan', 'tgl_tutup_mulai')->first();
        $tgl_sampai = \Illuminate\Support\Facades\DB::table('settings')->where('nama_pengaturan', 'tgl_tutup_sampai')->first();
        
        if(!$status) {
            \Illuminate\Support\Facades\DB::table('settings')->insert([
                ['nama_pengaturan' => 'status_gor', 'nilai' => 'buka'],
                ['nama_pengaturan' => 'pesan_tutup_gor', 'nilai' => ''],
                ['nama_pengaturan' => 'tgl_tutup_mulai', 'nilai' => ''],
                ['nama_pengaturan' => 'tgl_tutup_sampai', 'nilai' => '']
            ]);
            return response()->json(['status' => 'buka', 'status_db' => 'buka', 'status_actual' => 'buka', 'pesan' => '', 'tgl_mulai' => '', 'tgl_sampai' => '']);
        }

        $status_val = $status->nilai;
        $tgl_mulai_val = $tgl_mulai ? trim($tgl_mulai->nilai) : '';
        $tgl_sampai_val = $tgl_sampai ? trim($tgl_sampai->nilai) : '';
        
        $status_actual = 'buka'; 

        if ($status_val === 'tutup') {
            $today_time = strtotime(date('Y-m-d')); 
            
            if ($tgl_mulai_val) {
                $mulai_time = strtotime($tgl_mulai_val);
                
                if ($today_time >= $mulai_time) {
                    if ($tgl_sampai_val) {
                        $sampai_time = strtotime($tgl_sampai_val);
                        if ($today_time > $sampai_time) {
                            $status_actual = 'buka'; 
                        } else {
                            $status_actual = 'tutup'; 
                        }
                    } else {
                        $status_actual = 'tutup'; 
                    }
                } else {
                    $status_actual = 'buka'; 
                }
            } else {
                $status_actual = 'tutup'; 
            }
        }

        return response()->json([
            'status' => $status_val,
            'status_db' => $status_val, 
            'status_actual' => $status_actual, 
            'pesan' => $pesan ? $pesan->nilai : '',
            'tgl_mulai' => $tgl_mulai_val,
            'tgl_sampai' => $tgl_sampai_val
        ]);
    }

    public function ubahStatusGor(Request $request) 
    {
        $status_baru = $request->status; 
        
        \Illuminate\Support\Facades\DB::table('settings')
            ->where('nama_pengaturan', 'status_gor')
            ->update(['nilai' => $status_baru]);

        if($status_baru === 'tutup') {
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(['nama_pengaturan' => 'pesan_tutup_gor'], ['nilai' => $request->pesan ?? '']);
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(['nama_pengaturan' => 'tgl_tutup_mulai'], ['nilai' => $request->tgl_mulai ?? '']);
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(['nama_pengaturan' => 'tgl_tutup_sampai'], ['nilai' => $request->tgl_sampai ?? '']);
        } else {
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(['nama_pengaturan' => 'pesan_tutup_gor'], ['nilai' => '']);
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(['nama_pengaturan' => 'tgl_tutup_mulai'], ['nilai' => '']);
            \Illuminate\Support\Facades\DB::table('settings')->updateOrInsert(['nama_pengaturan' => 'tgl_tutup_sampai'], ['nilai' => '']);
        }

        return response()->json([
            'pesan' => 'GOR berhasil diubah menjadi: ' . strtoupper($status_baru)
        ]);
    }

    // FUNGSI KHUSUS ADMIN: Pelunasan Manual di GOR
    public function pelunasanManual($id)
    {
        $booking = \App\Models\Booking::find($id);
        if ($booking) {
            $booking->status_pembayaran = 'Lunas';
            $booking->save();

            return response()->json(['status' => 'sukses', 'pesan' => 'Pembayaran telah dilunasi!']);
        }
        return response()->json(['status' => 'gagal', 'pesan' => 'Data tidak ditemukan'], 404);
    }

    // FUNGSI KHUSUS ADMIN: Membatalkan Pesanan (Tanpa Menghapus Data)
    public function batalkanPesanan($id)
    {
        $booking = \App\Models\Booking::find($id);

        if ($booking) {
            $booking->status_pembayaran = 'Batal';
            $booking->save(); 

            return response()->json([
                'status' => 'sukses', 
                'pesan' => 'Pesanan dibatalkan! Jadwal kembali kosong dan nominal ditarik dari pendapatan.'
            ]);
        }

        return response()->json(['status' => 'gagal', 'pesan' => 'Data tidak ditemukan'], 404);
    }

    // FUNGSI KHUSUS: Menghapus pesanan jika pelanggan menutup pop-up Midtrans (Batal Bayar)
    public function hapusBatalBayar($id)
    {
        $booking = \App\Models\Booking::find($id);
        if ($booking) {
            $booking->delete(); // Hapus datanya secara permanen agar tidak nyampah di Admin
            return response()->json(['status' => 'sukses', 'pesan' => 'Pesanan dihapus karena batal bayar']);
        }
        return response()->json(['status' => 'gagal', 'pesan' => 'Data tidak ditemukan'], 404);
    }

    // FUNGSI KHUSUS ADMIN: Booking Manual tanpa Midtrans (Jalur VIP)
    public function storeManualAdmin(Request $request)
    {
        $request->validate([
            'nama_pemesan' => 'required|string|max:255',
            'lapangan_id' => 'required|exists:lapangans,id',
            'tanggal_main' => 'required|date',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'total_harga' => 'required|numeric',
            'status_pembayaran' => 'required' // DP atau Lunas
        ]);

        $booking = \App\Models\Booking::create([
            'user_id' => null, // Admin yang pesenin
            'nama_pemesan' => $request->nama_pemesan . ' (Via Admin)',
            'no_wa' => $request->no_wa,
            'lapangan_id' => $request->lapangan_id,
            'tanggal_main' => $request->tanggal_main,
            'jam_mulai' => $request->jam_mulai,
            'jam_selesai' => $request->jam_selesai,
            'total_harga' => $request->total_harga, 
            'status_pembayaran' => $request->status_pembayaran, // Langsung jadi DP/Lunas tanpa pending
        ]);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Booking manual berhasil ditambahkan!'
        ]);
    }
}