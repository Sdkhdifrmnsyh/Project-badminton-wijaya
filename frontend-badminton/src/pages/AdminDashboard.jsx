import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import '../App.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [namaAdmin, setNamaAdmin] = useState('Admin');
  
  // 👇 GEMBOK BUTTON (ANTI DOUBLE SUBMIT) 👇
  const [isLoadingBtn, setIsLoadingBtn] = useState(false);

  const [gorBuka, setGorBuka] = useState(true);
  const [gorActualBuka, setGorActualBuka] = useState(true); 
  const [gorTglMulai, setGorTglMulai] = useState('');
  const [gorTglSampai, setGorTglSampai] = useState('');
  const [isEditTgl, setIsEditTgl] = useState(false);
  const [editTglValue, setEditTglValue] = useState('');

  const [bookings, setBookings] = useState([]);
  
  const [promos, setPromos] = useState([]);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [formPromo, setFormPromo] = useState({
    nama_promo: '', tgl_mulai: '', tgl_selesai: '',
    jam_mulai: '', jam_selesai: '', minimal_jam_main: 1, harga_promo: ''
  });

  const [jamPenuhModal, setJamPenuhModal] = useState([]); 
  const [filterTanggal, setFilterTanggal] = useState('');
  const [tanggalJadwal, setTanggalJadwal] = useState(new Date().toISOString().split('T')[0]);
  const [tahunJadwal, setTahunJadwal] = useState(new Date().getFullYear());
  const [bulanJadwal, setBulanJadwal] = useState('semua');
  const [bulanLaporan, setBulanLaporan] = useState('semua'); 
  const [tahunLaporan, setTahunLaporan] = useState(new Date().getFullYear());
  const [statusJadwal, setStatusJadwal] = useState('semua'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editTanggal, setEditTanggal] = useState('');
  const [editJamMulai, setEditJamMulai] = useState('');
  const [editJamSelesai, setEditJamSelesai] = useState('');
  const [searchName, setSearchName] = useState('');

  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', icon: '', confirmText: 'OK', isDanger: false, onConfirm: null });
  const [formTutup, setFormTutup] = useState({ pesan: '', tglMulai: '', tglSampai: '' });

  const showAlert = (title, message, icon = 'ℹ️', confirmText = 'OK') => setAlertConfig({ isOpen: true, type: 'alert', title, message, icon, confirmText, isDanger: false, onConfirm: null });
  const showConfirm = (title, message, icon, confirmText, isDanger, onConfirm) => setAlertConfig({ isOpen: true, type: 'confirm', title, message, icon, confirmText, isDanger, onConfirm });
  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const fetchAdminData = () => {
    axios.get(`https://gor-wijaya.page.gd/api/admin/bookings?_t=${new Date().getTime()}`)
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          let dataPesanan = response.data.data;
          dataPesanan.sort((a, b) => b.id - a.id);
          setBookings(dataPesanan);
        } else { setBookings([]); }
      }).catch((error) => console.error(error));
  };

  const fetchStatusGor = () => {
    axios.get(`https://gor-wijaya.page.gd/api/gor/status?_t=${new Date().getTime()}`)
      .then((response) => {
        setGorBuka(response.data.status_db === 'buka');
        setGorActualBuka(response.data.status_actual === 'buka');
        setGorTglMulai(response.data.tgl_mulai);
        setGorTglSampai(response.data.tgl_sampai);
      }).catch((error) => console.error(error));
  };

  const fetchPromos = () => {
    axios.get(`https://gor-wijaya.page.gd/api/promos?_t=${new Date().getTime()}`)
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) { setPromos(response.data.data); }
      }).catch((error) => console.error(error));
  };

  const handleSimpanBatasWaktu = () => {
    if (!editTglValue) { showAlert("Perhatian", "Pilih tanggal terlebih dahulu!", "⚠️"); return; }
    if (editTglValue <= gorTglMulai) { showAlert("Tanggal Tidak Valid", "Tanggal buka harus SETELAH tanggal tutup!", "❌"); return; }
    
    if(isLoadingBtn) return; setIsLoadingBtn(true);
    axios.put('https://gor-wijaya.page.gd/api/admin/gor/status', { status: 'tutup', tgl_mulai: gorTglMulai, tgl_sampai: editTglValue })
    .then(() => { setIsEditTgl(false); fetchStatusGor(); showAlert("Berhasil!", "Batas waktu GOR berhasil diperbarui.", "✅"); })
    .catch((err) => showAlert("Gagal", "Gagal menyimpan batas waktu.", "🔌"))
    .finally(() => setIsLoadingBtn(false));
  };

  const formatTglSingkat = (tgl) => {
    if(!tgl) return ''; return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusTampilan = () => {
    if (gorBuka) return { teks: "BUKA", warna: "text-green", dot: "🟢" };
    if (!gorTglMulai) return { teks: "TUTUP", warna: "text-red", dot: "🔴" };
    const hariIni = new Date(); hariIni.setHours(0, 0, 0, 0);
    const mulai = new Date(gorTglMulai); mulai.setHours(0, 0, 0, 0);
    let selesai = null;
    if (gorTglSampai) { selesai = new Date(gorTglSampai); selesai.setHours(0, 0, 0, 0); }
    if (hariIni < mulai) return { teks: "Akan Tutup", warna: "text-yellow", dot: "🟡" };
    else if (selesai && hariIni > selesai) return { teks: "BUKA (Lewat Batas)", warna: "text-green", dot: "🟢" };
    else return { teks: "TUTUP", warna: "text-red", dot: "🔴" };
  };
  
  useEffect(() => {
    if (isModalOpen && editTanggal && selectedBooking) {
      axios.get(`https://gor-wijaya.page.gd/api/booking/cek-jadwal?lapangan_id=${selectedBooking.lapangan_id}&tanggal_main=${editTanggal}`)
        .then(res => setJamPenuhModal(res.data.data))
        .catch(err => console.error(err));
    }
  }, [editTanggal, isModalOpen, selectedBooking]);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      const namaPertama = storedUsername.split(' ')[0]; 
      setNamaAdmin(namaPertama.charAt(0).toUpperCase() + namaPertama.slice(1).toLowerCase());
    }
    fetchAdminData(); fetchStatusGor(); fetchPromos();
    const intervalId = setInterval(() => { fetchAdminData(); fetchStatusGor(); fetchPromos(); }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const cekBisaBatal = (tanggalMain, jamMulai) => {
    const jamFormat = jamMulai.substring(0, 5); 
    return ((new Date(`${tanggalMain}T${jamFormat}:00`) - new Date()) / (1000 * 60)) > 60;
  };

  const cekSudahLewat = (tanggalMain, jamMulai) => {
    return new Date() >= new Date(`${tanggalMain}T${jamMulai.substring(0, 5)}:00`); 
  };

  const handleToggleGor = () => {
    if (gorBuka) {
      const d = new Date();
      const hariIniStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setFormTutup({ pesan: '', tglMulai: hariIniStr, tglSampai: '' });
      setAlertConfig({ isOpen: true, type: 'form_tutup' });
    } else {
      showConfirm("Buka GOR?", "Buka kembali jadwal untuk pelanggan?", "✅", "Ya, Buka", false, () => executeToggleGor('buka'));
    }
  };

  const executeToggleGor = (status, dataTambahan = {}) => {
    if(isLoadingBtn) return; setIsLoadingBtn(true);
    axios.put('https://gor-wijaya.page.gd/api/admin/gor/status', { status, ...dataTambahan })
    .then((res) => { closeAlert(); showAlert("Sukses", res.data.pesan, "✅"); fetchAdminData(); fetchStatusGor(); })
    .finally(() => setIsLoadingBtn(false));
  };

  const handlePelunasanManual = (id) => {
    showConfirm("Lunasi?", "Pelanggan sudah bayar sisa tagihan?", "💰", "Ya, Lunasi", false, () => {
      if(isLoadingBtn) return; setIsLoadingBtn(true);
      axios.put(`https://gor-wijaya.page.gd/api/admin/booking/pelunasan/${id}`)
      .then(res => { closeAlert(); showAlert("Lunas!", res.data.pesan, "✅"); fetchAdminData(); })
      .finally(() => setIsLoadingBtn(false));
    });
  };

  const handleBatalkanPesanan = (id) => {
    showConfirm("Batalkan?", "Pesanan akan dihapus permanen. Yakin?", "🚨", "Ya, Batal", true, () => {
      if(isLoadingBtn) return; setIsLoadingBtn(true);
      axios.delete(`https://gor-wijaya.page.gd/api/admin/booking/batal/${id}`)
      .then(res => { closeAlert(); showAlert("Dibatalkan", res.data.pesan, "🗑️"); fetchAdminData(); })
      .finally(() => setIsLoadingBtn(false));
    });
  };

  const handleLogout = () => {
    showConfirm("Keluar?", "Yakin ingin keluar?", "🚪", "Ya, Keluar", true, () => { localStorage.clear(); closeAlert(); navigate('/login'); });
  };

  const simpanReschedule = () => {
    if(isLoadingBtn) return; setIsLoadingBtn(true);
    axios.put(`https://gor-wijaya.page.gd/api/admin/booking/reschedule/${selectedBooking.id}`, { tanggal_main: editTanggal, jam_mulai: editJamMulai, jam_selesai: editJamSelesai })
    .then(res => { setIsModalOpen(false); showAlert("Berhasil!", res.data.pesan, "📅"); fetchAdminData(); })
    .finally(() => setIsLoadingBtn(false));
  };

  const bukaModalReschedule = (booking) => {
    setSelectedBooking(booking); setEditTanggal(booking.tanggal_main); 
    setEditJamMulai(booking.jam_mulai.substring(0, 5)); setEditJamSelesai(booking.jam_selesai.substring(0, 5)); 
    setIsModalOpen(true);
  };

  // 👇 LOGIKA FORM PROMO BARU (ANTI-HUMAN ERROR) 👇
  const handleSimpanPromo = () => {
    if(isLoadingBtn) return; // Kunci tombol
    if (!formPromo.tgl_mulai || !formPromo.tgl_selesai || !formPromo.jam_mulai || !formPromo.jam_selesai || !formPromo.harga_promo) {
      showAlert("Peringatan", "Semua kolom tanggal, jam, dan harga wajib diisi!", "⚠️"); return;
    }

    setIsLoadingBtn(true);
    
    // Kalau nama promo kosong, isi otomatis
    const dataKirim = {
      ...formPromo,
      nama_promo: formPromo.nama_promo || 'Promo Spesial',
      // Pastikan format jam dikirim dengan benar ke database (MySQL butuh format 23:59:00 untuk tengah malam)
      jam_selesai: formPromo.jam_selesai === '24:00' ? '23:59:00' : formPromo.jam_selesai
    };

    axios.post('https://gor-wijaya.page.gd/api/promos', dataKirim)
      .then(() => {
        showAlert("Berhasil", "Promo baru berhasil ditambahkan!", "✅");
        setIsPromoModalOpen(false);
        fetchPromos();
        setFormPromo({ nama_promo: '', tgl_mulai: '', tgl_selesai: '', jam_mulai: '', jam_selesai: '', minimal_jam_main: 1, harga_promo: '' });
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingBtn(false)); // Buka gembok tombol
  };

  const handleTogglePromo = (id, currentStatus) => {
    if(isLoadingBtn) return; setIsLoadingBtn(true);
    axios.put(`https://gor-wijaya.page.gd/api/promos/${id}`, { is_active: !currentStatus })
      .then(() => fetchPromos())
      .finally(() => setIsLoadingBtn(false));
  };

  const handleHapusPromo = (id) => {
    showConfirm("Hapus Promo?", "Yakin ingin menghapus promo ini?", "🗑️", "Hapus", true, () => {
      if(isLoadingBtn) return; setIsLoadingBtn(true);
      axios.delete(`https://gor-wijaya.page.gd/api/promos/${id}`)
        .then(() => { closeAlert(); fetchPromos(); })
        .finally(() => setIsLoadingBtn(false));
    });
  };

  // LOGIKA TANGGAL PROMO
  const d = new Date();
  const minHariIni = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const getMinTglSelesaiPromo = () => {
    if (!formPromo.tgl_mulai) return minHariIni;
    // Logika Murni + 1 Hari dari Tgl Mulai
    const baseDate = new Date(formPromo.tgl_mulai);
    baseDate.setDate(baseDate.getDate() + 1);
    return baseDate.toISOString().split('T')[0];
  };

  // LOGIKA JAM PROMO (PILIHAN DROPDOWN)
  const opsiJamPromo = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','24:00'];

  const renderDaftarPesanan = (dataBookings) => (
    <div className="booking-list">
      {dataBookings.length === 0 && <p className="empty-log">Tidak ada pesanan.</p>}
      {dataBookings.map((booking) => {
        const s = booking.status_pembayaran.toLowerCase();
        const isLunas = s === 'lunas'; const isBatal = s === 'batal'; const isDP = s.includes('dp');
        let displayStatus = 'DP'; if(isLunas) displayStatus = 'LUNAS'; if(isBatal) displayStatus = 'BATAL';
        
        const bisaDibatalkan = cekBisaBatal(booking.tanggal_main, booking.jam_mulai);
        const sudahLewat = cekSudahLewat(booking.tanggal_main, booking.jam_mulai); 

        const jamMulaiInt = parseInt(booking.jam_mulai.substring(0, 2));
        const jamSelesaiInt = parseInt(booking.jam_selesai.substring(0, 2));
        let durasi = jamSelesaiInt - jamMulaiInt; if (durasi < 0) durasi += 24; 

        return (
          <div className={`booking-card ${isBatal ? 'card-batal' : (isLunas ? 'card-lunas' : 'card-dp')}`} key={booking.id} style={isBatal ? { opacity: 0.6, filter: 'grayscale(100%)' } : {}}>
            <div className="bc-header">
              <span className="bc-lapangan">🏸 {booking.nama_lapangan}</span>
              <span className={`lap-badge ${isLunas ? 'lunas' : 'dp'}`} style={isBatal ? { background: '#ef4444', color: 'white' } : {}}>{displayStatus}</span>
            </div>
            <div className="bc-body">
              <div className="bc-info" style={isBatal ? { textDecoration: 'line-through' } : {}}>
                <strong className="bc-nama">{booking.nama_pemesan || 'Tanpa Nama'}</strong>
                <span className="bc-waktu">📅 {booking.tanggal_main} | ⏰ {booking.jam_mulai.substring(0,5)} - {booking.jam_selesai.substring(0,5)} | ⏳ {durasi} Jam</span>
                <span className="bc-harga">💰 Tagihan: Rp {booking.total_harga.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="bc-actions">
                {isBatal ? (<span className="text-locked" style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ Pesanan Dibatalkan</span>) 
                : sudahLewat ? (isLunas ? (<span className="text-selesai" style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Booking Selesai</span>) : (<span className="text-locked" style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ Booking Hangus</span>)) 
                : (isLunas ? (<span className="text-lunas" style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔵 Booking Lunas</span>) : (
                    <>
                      {activeMenu === 'dashboard' && (<button className="btn-lunas" disabled={isLoadingBtn} onClick={() => handlePelunasanManual(booking.id)}>{isLoadingBtn ? '⏳' : '✅ Lunas'}</button>)}
                      {activeMenu === 'jadwal' && (bisaDibatalkan ? (
                          <>
                            <button className="btn-reschedule" onClick={() => bukaModalReschedule(booking)}>📅 Pindah</button>
                            <button className="btn-batal-pesanan" disabled={isLoadingBtn} onClick={() => handleBatalkanPesanan(booking.id)}>{isLoadingBtn ? '⏳' : '❌ Batal'}</button>
                          </>
                        ) : (<span className="text-locked" style={{ color: '#f59e0b', fontWeight: 'bold' }}>🔒 Terkunci (&lt; 1 Jam)</span>)
                      )}
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDashboardUtama = () => {
    let totalUangDashboard = 0;
    bookings.forEach(p => { 
      const s = p.status_pembayaran.toLowerCase(); 
      if (s.includes('dp') && !s.includes('batal')) totalUangDashboard += (p.total_harga / 2); 
      else if (s === 'lunas') totalUangDashboard += p.total_harga; 
    });

    const filteredBookings = bookings.filter(b => {
      const matchTanggal = filterTanggal ? b.tanggal_main === filterTanggal : true;
      const matchNama = searchName ? (b.nama_pemesan || '').toLowerCase().includes(searchName.toLowerCase()) : true;
      return matchTanggal && matchNama;
    });

    return (
      <>
        <div className="admin-cards mobile-compact-card">
          <div className="card-stat"><h3>💰 Total Pendapatan</h3><p className="stat-value text-green">Rp {totalUangDashboard.toLocaleString('id-ID')}</p></div>
          <div className="card-stat"><h3>🛒 Total Transaksi</h3><p className="stat-value">{bookings.length} Pesanan</p></div>
          <div className="card-stat desktop-only">
            <h3>🎛️ Operasional</h3>
            <p className={`stat-value ${getStatusTampilan().warna}`} style={{ fontSize: gorBuka ? '' : '1.4rem', marginBottom: '5px' }}>{getStatusTampilan().dot} {getStatusTampilan().teks}</p>
            {!gorBuka && gorTglMulai && (
              <div className="info-tutup-admin" style={{ fontSize: '0.8rem', lineHeight: '1.5', padding: '10px', whiteSpace: 'normal', textAlign: 'center' }}>
                Pada Tanggal {formatTglSingkat(gorTglMulai)} - {gorTglSampai ? formatTglSingkat(gorTglSampai) : '(Sampai batas waktu yang belum ditentukan)'}
                {!gorTglSampai && (
                  <>
                    {!isEditTgl ? (<span style={{ display: 'block', marginTop: '6px', fontSize: '0.75rem' }}>Tentukan waktu klik <strong style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIsEditTgl(true)}>disini</strong></span>) 
                    : (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold' }}>Pilih Tanggal Buka GOR:</p>
                        <input type="date" value={editTglValue} min={gorTglMulai ? new Date(new Date(gorTglMulai).getTime() + 86400000).toISOString().split('T')[0] : ''} onChange={(e) => setEditTglValue(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', outline: 'none', cursor: 'pointer', width: '100%' }} />
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button disabled={isLoadingBtn} onClick={handleSimpanBatasWaktu} style={{ background: '#10b981', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Simpan</button>
                          <button onClick={() => setIsEditTgl(false)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            <button disabled={isLoadingBtn} className={`btn-toggle ${gorBuka ? 'btn-danger' : 'btn-success'}`} style={{ marginTop: '10px' }} onClick={handleToggleGor}>{gorBuka ? 'Tutup GOR' : 'Buka GOR'}</button>
          </div>
        </div>
        <div className="admin-table-container">
          <div className="table-header">
            <h2>📋 Riwayat Pesanan</h2>
            <div className="table-controls">
              <input type="text" className="input-search" placeholder="🔍 Cari nama pelanggan..." value={searchName} onChange={(e) => setSearchName(e.target.value)} />
              <div className="table-actions">
                <input type="date" className="input-filter" value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} onFocus={(e) => e.target.showPicker && e.target.showPicker()} style={{ cursor: 'pointer' }} />
                <button onClick={() => { setFilterTanggal(''); setSearchName(''); fetchAdminData(); }} style={{ padding: '7px 12px', background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>🔄 Refresh</button>
              </div>
            </div>
          </div>
          {renderDaftarPesanan(filteredBookings)}
        </div>
      </>
    );
  };

  const renderKelolaJadwal = () => {
    const jadwalDifilter = bookings.filter(b => {
      if (statusJadwal !== 'semua') {
        let currentStatus = b.status_pembayaran.toLowerCase() === 'lunas' ? 'lunas' : b.status_pembayaran.toLowerCase() === 'batal' ? 'batal' : 'dp';
        if (currentStatus !== statusJadwal) return false; 
      }
      if (tanggalJadwal) return b.tanggal_main === tanggalJadwal;
      if (bulanJadwal !== 'semua') {
        const d = new Date(b.tanggal_main); return (d.getMonth() + 1) == parseInt(bulanJadwal) && d.getFullYear() == parseInt(tahunJadwal);
      }
      return true;
    }).sort((a, b) => {
      if (a.tanggal_main === b.tanggal_main) return a.jam_mulai.localeCompare(b.jam_mulai);
      return new Date(a.tanggal_main) - new Date(b.tanggal_main);
    });

    const daftarBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    let teksJudul = tanggalJadwal ? formatTglSingkat(tanggalJadwal) : bulanJadwal !== 'semua' ? `${daftarBulan[parseInt(bulanJadwal) - 1]} ${tahunJadwal}` : 'Semua Waktu';

    return (
      <div className="admin-table-container">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>📅 Jadwal: {teksJudul} ({jadwalDifilter.length})</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={() => setStatusJadwal('semua')} style={{ padding: '5px 15px', borderRadius: '20px', border: '1px solid #555', background: statusJadwal === 'semua' ? '#3b82f6' : '#222', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Semua</button>
              <button onClick={() => setStatusJadwal('lunas')} style={{ padding: '5px 15px', borderRadius: '20px', border: '1px solid #10b981', background: statusJadwal === 'lunas' ? '#10b981' : '#222', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Lunas</button>
              <button onClick={() => setStatusJadwal('dp')} style={{ padding: '5px 15px', borderRadius: '20px', border: '1px solid #f59e0b', background: statusJadwal === 'dp' ? '#f59e0b' : '#222', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>DP</button>
              <button onClick={() => setStatusJadwal('batal')} style={{ padding: '5px 15px', borderRadius: '20px', border: '1px solid #ef4444', background: statusJadwal === 'batal' ? '#ef4444' : '#222', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Batal</button>
            </div>
          </div>
          <div className="filter-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={bulanJadwal} onChange={(e) => { setBulanJadwal(e.target.value); setTanggalJadwal(''); }} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', outline: 'none', cursor: 'pointer' }}>
              <option value="semua">Semua Bulan</option>
              {daftarBulan.map((b, i) => <option key={i+1} value={i+1}>{b}</option>)}
            </select>
            <input type="number" value={tahunJadwal} onChange={(e) => { setTahunJadwal(e.target.value); setTanggalJadwal(''); }} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', outline: 'none', display: bulanJadwal === 'semua' ? 'none' : 'block' }} />
            <input type="date" value={tanggalJadwal} onChange={(e) => { setTanggalJadwal(e.target.value); setBulanJadwal('semua'); }} onClick={(e) => e.target.showPicker && e.target.showPicker()} onFocus={(e) => e.target.showPicker && e.target.showPicker()} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', outline: 'none', cursor: 'pointer' }} />
            <button onClick={() => { setTanggalJadwal(''); setBulanJadwal('semua'); }} style={{ padding: '8px 12px', background: (!tanggalJadwal && bulanJadwal === 'semua') ? '#10b981' : '#374151', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Semua Waktu</button>
          </div>
        </div>
        {renderDaftarPesanan(jadwalDifilter)}
      </div>
    );
  };

  const renderLaporanKeuangan = () => {
    // ... (Fungsi Laporan tetap sama persis)
    const dataLaporan = bookings.filter(b => {
      let matchWaktu = true;
      if (bulanLaporan !== 'semua') { const d = new Date(b.tanggal_main); matchWaktu = (d.getMonth() + 1) == parseInt(bulanLaporan) && d.getFullYear() == parseInt(tahunLaporan); }
      return matchWaktu && (searchName ? (b.nama_pemesan || '').toLowerCase().includes(searchName.toLowerCase()) : true);
    });

    let totalLunas = 0; let totalDP = 0;
    dataLaporan.forEach(b => { 
      if (b.status_pembayaran.toLowerCase() === 'lunas') totalLunas += b.total_harga; 
      else if (b.status_pembayaran.toLowerCase().includes('dp') && !b.status_pembayaran.toLowerCase().includes('batal')) totalDP += (b.total_harga / 2); 
    });

    const daftarBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return (
      <div className="laporan-wrapper">
        <div className="laporan-header-filter">
          <h2>📊 Rekapitulasi Kas {bulanLaporan === 'semua' ? 'Semua Waktu' : `${daftarBulan[parseInt(bulanLaporan) - 1]} ${tahunLaporan}`}</h2>
          <div className="filter-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={bulanLaporan} onChange={(e) => setBulanLaporan(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', outline: 'none', cursor: 'pointer' }}><option value="semua">Semua Bulan</option>{daftarBulan.map((b, i) => <option key={i+1} value={i+1}>{b}</option>)}</select>
            <input type="number" value={tahunLaporan} onChange={(e) => setTahunLaporan(e.target.value)} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #555', background: '#222', color: '#fff', outline: 'none' }} />
            <button onClick={() => setBulanLaporan('semua')} style={{ padding: '8px 12px', background: bulanLaporan === 'semua' ? '#10b981' : '#374151', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Semua Waktu</button>
          </div>
        </div>
        <div className="laporan-summary-cards">
          <div className="summary-box lunas"><span>Total Lunas (Masuk)</span><h3>Rp {totalLunas.toLocaleString('id-ID')}</h3></div>
          <div className="summary-box dp"><span>Total DP (Ditahan)</span><h3>Rp {totalDP.toLocaleString('id-ID')}</h3></div>
          <div className="summary-box bersih"><span>Total Bersih</span><h2>Rp {(totalLunas + totalDP).toLocaleString('id-ID')}</h2></div>
        </div>
        <div className="laporan-log-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>Rincian Transaksi ({dataLaporan.length})</h3>
            <div className="search-box-laporan"><input type="text" className="input-laporan" placeholder="🔍 Cari nama pelanggan..." value={searchName} onChange={(e) => setSearchName(e.target.value)} /><button onClick={() => { setSearchName(''); fetchAdminData(); }} style={{ padding: '7px 12px', background: '#2a2a2a', color: '#fff', border: '1px solid #444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>🔄 Refresh</button></div>
          </div>
          <div className="laporan-list">
            {dataLaporan.length === 0 ? <p className="empty-log">Tidak ada transaksi yang sesuai pencarian.</p> : dataLaporan.map((b, i) => {
              const isBatal = b.status_pembayaran.toLowerCase() === 'batal'; const isLunas = b.status_pembayaran.toLowerCase() === 'lunas';
              let nominal = isBatal ? 0 : (isLunas ? b.total_harga : b.total_harga / 2);
              return (
                <div className="laporan-item" key={i} style={isBatal ? { opacity: 0.6 } : {}}>
                  <div className="lap-info"><strong style={isBatal ? { textDecoration: 'line-through' } : {}}>{b.tanggal_main}</strong><span style={isBatal ? { textDecoration: 'line-through' } : {}}>{b.nama_pemesan} - {b.nama_lapangan}</span></div>
                  <div className="lap-nominal" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}><span className={`lap-badge ${isLunas ? 'lunas' : 'dp'}`} style={isBatal ? { background: '#ef4444', color: 'white' } : {}}>{isBatal ? 'BATAL' : (isLunas ? 'LUNAS' : 'DP')}</span><span className={isLunas ? 'text-blue' : 'text-yellow'} style={{ whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '0.95rem', color: isBatal ? '#ef4444' : '' }}>{isBatal ? '- Rp 0' : `+ Rp ${nominal.toLocaleString('id-ID')}`}</span></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderKelolaPromo = () => {
    return (
      <div className="admin-table-container">
        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <h2>🏷️ Kelola Promo Harga</h2>
          <button onClick={() => setIsPromoModalOpen(true)} style={{ padding: '10px 15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ Buat Promo Baru</button>
        </div>
        <div className="booking-list" style={{ marginTop: '20px' }}>
          {promos.length === 0 && <p className="empty-log">Belum ada promo yang dibuat.</p>}
          {promos.map((promo) => (
            <div className="booking-card" key={promo.id} style={!promo.is_active ? { opacity: 0.6 } : { borderLeft: '5px solid #10b981' }}>
              <div className="bc-header"><span className="bc-lapangan" style={{ color: '#fff', fontSize: '1.1rem' }}>🎉 {promo.nama_promo}</span><span className="lap-badge" style={{ background: promo.is_active ? '#10b981' : '#6b7280', color: 'white' }}>{promo.is_active ? 'AKTIF' : 'NON-AKTIF'}</span></div>
              <div className="bc-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div className="bc-info">
                  <span className="bc-waktu">📅 Berlaku: {formatTglSingkat(promo.tgl_mulai)} s/d {formatTglSingkat(promo.tgl_selesai)}</span>
                  {/* Handle tampilan 23:59:00 kembali menjadi 24:00 di layar */}
                  <span className="bc-waktu">⏰ Jam: {promo.jam_mulai.substring(0,5)} - {promo.jam_selesai === '23:59:00' ? '24:00' : promo.jam_selesai.substring(0,5)} WIB</span>
                  <span className="bc-waktu">⏳ Syarat: Minimal Main {promo.minimal_jam_main} Jam</span>
                  <span className="bc-harga">💰 Harga Diskon: Rp {promo.harga_promo.toLocaleString('id-ID')}/Jam</span>
                </div>
                <div className="bc-actions" style={{ display: 'flex', gap: '10px' }}>
                  <button disabled={isLoadingBtn} onClick={() => handleTogglePromo(promo.id, promo.is_active)} style={{ padding: '8px 12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: isLoadingBtn ? 'not-allowed' : 'pointer', background: promo.is_active ? '#f59e0b' : '#3b82f6', color: '#fff' }}>{isLoadingBtn ? '⏳' : (promo.is_active ? 'Matikan' : 'Aktifkan')}</button>
                  <button disabled={isLoadingBtn} onClick={() => handleHapusPromo(promo.id)} style={{ padding: '8px 12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: isLoadingBtn ? 'not-allowed' : 'pointer', background: '#ef4444', color: '#fff' }}>{isLoadingBtn ? '⏳' : '🗑️ Hapus'}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const slotJam = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  let durasiJamAsli = selectedBooking ? parseInt(selectedBooking.jam_selesai.split(':')[0]) - parseInt(selectedBooking.jam_mulai.split(':')[0]) : 1;
  let jamPenuhBeneran = Array.isArray(jamPenuhModal) ? [...jamPenuhModal] : [];
  if (selectedBooking && selectedBooking.tanggal_main === editTanggal) {
    for(let i = parseInt(selectedBooking.jam_mulai ? selectedBooking.jam_mulai.split(':')[0] : '0'); i < parseInt(selectedBooking.jam_selesai ? selectedBooking.jam_selesai.split(':')[0] : '0'); i++) {
      jamPenuhBeneran = jamPenuhBeneran.filter(j => j !== `${i < 10 ? '0' : ''}${i}:00`);
    }
  }

  const cekJamMulaiAman = (jamCek) => {
    for(let i = 0; i < durasiJamAsli; i++) {
      const jamDicek = parseInt(jamCek.split(':')[0]) + i;
      if (jamPenuhBeneran.includes(`${jamDicek < 10 ? '0' : ''}${jamDicek}:00`) || jamDicek > 23) return false; 
    }
    return true;
  };
  let exactJamSelesai = editJamMulai ? `${parseInt(editJamMulai.split(':')[0]) + durasiJamAsli < 10 ? '0' : ''}${parseInt(editJamMulai.split(':')[0]) + durasiJamAsli}:00` : '';

  return (
    <div className="admin-layout">
      <div className="mobile-header">
        <div style={{display: 'flex', alignItems: 'center'}}><button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button><h2>🏸 GOR Admin</h2></div>
        <button className={`btn-mobile-toggle ${gorBuka ? 'buka' : 'tutup'}`} onClick={handleToggleGor}>{gorBuka ? '🟢 BUKA' : '🔴 TUTUP'}</button>
      </div>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand"><h2>🏸 GOR Admin</h2></div>
        <ul className="sidebar-menu">
          <li className={activeMenu === 'dashboard' ? 'active' : ''} onClick={() => { setActiveMenu('dashboard'); setIsSidebarOpen(false); }}>📊 Dashboard</li>
          <li className={activeMenu === 'jadwal' ? 'active' : ''} onClick={() => { setActiveMenu('jadwal'); setIsSidebarOpen(false); }}>📅 Kelola Jadwal</li>
          <li className={activeMenu === 'promo' ? 'active' : ''} onClick={() => { setActiveMenu('promo'); setIsSidebarOpen(false); }}>🏷️ Kelola Promo</li>
          <li className={activeMenu === 'laporan' ? 'active' : ''} onClick={() => { setActiveMenu('laporan'); setIsSidebarOpen(false); }}>💰 Laporan Keuangan</li>
        </ul>
        <button className="btn-logout" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>{activeMenu === 'dashboard' ? 'Dashboard' : activeMenu === 'jadwal' ? 'Kelola Jadwal' : activeMenu === 'promo' ? 'Kelola Promo' : 'Laporan Keuangan'}</h1>
          <div className="admin-profile-pill"><span>Hai, <strong>{namaAdmin}</strong> 👋</span></div>
        </header>
        {activeMenu === 'dashboard' && renderDashboardUtama()}
        {activeMenu === 'jadwal' && renderKelolaJadwal()}
        {activeMenu === 'promo' && renderKelolaPromo()}
        {activeMenu === 'laporan' && renderLaporanKeuangan()}
      </main>

      {/* POP-UP TUTUP GOR & ALERT LAINNYA */}
      {alertConfig.isOpen && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box">
            {alertConfig.type === 'form_tutup' ? (
              <>
                <div className="custom-alert-icon">🚧</div><h2 className="custom-alert-title">Tutup GOR</h2>
                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                  <div className="form-group"><label>Pesan:</label><input type="text" value={formTutup.pesan} onChange={(e) => setFormTutup({...formTutup, pesan: e.target.value})} /></div>
                  <div className="form-group-flex">
                    <div className="form-group">
                      <label>Mulai:</label>
                      <input type="date" value={formTutup.tglMulai} min={minHariIni} onChange={(e) => { const tglBaru = e.target.value; if (formTutup.tglSampai && formTutup.tglSampai <= tglBaru) { setFormTutup({...formTutup, tglMulai: tglBaru, tglSampai: ''}); } else { setFormTutup({...formTutup, tglMulai: tglBaru}); } }} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                    </div>
                    <div className="form-group">
                      <label>Sampai (Opsional):</label>
                      <input type="date" value={formTutup.tglSampai} min={formTutup.tglMulai ? new Date(new Date(formTutup.tglMulai).getTime() + 86400000).toISOString().split('T')[0] : minHariIni} onChange={(e) => setFormTutup({...formTutup, tglSampai: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                    </div>
                  </div>
                </div>
                <div className="custom-alert-actions"><button className="btn-alert-cancel" onClick={closeAlert}>Batal</button><button disabled={isLoadingBtn} className="btn-alert-confirm danger" onClick={() => executeToggleGor('tutup', { pesan: formTutup.pesan, tgl_mulai: formTutup.tglMulai, tgl_sampai: formTutup.tglSampai })}>{isLoadingBtn ? '⏳' : 'Tutup GOR'}</button></div>
              </>
            ) : (
              <>
                <div className="custom-alert-icon">{alertConfig.icon}</div><h2 className="custom-alert-title">{alertConfig.title}</h2><p className="custom-alert-message">{alertConfig.message}</p>
                <div className="custom-alert-actions">{alertConfig.type === 'confirm' && <button className="btn-alert-cancel" onClick={closeAlert}>Batal</button>}<button disabled={isLoadingBtn} className={`btn-alert-confirm ${alertConfig.isDanger ? 'danger' : ''}`} onClick={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else closeAlert(); }}>{isLoadingBtn ? '⏳' : alertConfig.confirmText}</button></div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 👇 POP-UP BUAT PROMO BARU (UI DROPDOWN JAM & LOGIKA TGL + 1) 👇 */}
      {isPromoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <h2>🏷️ Buat Promo Baru</h2>
            
            <div className="form-group">
              <label>Nama Promo (Opsional):</label>
              <input type="text" placeholder="Masukan Nama Promo..." value={formPromo.nama_promo} onChange={(e) => setFormPromo({...formPromo, nama_promo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff' }}/>
            </div>

            <div className="form-group-flex" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Tgl Mulai:</label>
                <input type="date" value={formPromo.tgl_mulai} min={minHariIni} onChange={(e) => {
                    const baruTglMulai = e.target.value;
                    // Reset tanggal selesai kalau tanggal selesainya lebih kecil atau sama dengan tanggal mulai baru
                    if(formPromo.tgl_selesai && formPromo.tgl_selesai <= baruTglMulai) {
                      setFormPromo({...formPromo, tgl_mulai: baruTglMulai, tgl_selesai: ''});
                    } else { setFormPromo({...formPromo, tgl_mulai: baruTglMulai}); }
                  }} onClick={(e) => e.target.showPicker && e.target.showPicker()} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff', cursor: 'pointer' }}/>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Tgl Selesai:</label>
                {/* Min Tgl Selesai = Tgl Mulai + 1 Hari */}
                <input type="date" value={formPromo.tgl_selesai} min={getMinTglSelesaiPromo()} onChange={(e) => setFormPromo({...formPromo, tgl_selesai: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff', cursor: 'pointer' }}/>
              </div>
            </div>

            <div className="form-group-flex" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Jam Berlaku (Mulai):</label>
                <select value={formPromo.jam_mulai} onChange={(e) => setFormPromo({...formPromo, jam_mulai: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff', cursor: 'pointer' }}>
                  <option value="" disabled>-- Pilih Jam --</option>
                  {opsiJamPromo.slice(0, -1).map(jam => <option key={jam} value={jam}>{jam}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Jam Berlaku (Selesai):</label>
                <select value={formPromo.jam_selesai} onChange={(e) => setFormPromo({...formPromo, jam_selesai: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff', cursor: 'pointer' }}>
                  <option value="" disabled>-- Pilih Jam --</option>
                  {opsiJamPromo.map(jam => <option key={jam} value={jam}>{jam}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group-flex" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Syarat Min. Main (Jam):</label>
                <input type="number" min="1" value={formPromo.minimal_jam_main} onChange={(e) => setFormPromo({...formPromo, minimal_jam_main: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff' }}/>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Harga Promo (Rp/Jam):</label>
                <input type="number" placeholder="Cth: 20000" value={formPromo.harga_promo} onChange={(e) => setFormPromo({...formPromo, harga_promo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff' }}/>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '25px' }}>
              <button className="btn-batal" onClick={() => setIsPromoModalOpen(false)}>Batal</button>
              <button disabled={isLoadingBtn} className="btn-simpan" onClick={handleSimpanPromo}>{isLoadingBtn ? '⏳ Memproses...' : 'Simpan Promo'}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* POP-UP RESCHEDULE */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>📅 Pindah Jadwal - {selectedBooking?.nama_pemesan}</h2>
            <div className="form-group">
              <label>Tanggal Baru:</label>
              <input type="date" value={editTanggal} onChange={(e) => { setEditTanggal(e.target.value); setEditJamMulai(''); setEditJamSelesai(''); }} onClick={(e) => e.target.showPicker && e.target.showPicker()} style={{ cursor: 'pointer', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff', outline: 'none', width: '100%' }} />
            </div>
            <div className="form-group-flex" style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Jam Mulai:</label>
                <select value={editJamMulai} onChange={(e) => { const newMulai = e.target.value; setEditJamMulai(newMulai); setEditJamSelesai(`${parseInt(newMulai.split(':')[0]) + durasiJamAsli < 10 ? '0' : ''}${parseInt(newMulai.split(':')[0]) + durasiJamAsli}:00`); }} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#222', color: '#fff', outline: 'none', cursor: 'pointer', width: '100%' }}>
                  <option value="" disabled>-- Pilih --</option>
                  {slotJam.map(jam => { const aman = cekJamMulaiAman(jam); return (<option key={jam} value={jam} disabled={!aman}>{jam} {!aman ? '(Penuh/Bentrok)' : ''}</option>) })}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Jam Selesai (Otomatis):</label>
                <select value={editJamSelesai} onChange={() => {}} disabled style={{ padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#333', color: '#aaa', outline: 'none', cursor: 'not-allowed', width: '100%' }}>
                  {!exactJamSelesai && <option value="">--</option>}{exactJamSelesai && <option value={exactJamSelesai}>{exactJamSelesai} ({durasiJamAsli} Jam)</option>}
                </select>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '25px' }}>
              <button className="btn-batal" onClick={() => setIsModalOpen(false)}>Batal</button>
              <button disabled={isLoadingBtn || !editJamMulai || !editJamSelesai} className="btn-simpan" onClick={simpanReschedule}>{isLoadingBtn ? '⏳' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}