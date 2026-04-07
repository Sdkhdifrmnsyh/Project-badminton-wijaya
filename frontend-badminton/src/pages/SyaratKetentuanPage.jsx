import React from 'react';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import '../appCustomer.css';

const SyaratKetentuanPage = () => {
  return (
    <div className="info-page-wrapper">
      <CustomerHeader />
      
      {/* 👇 JURUS JITU 2.0: Memaksa warna sampai ke dalam akar tag <li> 👇 */}
      <style>{`
        /* --- TAMPILAN LIGHT MODE (DEFAULT HITAM) --- */
        .sk-card {
          background-color: #ffffff !important;
        }
        .sk-title {
          color: #111827 !important; /* Hitam pekat */
          border-bottom: 2px solid #e5e7eb !important;
        }
        /* Targetkan langsung ul dan li agar merata hitam */
        .sk-list, .sk-list li {
          color: #1f2937 !important; 
        }
        .sk-list strong {
          color: #000000 !important; 
        }

        /* --- TAMPILAN DARK MODE (PUTIH BERSIH) --- */
        body.dark-mode .sk-card {
          background-color: #1e293b !important; 
        }
        body.dark-mode .sk-title {
          color: #ffffff !important; 
          border-bottom: 2px solid #374151 !important; 
        }
        /* 👇 KUNCI PERBAIKAN: Targetkan langsung ke 'li' agar tidak kalah dari CSS bawaan 👇 */
        body.dark-mode .sk-list, body.dark-mode .sk-list li {
          color: #f9fafb !important; /* Putih terang untuk teks biasa */
        }
        body.dark-mode .sk-list strong {
          color: #ffffff !important; 
        }
      `}</style>

      <div className="info-content">
        <h1 className="info-title" style={{ color: 'var(--wijaya-blue)' }}>
          <i className="bi bi-card-checklist"></i> Syarat & Ketentuan
        </h1>
        
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title" style={{ paddingBottom: '10px', marginBottom: '15px' }}>
            <i className="bi bi-wallet2" style={{ color: '#10b981', marginRight: '8px' }}></i> 
            1. Kebijakan Pemesanan & Pembayaran
          </h3>
          <ul className="sk-list" style={{ lineHeight: '1.8' }}>
            <li>Pemesanan jadwal reguler wajib disertai pembayaran <strong>DP (Uang Muka) 50%</strong> atau <strong>Lunas 100%</strong> melalui sistem pembayaran online yang tersedia.</li>
            <li>Pelunasan sisa tagihan (jika memilih pembayaran DP) wajib diselesaikan di lokasi kasir GOR sebelum waktu bermain dimulai.</li>
            <li>Pemesanan jadwal tidak akan tercatat di sistem kami jika pembayaran belum berhasil diverifikasi dalam batas waktu yang ditentukan.</li>
          </ul>
        </div>

        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title" style={{ paddingBottom: '10px', marginBottom: '15px' }}>
            <i className="bi bi-calendar-event" style={{ color: '#3b82f6', marginRight: '8px' }}></i> 
            2. Pembatalan & Pindah Jadwal (Reschedule)
          </h3>
          <ul className="sk-list" style={{ lineHeight: '1.8' }}>
            <li>Pembatalan pesanan <strong>wajib dilakukan maksimal H-1 (24 Jam sebelum jam bermain)</strong>.</li>
            <li><strong>Pembatalan pada Hari H tidak diperkenankan.</strong> Jika Anda berhalangan hadir pada hari tersebut, jadwal Anda tidak akan hangus, namun Anda <strong>wajib mengalihkannya (Reschedule)</strong> ke hari/jam lain yang masih tersedia.</li>
            <li>Aturan wajib <em>Reschedule</em> pada Hari H ini berlaku mutlak untuk <strong>semua kategori pelanggan</strong> (Reguler, Rutin, maupun Member).</li>
            <li>Khusus pelanggan kategori Rutin dan Member, jika saat memindahkan jadwal sisa waktu tidak cukup untuk menampung durasi asli, Anda dapat alihkan untuk <strong>Pecah Jam Main</strong> ke waktu yang berbeda.</li>
          </ul>
        </div>

        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title" style={{ paddingBottom: '10px', marginBottom: '15px' }}>
            <i className="bi bi-star-fill" style={{ color: '#f59e0b', marginRight: '8px' }}></i> 
            3. Ketentuan Keanggotaan (Member)
          </h3>
          <ul className="sk-list" style={{ lineHeight: '1.8' }}>
            <li>Masa aktif seluruh paket Member adalah <strong>tepat 1 Bulan</strong> terhitung sejak tanggal pendaftaran.</li>
            <li>Setiap Member memiliki batas kuota pemakaian lapangan maksimal <strong>3 Jam per Pekan</strong> (Siklus pekan dihitung mulai hari Senin hingga Minggu).</li>
            <li><strong>Member Promo (Rp 240.000):</strong> Hanya dapat digunakan untuk pemesanan jadwal di hari (Senin s/d Kamis) jam 07:00-14:00.</li>
            <li><strong>Member Eksklusif (Rp 300.000):</strong> Bebas digunakan di semua hari tanpa batasan (Senin s/d Minggu) jam 07:00-24:00.</li>
            <li>Jika kuota 3 jam dalam sepekan tidak dihabiskan, sisa waktu tersebut akan otomatis hangus dan tidak dapat diakumulasikan ke pekan berikutnya.</li>
          </ul>
        </div>

        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title" style={{ paddingBottom: '10px', marginBottom: '15px' }}>
            <i className="bi bi-tags-fill" style={{ color: '#ef4444', marginRight: '8px' }}></i> 
            4. Ketentuan Promo Harian & Tanggal Merah
          </h3>
          <ul className="sk-list" style={{ lineHeight: '1.8' }}>
            <li>Segala bentuk Promo Harian (Contoh: Diskon khusus Senin-Kamis) <strong>tidak berlaku pada Tanggal Merah atau Libur Nasional</strong>.</li>
            <li>Jika Anda melakukan pemesanan pada hari yang bertepatan dengan Tanggal Merah, sistem akan secara otomatis mengembalikan tarif pesanan Anda ke Harga Normal meskipun jatuh pada rentang hari promo tersebut.</li>
          </ul>
        </div>

        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title" style={{ paddingBottom: '10px', marginBottom: '15px' }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ color: '#64748b', marginRight: '8px' }}></i> 
            5. Tata Tertib Area Lapangan
          </h3>
          <ul className="sk-list" style={{ lineHeight: '1.8' }}>
            <li>Setiap pemain diwajibkan menggunakan sepatu olahraga khusus (<em>non-marking shoes</em>) untuk menjaga kualitas karpet lapangan.</li>
            <li>Dilarang keras merokok, makan, atau membawa minuman berwarna ke area dalam karpet lapangan jika ingin melakukan kegiatan tersebut bisa dilakukan di luar.</li>
            <li>Waktu bermain harus disesuaikan ketat dengan durasi yang telah dipesan. Harap bersiap mengosongkan lapangan 5 menit sebelum waktu habis agar pelanggan selanjutnya dapat bersiap masuk.</li>
          </ul>
        </div>

      </div>
      <CustomerFooter />
    </div>
  );
};

export default SyaratKetentuanPage;