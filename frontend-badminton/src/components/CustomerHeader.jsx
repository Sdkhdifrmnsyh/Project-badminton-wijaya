import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const CustomerHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 👇 State untuk fitur History 👇
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [riwayatData, setRiwayatData] = useState([]);

  // 👇 Pendeteksi halaman aktif untuk Garis Merah Menu Desktop 👇
  const location = useLocation();
  const isActive = (path) => {
    return location.pathname === path ? 'active-menu' : '';
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // 👇 Fungsi Buka/Tutup History 👇
  const bukaHistory = () => {
    // Ambil data rahasia dari HP pelanggan
    const data = JSON.parse(localStorage.getItem('riwayatPesananWijaya')) || [];
    setRiwayatData(data);
    setIsHistoryOpen(true);
  };
  const tutupHistory = () => setIsHistoryOpen(false);

  // 👇 STATE & EFFECT UNTUK COUNTDOWN 15 MENIT 👇
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let interval;
    if (isHistoryOpen) {
      interval = setInterval(() => {
        setTick(prev => prev + 1); // Memaksa UI me-refresh setiap 1 detik
        
        setRiwayatData(prevData => {
          let hasChanges = false;
          const newData = prevData.map(item => {
            if (item.status === 'pending' && item.waktu_pesan) {
              const batasWaktu = item.waktu_pesan + (15 * 60 * 1000); // 15 Menit
              if (new Date().getTime() > batasWaktu) {
                hasChanges = true;
                return { ...item, status: 'gagal' }; // Otomatis Gagal jika lewat 15 menit
              }
            }
            return item;
          });
          
          if (hasChanges) {
            localStorage.setItem('riwayatPesananWijaya', JSON.stringify(newData));
            return newData;
          }
          return prevData;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isHistoryOpen]);

  const formatWaktu = (ms) => {
    if (ms <= 0) return "00:00";
    const menit = Math.floor(ms / 60000);
    const detik = Math.floor((ms % 60000) / 1000);
    return `${menit < 10 ? '0' : ''}${menit}:${detik < 10 ? '0' : ''}${detik}`;
  };

  // 👇 Fungsi untuk Melanjutkan Pembayaran Pending 👇
  const lanjutkanPembayaran = (item) => {
    if (!item.token) { alert("Token pembayaran tidak ditemukan."); return; }
    
    window.snap.pay(item.token, {
      onSuccess: function(){ 
        axios.put(`http://127.0.0.1:8000/api/booking/sukses/${item.id}`).then(() => {
          // Update localstorage
          const h = JSON.parse(localStorage.getItem('riwayatPesananWijaya')) || [];
          const updatedH = h.map(x => x.id === item.id ? { ...x, status: 'sukses' } : x);
          localStorage.setItem('riwayatPesananWijaya', JSON.stringify(updatedH));
          setRiwayatData(updatedH); // Update layar
          alert("Pembayaran Berhasil! Jadwal Anda sudah aktif.");
        });
      },
      onPending: function(){ alert("Pembayaran Anda masih tertunda. Silakan selesaikan instruksi pembayaran."); },
      onError: function(){ alert("Pembayaran gagal diproses oleh sistem."); },
      onClose: function(){ alert("Anda menutup jendela pembayaran."); }
    });
  };

  const WijayaLogo = ({ aksiKlik }) => (
    <Link to="/" className="wijaya-logo-wrapper" onClick={aksiKlik}>
      <img src="logo_wijaya_1.png" alt="Logo GOR Wijaya" className="header-logo-img" />
    </Link>
  );

  return (
    <>
      <header className="customer-header">
        
        {/* BAGIAN KIRI: Hamburger (Sembunyi di PC) & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="hamburger-btn hide-on-desktop" onClick={toggleMenu}>
            <i className="bi bi-list"></i>
          </button>
          <WijayaLogo />
        </div>

        {/* 👇 BAGIAN TENGAH: Menu Desktop (Hanya muncul di PC/Laptop) 👇 */}
        <nav className="desktop-nav-menu hide-on-mobile">
          <Link to="/" className={`desktop-link ${isActive('/')}`}>Pesan Jadwal</Link>
          <Link to="/fasilitas" className={`desktop-link ${isActive('/fasilitas')}`}>Fasilitas GOR</Link>
          <Link to="/layanan" className={`desktop-link ${isActive('/layanan')}`}>Info Layanan</Link>
          <Link to="/syarat-ketentuan" className={`desktop-link ${isActive('/syarat-ketentuan')}`}>Syarat & Ketentuan</Link>
          <Link to="/tentang-kami" className={`desktop-link ${isActive('/tentang-kami')}`}>Tentang Kami</Link>
        </nav>

        {/* BAGIAN KANAN: Tombol History & Tema */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          <button className="history-toggle-btn" onClick={bukaHistory} title="Lihat History Pesanan">
            <i className="bi bi-clock-history"></i>
            <span className="history-text">History Pesanan</span>
          </button>

          <button className="theme-toggle-btn" onClick={toggleTheme} title="Ganti Tema">
            <i className={isDarkMode ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill'}></i>
          </button>

        </div>
      </header>

      {/* 👇 MODAL POPUP HISTORY PESANAN 👇 */}
      {isHistoryOpen && (
        <div className="history-modal-overlay" onClick={tutupHistory}>
          <div className="history-modal-box" onClick={e => e.stopPropagation()}>
            <div className="hm-header">
              <h3>Riwayat Pesanan</h3>
              <button onClick={tutupHistory} className="hm-close">✖</button>
            </div>
            
            <div className="hm-body">
              {riwayatData.length === 0 ? (
                <div className="hm-kosong">
                  <i className="bi bi-receipt"></i>
                  <p>Belum ada riwayat pesanan</p>
                </div>
              ) : (
                riwayatData.map((item, index) => (
                  <div key={index} className="hm-card" style={{ border: item.status === 'pending' ? '1px solid #f59e0b' : '1px solid var(--border-color)' }}>
                    
                    {/* 👇 HEADER KARTU: Lapangan & Status DP/Lunas 👇 */}
                    <div className="hm-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      
                      {/* 👇 PERBAIKAN: Warna Lapangan otomatis Hitam/Putih menyesuaikan Mode 👇 */}
                      <span className="hm-lapangan" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                        {item.lapangan}
                      </span>
                      
                      {/* Wadah Flex untuk Badge Status */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {item.opsi_bayar && (
                          <span style={{ background: item.opsi_bayar === 'dp' ? '#f59e0b' : '#10b981', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            {item.opsi_bayar === 'dp' ? 'DP' : 'LUNAS'}
                          </span>
                        )}

                        {/* 👇 Badge Status Cerdas (Sukses / Pending / Gagal) 👇 */}
                        <span className="hm-status" style={{ background: item.status === 'pending' ? '#f59e0b' : (item.status === 'gagal' ? '#ef4444' : '#10b981'), color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {item.status === 'pending' ? '⏳ Pending' : (item.status === 'gagal' ? '❌ Gagal' : '✅ Sukses')}
                        </span>
                      </div>
                    </div>
                    
                    {/* 👇 INFO PEMESAN (DITAMBAH DURASI) 👇 */}
                    <div className="hm-detail" style={{ marginTop: '10px', color: 'var(--text-primary)' }}>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Nama:</strong> {item.nama}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>No. WA:</strong> {item.no_wa || '-'}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Tanggal:</strong> {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      
                      {/* 👇 PERBAIKAN: Durasi disamakan style-nya dengan teks jam main 👇 */}
                      <p style={{ margin: '0 0 5px 0' }}>
                        <strong>Jam Main:</strong> {item.jam} 
                        <span>
                          {item.durasi ? ` (${item.durasi} Jam)` : (() => {
                            const d = item.jam.split(' - ');
                            if(d.length===2) {
                              let dur = parseInt(d[1]) - parseInt(d[0]);
                              return ` (${dur < 0 ? dur + 24 : dur} Jam)`;
                            } return '';
                          })()}
                        </span>
                      </p>
                    </div>
                    
                    {/* 👇 RINCIAN PEMBAYARAN (STRUK MINI) 👇 */}
                    <div className="hm-harga" style={{ background: 'rgba(0,0,0,0.03)', padding: '12px', borderRadius: '8px', marginTop: '15px', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
                      {item.opsi_bayar === 'dp' ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                            <span>Total Harga:</span><span>Rp {(item.harga * 2).toLocaleString('id-ID')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#f59e0b', fontWeight: 'bold' }}>
                            <span>DP Dibayar (50%):</span><span>Rp {item.harga.toLocaleString('id-ID')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '8px', marginTop: '6px', color: '#ef4444', fontWeight: 'bold' }}>
                            <span>Sisa Tagihan (Di Kasir):</span><span>Rp {item.harga.toLocaleString('id-ID')}</span>
                          </div>
                        </>
                      ) : item.opsi_bayar === 'lunas' ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                            <span>Total Harga:</span><span>Rp {item.harga.toLocaleString('id-ID')}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 'bold' }}>
                            <span>Telah Dibayar (Lunas):</span><span>Rp {item.harga.toLocaleString('id-ID')}</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                          <span>Total Bayar:</span><span>Rp {item.harga.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>

                    {/* 👇 BOX PENDING + COUNTDOWN WAKTU 15 MENIT 👇 */}
                    {item.status === 'pending' && (
                      <div style={{ marginTop: '15px', padding: '12px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                           <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309', lineHeight: '1.5', flex: 1 }}>
                             Menunggu pembayaran. Selesaikan pembayaran sebelum waktu habis.
                           </p>
                           {/* KOTAK ANIMASI HITUNG MUNDUR */}
                           <div style={{ background: '#fef3c7', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold', color: '#d97706', fontSize: '1.1rem', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
                             ⏱️ {formatWaktu((item.waktu_pesan || new Date().getTime()) + (15 * 60 * 1000) - new Date().getTime())}
                           </div>
                        </div>

                        <button onClick={() => lanjutkanPembayaran(item)} style={{ width: '100%', padding: '10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <i className="bi bi-credit-card"></i> Lanjutkan Pembayaran
                        </button>
                      </div>
                    )}

                    {/* 👇 BOX GAGAL (KADALUWARSA) 👇 */}
                    {item.status === 'gagal' && (
                      <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fca5a5', borderRadius: '8px' }}>
                         <p style={{ margin: 0, fontSize: '0.85rem', color: '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>
                           ❌ Pembayaran Kedaluwarsa / Dibatalkan
                         </p>
                      </div>
                    )}
                    
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Laci Hamburger Menu (Untuk HP) */}
      <div className={`gor-wijaya-customer-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>
      <div className={`gor-wijaya-customer-menu-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <WijayaLogo aksiKlik={toggleMenu} />
          <button className="drawer-close-btn" onClick={toggleMenu}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="drawer-content">
          <Link to="/" className="customer-drawer-menu-item" onClick={toggleMenu}><i className="bi bi-calendar-check"></i> Pesan Jadwal</Link>
          <Link to="/fasilitas" className="customer-drawer-menu-item" onClick={toggleMenu}><i className="bi bi-building"></i> Fasilitas GOR</Link>
          <Link to="/layanan" className="customer-drawer-menu-item" onClick={toggleMenu}><i className="bi bi-info-square"></i> Info Layanan</Link>
          <Link to="/syarat-ketentuan" className="customer-drawer-menu-item" onClick={toggleMenu}><i className="bi bi-card-text"></i> Syarat & Ketentuan</Link>
          <Link to="/tentang-kami" className="customer-drawer-menu-item" onClick={toggleMenu}><i className="bi bi-info-circle"></i> Tentang Kami</Link>
        </div>
      </div>

      <a href="https://wa.me/628811147282" target="_blank" rel="noopener noreferrer" className="floating-wa-btn">
        <i className="bi bi-whatsapp"></i>
      </a>
    </>
  );
};

export default CustomerHeader;