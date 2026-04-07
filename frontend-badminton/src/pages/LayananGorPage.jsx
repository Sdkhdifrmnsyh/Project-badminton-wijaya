import React from 'react';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import '../appCustomer.css';

const LayananGorPage = () => {
  return (
    <div className="info-page-wrapper">
      <CustomerHeader />
      
      {/* 👇 JURUS JITU CSS INTERNAL (Otomatis Hitam di Light Mode, Putih di Dark Mode) 👇 */}
      <style>{`
        /* --- TAMPILAN LIGHT MODE --- */
        .sk-card { background-color: #ffffff !important; }
        .sk-title { color: #111827 !important; border-bottom: 2px solid #e5e7eb !important; padding-bottom: 10px; margin-bottom: 15px; }
        .sk-desc { color: #1f2937 !important; line-height: 1.8; margin-bottom: 15px; }
        .sk-list, .sk-list li { color: #1f2937 !important; line-height: 1.8; }
        .sk-list strong { color: #000000 !important; }

        /* --- TAMPILAN DARK MODE --- */
        body.dark-mode .sk-card { background-color: #1e293b !important; }
        body.dark-mode .sk-title { color: #ffffff !important; border-bottom: 2px solid #374151 !important; }
        body.dark-mode .sk-desc { color: #f9fafb !important; }
        body.dark-mode .sk-list, body.dark-mode .sk-list li { color: #f9fafb !important; }
        body.dark-mode .sk-list strong { color: #ffffff !important; }
      `}</style>

      <div className="info-content">
        <h1 className="info-title" style={{ color: 'var(--wijaya-blue)' }}>
          <i className="bi bi-info-square"></i> Info Layanan GOR
        </h1>

        {/* PENGUMUMAN HUBUNGI ADMIN */}
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid #3b82f6', padding: '15px', borderRadius: '8px', marginBottom: '25px' }}>
          <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            💡 <strong>Pemberitahuan:</strong> Untuk pendaftaran <strong>Penyewaan Rutin</strong> maupun pembelian paket <strong>Member (Promo/Eksklusif)</strong>, silakan menghubungi Admin kami terlebih dahulu melalui tombol WhatsApp yang tersedia di pojok kanan bawah layar.
          </p>
        </div>
        
        {/* --- 1. REGULER --- */}
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">
            <i className="bi bi-person-fill" style={{ color: '#3b82f6', marginRight: '8px' }}></i> 
            Penyewaan Reguler
          </h3>
          <p className="sk-desc">Kategori penyewaan standar bagi Anda yang ingin bermain fleksibel kapan saja melalui sistem booking online kami.</p>
          <ul className="sk-list">
            <li><strong>Tarif Normal:</strong> Rp 30.000,-/jam (Berlaku di luar jam promo dan pada hari libur nasional).</li>
            <li><strong>Tarif Promo:</strong> Rp 25.000,-/jam (Berlaku khusus hari Senin s.d. Kamis, pukul 07.00 - 14.00 WIB. Tidak berlaku pada tanggal merah).</li>
            <li><strong>Program Kartu Stempel:</strong> Setiap penyewaan 1 jam dengan tarif normal (Rp 30.000), Anda berhak mendapatkan 1 buah stempel (berlaku kelipatan).</li>
            <li>Kumpulkan hingga <strong>15 stempel</strong> untuk mengklaim <strong>GRATIS main selama 1 Jam</strong>. <em>(Catatan: Untuk mengklaim gratis 1 jam, pelanggan tetap diwajibkan melakukan booking jadwal di sistem seperti biasa).</em></li>
          </ul>
        </div>

        {/* --- 2. RUTIN --- */}
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">
            <i className="bi bi-arrow-repeat" style={{ color: '#10b981', marginRight: '8px' }}></i> 
            Penyewaan Rutin
          </h3>
          <p className="sk-desc">Sangat cocok bagi Anda yang memiliki jadwal bermain tetap setiap pekannya tanpa harus berlangganan paket Member.</p>
          <ul className="sk-list">
            <li><strong>Bebas Repot:</strong> Anda tidak perlu lagi sibuk berburu jadwal kosong atau melakukan booking secara berulang setiap pekannya. Jadwal Anda otomatis kami amankan.</li>
            <li><strong>Tanpa Biaya Tambahan:</strong> Tidak ada biaya ekstra untuk layanan ini, hanya dibutuhkan komitmen dan kesepakatan jadwal bersama petugas kasir kami.</li>
            <li><strong>Kebijakan Ketidakhadiran:</strong> Anda cukup menghubungi Admin jika berhalangan hadir di pekan tertentu. Pembatalan ini wajib diinformasikan minimal H-1 dan tidak boleh dilakukan secara mendadak pada Hari H, jika pembatalan di hari H, akan dilakukan reschedule.</li>
          </ul>
        </div>

        {/* --- 3. MEMBER PROMO --- */}
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">
            <i className="bi bi-star-half" style={{ color: '#f59e0b', marginRight: '8px' }}></i> 
            Paket Member Promo (Rp 240.000 / Bulan)
          </h3>
          <p className="sk-desc">Paket super hemat (Setara Rp 20.000/jam) yang dikhususkan untuk permainan di pagi hingga siang hari kerja.</p>
          <ul className="sk-list">
            <li><strong>Waktu Berlaku:</strong> Senin s.d. Kamis, pukul 07.00 - 14.00 WIB. (Tidak berlaku di atas pukul 14.00, serta tidak berlaku di hari Jumat, Sabtu dan Minggu).</li>
            <li><strong>Kuota Main:</strong> Maksimal <strong>3 jam per pekan</strong> (bisa dipecah ke beberapa hari). Total bermain dalam 1 bulan adalah 4 pekan.</li>
            <li><strong>Pembayaran:</strong> Tagihan bulanan sebesar Rp 240.000,- dibayarkan penuh di muka sebelum memulai periode permainan.</li>
            <li><strong>Bonus Pekan ke-5:</strong> Apabila dalam 1 bulan kalender terdapat 5 pekan untuk hari jadwal Anda bermain, maka pekan ke-5 tersebut bersifat <strong>GRATIS</strong> (Tagihan bulanan tetap sama).</li>
          </ul>
        </div>

        {/* --- 4. MEMBER EKSKLUSIF --- */}
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">
            <i className="bi bi-star-fill" style={{ color: '#a32129', marginRight: '8px' }}></i> 
            Paket Member Eksklusif (Rp 300.000 / Bulan)
          </h3>
          <p className="sk-desc">Paket prioritas (Setara Rp 25.000/jam) dengan kebebasan memilih waktu bermain, bahkan di jam-jam sibuk (*Peak Time*).</p>
          <ul className="sk-list">
            <li><strong>Waktu Berlaku:</strong> Bebas bermain di hari apapun (Senin s.d. Minggu) dan jam berapapun (07.00 - 24.00 WIB), selama lapangan masih tersedia.</li>
            <li><strong>Kepastian Jadwal:</strong> Anda tidak perlu khawatir kehilangan lapangan favorit untuk bermain bersama teman atau keluarga karena jadwal telah diamankan.</li>
            <li><strong>Kuota Main:</strong> Maksimal <strong>3 jam per pekan</strong> (bisa dipecah). Total bermain dalam 1 bulan adalah 4 pekan.</li>
            <li><strong>Pembayaran:</strong> Tagihan bulanan sebesar Rp 300.000,- dibayarkan penuh di muka.</li>
            <li><strong>Bonus Pekan ke-5:</strong> Apabila terdapat 5 pekan dalam bulan tersebut, pekan ke-5 bersifat <strong>GRATIS</strong> (Tagihan tetap sama).</li>
          </ul>
        </div>

      </div>
      <CustomerFooter />
    </div>
  );
};

export default LayananGorPage;