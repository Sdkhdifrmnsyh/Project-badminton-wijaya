import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import '../App.css'

function LapanganCard({ lapangan, index, tanggal, namaPemesan, showAlert, promosAktif }) {
  const [jamMulai, setJamMulai] = useState('');
  const [durasi, setDurasi] = useState(1);
  const [jamPenuh, setJamPenuh] = useState([]);
  const [opsiBayar, setOpsiBayar] = useState('dp');
  const [isLoading, setIsLoading] = useState(false); 

  const slotJam = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  const timeZoneOffset = (new Date()).getTimezoneOffset() * 60000;
  const hariIniStr = (new Date(Date.now() - timeZoneOffset)).toISOString().split('T')[0];

  useEffect(() => {
    if (!tanggal) { setJamPenuh([]); return; }
    axios.get(`https://gor-wijaya.page.gd/api/booking/cek-jadwal?lapangan_id=${lapangan.id}&tanggal_main=${tanggal}`)
      .then((response) => {
        const dataJadwal = response.data?.data || response.data;
        setJamPenuh(Array.isArray(dataJadwal) ? dataJadwal : []);
      }).catch(err => console.error(err));
  }, [tanggal, lapangan.id]); 

  const cekJamSudahLewat = (jamPilihan) => {
    if (tanggal === hariIniStr) {
      const jamSekarang = new Date().getHours(); 
      const jamDiPilih = parseInt(jamPilihan.split(':')[0]); 
      if (jamDiPilih <= jamSekarang) return true;
    }
    return false;
  };

  const cekDurasiAman = (startJam, cekDurasi) => {
    if (!startJam) return false;
    const startAngka = parseInt(startJam.split(':')[0]);
    for (let i = 0; i < cekDurasi; i++) {
      let jamDiperiksa = startAngka + i;
      let formatJam = `${jamDiperiksa < 10 ? '0' : ''}${jamDiperiksa}:00`;
      if (Array.isArray(jamPenuh) && jamPenuh.includes(formatJam) || jamDiperiksa > 23) return false; 
    }
    return true; 
  };

  const cekJamDalamDurasi = (jamPilihan) => {
    if (!jamMulai) return false;
    const start = parseInt(jamMulai.split(':')[0]);
    const current = parseInt(jamPilihan.split(':')[0]);
    return current >= start && current < start + durasi;
  };

  let jamSelesaiTampil = '';
  if (jamMulai) {
    const jamSelesaiHitung = parseInt(jamMulai.split(':')[0]) + durasi;
    jamSelesaiTampil = `${jamSelesaiHitung < 10 ? '0' : ''}${jamSelesaiHitung}:00`;
  }

  const hitungTotalHarga = () => {
    if (!jamMulai || !tanggal) return 0;
    let total = 0;
    const startJam = parseInt(jamMulai.split(':')[0]);
    const tglPilih = new Date(tanggal); tglPilih.setHours(0,0,0,0);

    for (let i = 0; i < durasi; i++) {
      let currentJam = startJam + i;
      let hargaJamIni = lapangan.harga_per_jam || 0; 
      let hargaPromoTermurah = hargaJamIni;

      if (Array.isArray(promosAktif)) {
        promosAktif.forEach(promo => {
          const promoMulai = new Date(promo.tgl_mulai); promoMulai.setHours(0,0,0,0);
          const promoSelesai = new Date(promo.tgl_selesai); promoSelesai.setHours(0,0,0,0);
          const jamPromoMulai = parseInt(promo.jam_mulai.split(':')[0]);
          const jamPromoSelesai = parseInt(promo.jam_selesai.split(':')[0]);

          if (tglPilih >= promoMulai && tglPilih <= promoSelesai) {
            if (currentJam >= jamPromoMulai && currentJam < jamPromoSelesai) {
              if (durasi >= promo.minimal_jam_main) {
                if (promo.harga_promo < hargaPromoTermurah) hargaPromoTermurah = promo.harga_promo;
              }
            }
          }
        });
      }
      total += hargaPromoTermurah; 
    }
    return total;
  };

  const totalHarga = hitungTotalHarga();
  const hargaNormal = (lapangan.harga_per_jam || 0) * durasi;
  const isDapatPromo = totalHarga < hargaNormal;
  const jumlahHemat = hargaNormal - totalHarga; 

  const handleBooking = () => {
    if(!namaPemesan || !tanggal || !jamMulai) {
      showAlert("Data Belum Lengkap", "Tolong isi Nama Pemesan, Tanggal, dan klik Jam main terlebih dahulu!", "⚠️");
      return; 
    }
    setIsLoading(true); 

    const dataPesanan = {
      user_id: null, nama_pemesan: namaPemesan, lapangan_id: lapangan.id,
      tanggal_main: tanggal, jam_mulai: jamMulai, jam_selesai: jamSelesaiTampil, opsi_bayar: opsiBayar, total_harga: totalHarga 
    };

    axios.post('https://gor-wijaya.page.gd/api/booking', dataPesanan)
      .then((response) => {
        const token = response.data?.data?.snap_token;
        const bookingId = response.data?.data?.id;
        if(token) {
          window.snap.pay(token, {
            onSuccess: function(){ 
              axios.put(`https://gor-wijaya.page.gd/api/booking/sukses/${bookingId}`)
                .then(() => {
                  showAlert("Pembayaran Sukses!", `Jadwal atas nama ${namaPemesan} telah dibooking.`, "✅"); 
                  axios.get(`https://gor-wijaya.page.gd/api/booking/cek-jadwal?lapangan_id=${lapangan.id}&tanggal_main=${tanggal}`)
                    .then(res => {
                      const dataJadwal = res.data?.data || res.data;
                      setJamPenuh(Array.isArray(dataJadwal) ? dataJadwal : []);
                    });
                  setJamMulai(''); setDurasi(1); setIsLoading(false); 
                });
            },
            onPending: function(){ showAlert("Menunggu", "Selesaikan pembayaran Anda.", "⏳"); setIsLoading(false); },
            onError: function(){ showAlert("Gagal", "Pembayaran Gagal diproses!", "❌"); setIsLoading(false); },
            onClose: function(){ 
            // Kalau pop-up ditutup, suruh API menghapus datanya dari database
            axios.delete(`https://gor-wijaya.page.gd/api/booking/batal-bayar/${bookingId}`)
              .then(() => {
                showAlert("Dibatalkan", "Anda telah menutup menu pembayaran.", "ℹ️"); 
                setIsLoading(false); 
              })
              .catch(() => {
                setIsLoading(false);
              });
          }
          });
        }
      })
      .catch(() => { showAlert("Error Server", "Gagal menyambung ke server.", "🔌"); setIsLoading(false); });
  }; 

  return (
    <div className="lapangan-card">
      <img src={`/lapangan_${index === 0 ? 'A' : 'B'}.jpg`} alt={lapangan.nama_lapangan} className="lapangan-img" onError={(e) => {e.target.onerror = null; e.target.src = `/lapangan_${index + 1}.jpg`}} />
      <div className="card-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>{lapangan.nama_lapangan}</h2>
          {tanggal && (
            <div style={{ backgroundColor: '#2a2a2a', padding: '6px 10px', borderRadius: '8px', borderLeft: '4px solid #10b981', color: '#e5e7eb', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📅 <span style={{ opacity: 0.8 }}>Tanggal:</span> 
              <strong style={{ color: '#10b981' }}>{new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          )}
        </div>
        <div className="info-lapangan">
          <p> <strong>Ukuran Lapangan:</strong> 13.4m x 6.1m</p><p> <strong>Tinggi Net:</strong> 1.5m</p><p> <strong>Jenis Lantai:</strong> {lapangan.jenis_lantai}</p>
        </div>
        <p className="harga">Rp {(lapangan.harga_per_jam || 0).toLocaleString('id-ID')}<span>/jam</span></p>

        <div className="slot-jam-wrapper">
          <p>Pilih Jam Mulai:</p>
          <div className="slot-jam-container">
            {slotJam.map((jam) => {
              const isPenuh = Array.isArray(jamPenuh) && jamPenuh.includes(jam);
              const sudahLewat = cekJamSudahLewat(jam);
              const isDisabled = isPenuh || sudahLewat;
              const isDalamDurasi = cekJamDalamDurasi(jam);
              return (
                <button key={jam} disabled={isDisabled} className={`btn-slot ${isDalamDurasi ? 'aktif' : ''} ${isPenuh ? 'penuh' : ''}`} onClick={() => {setJamMulai(jam); setDurasi(1)}} style={{ opacity: sudahLewat ? 0.4 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer', textDecoration: sudahLewat ? 'line-through' : 'none' }}>
                  {isPenuh ? 'Penuh' : jam}
                </button>
              );
            })}
          </div>
        </div>

        {jamMulai && (
          <div className="durasi-wrapper">
            <p>Durasi Main:</p>
            <div className="durasi-container">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((opsi) => {
                const aman = cekDurasiAman(jamMulai, opsi);
                return (<button key={opsi} disabled={!aman} className={`btn-durasi ${durasi === opsi ? 'aktif' : ''} ${!aman ? 'penuh' : ''}`} onClick={() => setDurasi(opsi)}>{opsi} Jam</button>);
              })}
            </div>
            <p className="indikator-jam">✅ Waktu Main: <strong>{jamMulai} - {jamSelesaiTampil}</strong></p>
          </div>
        )}

        {jamMulai && (
           <div className="rincian-harga" style={{ background: isDapatPromo ? '#10b98115' : '#2a2a2a', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: isDapatPromo ? '1px dashed #10b981' : '1px solid #444', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#e5e7eb', fontSize: '0.9rem' }}>Harga Normal:</span><span style={{ textDecoration: isDapatPromo ? 'line-through' : 'none', color: isDapatPromo ? '#ef4444' : '#fff', fontSize: '0.9rem' }}>Rp {hargaNormal.toLocaleString('id-ID')}</span>
              </div>
              {/* BARIS BARU (flex-start + gap) */}
          {isDapatPromo && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#ffffff', fontSize: '0.9rem' }}>Potongan Promo:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>-Rp {jumlahHemat.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #444' }}>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>Total Bayar:</strong><strong style={{ fontSize: '1.3rem', color: isDapatPromo ? '#10b981' : '#3b82f6' }}>Rp {totalHarga.toLocaleString('id-ID')}</strong>
              </div>
           </div>
        )}

        {jamMulai && (
          <div className="opsi-bayar-wrapper">
            <p>Pilih Metode Pembayaran:</p>
            <div className="opsi-bayar-container">
              <label className={`opsi-label ${opsiBayar === 'dp' ? 'aktif' : ''}`}><input type="radio" value="dp" checked={opsiBayar === 'dp'} onChange={() => setOpsiBayar('dp')} /> Bayar DP 50% (Rp {(totalHarga / 2).toLocaleString('id-ID')})</label>
              <label className={`opsi-label ${opsiBayar === 'lunas' ? 'aktif' : ''}`}><input type="radio" value="lunas" checked={opsiBayar === 'lunas'} onChange={() => setOpsiBayar('lunas')} /> Bayar Lunas (Rp {totalHarga.toLocaleString('id-ID')})</label>
            </div>
          </div>
        )}

        <button className="btn-pilih" onClick={handleBooking} disabled={isLoading} style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: isLoading ? '#6b7280' : '' }}>{isLoading ? '⏳ Memproses...' : 'Booking Sekarang'}</button>
      </div>
    </div>
  )
}

function UserPage() {
  const [daftarLapangan, setDaftarLapangan] = useState([]);
  const [tanggal, setTanggal] = useState('');
  const [namaPemesan, setNamaPemesan] = useState('');
  const [gorInfo, setGorInfo] = useState({ status_db: 'buka', pesan: '', tglMulai: '', tglSampai: '' });
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', icon: '' });
  const [showBanner, setShowBanner] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const lastStatusRef = useRef('buka'); 
  const [promosAktif, setPromosAktif] = useState([]); 

  const showAlert = (title, message, icon) => setAlertConfig({ isOpen: true, title, message, icon });
  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  const timeZoneOffset = (new Date()).getTimezoneOffset() * 60000;
  const hariIniStr = (new Date(Date.now() - timeZoneOffset)).toISOString().split('T')[0];

  useEffect(() => {
    axios.get('https://gor-wijaya.page.gd/api/lapangan')
      .then((res) => {
        const dataLap = res.data?.data || res.data; 
        setDaftarLapangan(Array.isArray(dataLap) ? dataLap : []);
      }).catch(err => { console.error("Error Lapangan:", err); setDaftarLapangan([]); });

    axios.get('https://gor-wijaya.page.gd/api/promos/active')
      .then((res) => {
        const dataPromo = res.data?.data || res.data;
        setPromosAktif(Array.isArray(dataPromo) ? dataPromo : []);
      }).catch(err => { console.error("Error Promo:", err); setPromosAktif([]); });

    const cekStatusRealTime = () => {
      axios.get(`https://gor-wijaya.page.gd/api/gor/status?_t=${new Date().getTime()}`)
        .then((res) => {
          if (res.data) {
            const statusDb = res.data.status_db;
            setGorInfo({ status_db: statusDb, pesan: res.data.pesan, tglMulai: res.data.tgl_mulai, tglSampai: res.data.tgl_sampai });
            if (statusDb === 'tutup' && lastStatusRef.current !== 'tutup') {
              setShowBanner(true); setHasUnread(true); lastStatusRef.current = 'tutup';
            } else if (statusDb === 'buka' && lastStatusRef.current !== 'buka') {
              setShowBanner(false); setHasUnread(false); lastStatusRef.current = 'buka';
            }
          }
        }).catch(err => console.error("Error Status:", err));
    };
    cekStatusRealTime();
    const intervalId = setInterval(cekStatusRealTime, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const formatTgl = (tgl) => {
    if(!tgl) return ''; return new Date(tgl).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const cekApakahTanggalIniTutup = () => {
    if (!tanggal) return false; 
    if (gorInfo.status_db !== 'tutup') return false; 
    const dPilihan = new Date(tanggal).setHours(0,0,0,0);
    if (!gorInfo.tglMulai) return true; 
    const dMulai = new Date(gorInfo.tglMulai).setHours(0,0,0,0);
    if (gorInfo.tglSampai) {
      const dSampai = new Date(gorInfo.tglSampai).setHours(0,0,0,0);
      return dPilihan >= dMulai && dPilihan <= dSampai; 
    } else { return dPilihan >= dMulai; }
  };

  const isTutup = cekApakahTanggalIniTutup();
  const adaPengumuman = gorInfo.status_db === 'tutup' || (Array.isArray(promosAktif) && promosAktif.length > 0);

  return (
    <div className="app-container">
      {adaPengumuman && (<div className="bell-notification" onClick={() => { setShowBanner(!showBanner); setHasUnread(false); }}>🔔{hasUnread && <span className="red-dot"></span>}</div>)}
      {adaPengumuman && showBanner && (
        <div className="floating-announcement" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <button className="fa-close" onClick={() => setShowBanner(false)}>✖</button>
          {gorInfo.status_db === 'tutup' && (
            <div style={{ marginBottom: '15px' }}>
              <div className="fa-header"><span>⚠️</span> GOR TUTUP</div>
              <div className="fa-body">Mohon maaf, GOR tidak beroperasi sementara pada:<div className="fa-date">📅 {formatTgl(gorInfo.tglMulai)} {gorInfo.tglSampai ? ` - ${formatTgl(gorInfo.tglSampai)}` : ''}</div></div>
            </div>
          )}
          {Array.isArray(promosAktif) && promosAktif.length > 0 && (
             <div>
                <div className="fa-header" style={{ color: '#ffffff' }}>INFO PROMO SAAT INI</div>
                <div className="fa-body" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <ul style={{ paddingLeft: '20px', margin: '8px 0', textAlign: 'left' }}>
                    {promosAktif.map(p => {
                      const tglMulai = new Date(p.tgl_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                      const tglSelesai = new Date(p.tgl_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                      return (<li key={p.id} style={{ marginBottom: '6px' }}><strong>{p.nama_promo} ({tglMulai} - {tglSelesai})</strong><br/>Hanya <strong style={{color: '#ffffff'}}>Rp {p.harga_promo.toLocaleString('id-ID')}/jam</strong> (Minimal Main {p.minimal_jam_main} Jam)</li>);
                    })}
                  </ul>
                </div>
             </div>
          )}
        </div>
      )}

      <header className="header"><h1>Selamat Datang Di GOR Badminton Wijaya</h1><p>Silahkan pilih tanggal main untuk melihat jadwal yang tersedia.</p></header>

      <div className="booking-form">
        <h3>📝 Data Pemesan & Jadwal</h3>
        <div className="input-group">
          <input type="text" placeholder="Nama Pemesan..." value={namaPemesan} onChange={(e) => setNamaPemesan(e.target.value)} style={{ width: '200px' }} />
          <input type="date" value={tanggal} min={hariIniStr} onChange={(e) => setTanggal(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} />        
        </div>
      </div>
      
      {isTutup ? (
        <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '40px 20px', textAlign: 'center', borderRadius: '15px', border: '4px solid #b91c1c', margin: '20px auto', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '15px', fontWeight: '900' }}>⛔ MOHON MAAF, GOR TUTUP ⛔</h2>
          <div style={{ backgroundColor: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '20px', display: 'inline-block', fontWeight: 'bold' }}>Dari tanggal: {formatTgl(gorInfo.tglMulai)} {gorInfo.tglSampai ? ` sampai ${formatTgl(gorInfo.tglSampai)}` : ' sampai batas waktu yang belum ditentukan'}</div>
          <p style={{ fontSize: '1.2rem', lineHeight: '1.6', fontWeight: '500' }}>{gorInfo.pesan || "Saat ini Anda tidak dapat melakukan pemesanan."}</p>
        </div>
      ) : (
        <div className="lapangan-grid">
          {Array.isArray(daftarLapangan) && daftarLapangan.map((lapangan, index) => (
            <LapanganCard key={lapangan.id} lapangan={lapangan} index={index} tanggal={tanggal} namaPemesan={namaPemesan} showAlert={showAlert} promosAktif={promosAktif} />
          ))}
        </div>
      )}

      {alertConfig.isOpen && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box"><div className="custom-alert-icon">{alertConfig.icon}</div><h2 className="custom-alert-title">{alertConfig.title}</h2><p className="custom-alert-message">{alertConfig.message}</p><div className="custom-alert-actions"><button className="btn-alert-confirm" onClick={closeAlert}>Tutup</button></div></div>
        </div>
      )}
    </div>
  )
}

export default UserPage