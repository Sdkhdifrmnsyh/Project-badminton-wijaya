import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import '../appCustomer.css';

// 👇 Tambahkan setWaError di dalam kurung kurawal ini
function LapanganCard({ lapangan, index, tanggal, namaPemesan, noWa, showAlert, promosAktif, setWaError, waInputRef, resetDataPemesan }) {  
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
    axios.get(`http://127.0.0.1:8000/api/booking/cek-jadwal?lapangan_id=${lapangan.id}&tanggal_main=${tanggal}`)
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

  // 👇 PERBAIKAN LOGIKA PROMO BARU (Dilengkapi Anti-Tanggal Merah) 👇
  const hargaNormal = (lapangan.harga_per_jam || 30000) * durasi;
  let totalHarga = hargaNormal;
  let potongan = 0;
  let isDapatPromo = false;

  if (jamMulai && tanggal && promosAktif && promosAktif.length > 0) {
    const hariIni = new Date(tanggal).getDay(); 
    const hariDb = hariIni === 0 ? '7' : hariIni.toString(); 
    const jamPilihInt = parseInt(jamMulai.split(':')[0]); 

    // Daftar Tanggal Merah (Sama dengan Backend)
    const tanggalMerah = [
        '2026-01-01', '2026-02-16', '2026-02-17', '2026-03-18', 
        '2026-03-19', '2026-03-23', '2026-03-24', '2026-05-14', 
        '2026-05-27', '2026-05-28', '2026-06-01', '2026-06-16', 
        '2026-08-17', '2026-08-25', '2026-12-24'
    ];

    const promoAktif = promosAktif.find(p => {
      const cekHari = !p.hari_spesifik || p.hari_spesifik === '' || p.hari_spesifik.split(',').includes(hariDb);
      const jamMulaiPromoInt = parseInt((p.jam_mulai || '00:00').split(':')[0]);
      const jamSelesaiPromoInt = parseInt((p.jam_selesai || '23:59').split(':')[0]);
      
      const cekJam = jamPilihInt >= jamMulaiPromoInt && jamPilihInt < jamSelesaiPromoInt;
      const cekSyarat = durasi >= (p.minimal_jam_main || 1);
      
      // 👇 CEK TANGGAL MERAH: Jika admin centang "Matikan saat libur" dan hari ini libur, maka batal!
      let cekLibur = true;
      if (p.kecualikan_libur == 1 || p.kecualikan_libur === true) {
        if (tanggalMerah.includes(tanggal)) {
          cekLibur = false;
        }
      }
      
      return cekHari && cekJam && cekSyarat && cekLibur;
    });

    if (promoAktif) {
      isDapatPromo = true;
      totalHarga = (promoAktif.harga_promo || 0) * durasi;
      potongan = hargaNormal - totalHarga;
    }
  }
  const jumlahHemat = potongan;
  // 👆 AKHIR LOGIKA PROMO BARU 👆 

  const handleBooking = () => {
    if(!namaPemesan || !noWa || !tanggal || !jamMulai) {
      showAlert("Data Belum Lengkap", "Tolong isi Nama Pemesan, No. WhatsApp, Tanggal, dan Jam main terlebih dahulu!", "⚠️");
      return; 
    }

    if(noWa.length < 11) {
      setWaError("*Minimal 11 angka");
      if (waInputRef && waInputRef.current) {
        waInputRef.current.focus(); // Fokus ke input WA
        waInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Layar otomatis geser dengan mulus
      }
      return;
    }
    setWaError(""); // Bersihkan error jika lolos

    setIsLoading(true); 

    const dataPesanan = {
      user_id: null, nama_pemesan: namaPemesan, no_wa: noWa, lapangan_id: lapangan.id, // 👈 Tambah no_wa: noWa
      tanggal_main: tanggal, jam_mulai: jamMulai, jam_selesai: jamSelesaiTampil, opsi_bayar: opsiBayar, total_harga: totalHarga 
    };

    axios.post('http://127.0.0.1:8000/api/booking', dataPesanan)
      .then((response) => {
        const token = response.data?.data?.snap_token;
        const bookingId = response.data?.data?.id;
        
        if(token) {
          // 👇 SIMPAN KE LOCAL STORAGE DENGAN STATUS PENDING & TOKEN 👇
          const historyBaru = {
            id: bookingId,
            lapangan: lapangan.nama_lapangan,
            nama: namaPemesan,
            no_wa: noWa,
            opsi_bayar: opsiBayar,
            tanggal: tanggal,
            jam: `${jamMulai} - ${jamSelesaiTampil}`,
            durasi: durasi, // Simpan durasi
            harga: (opsiBayar === 'dp' ? totalHarga / 2 : totalHarga),
            waktu_pesan: new Date().getTime(),
            status: 'pending', // Status awal pending
            token: token // Simpan token untuk dilanjutkan nanti
          };

          const historyLama = JSON.parse(localStorage.getItem('riwayatPesananWijaya')) || [];
          const historyTanpaDuplikat = historyLama.filter(h => h.id !== bookingId);
          localStorage.setItem('riwayatPesananWijaya', JSON.stringify([historyBaru, ...historyTanpaDuplikat]));
          // 👆 ---------------------------------------------------- 👆

          window.snap.pay(token, {
            onSuccess: function(){ 
              axios.put(`http://127.0.0.1:8000/api/booking/sukses/${bookingId}`)
                .then(() => {
                  showAlert("Pembayaran Sukses!", `Jadwal atas nama ${namaPemesan} telah dibooking.`, "✅"); 
                  
                  // Ubah status di LocalStorage jadi Sukses
                  const h = JSON.parse(localStorage.getItem('riwayatPesananWijaya')) || [];
                  const updatedH = h.map(item => item.id === bookingId ? { ...item, status: 'sukses' } : item);
                  localStorage.setItem('riwayatPesananWijaya', JSON.stringify(updatedH));

                  axios.get(`http://127.0.0.1:8000/api/booking/cek-jadwal?lapangan_id=${lapangan.id}&tanggal_main=${tanggal}`)
                    .then(res => setJamPenuh(Array.isArray(res.data?.data || res.data) ? (res.data?.data || res.data) : []));
                  
                  setJamMulai(''); setDurasi(1); setIsLoading(false); 
                  resetDataPemesan(); // Reset form!
                });
            },
            onPending: function(){ 
              showAlert("Menunggu Pembayaran", "Pesanan Anda diamankan! Selesaikan pembayaran melalui menu Riwayat Pesanan sebelum batas waktu habis.", "⏳"); 
              setIsLoading(false); 
              setJamMulai(''); setDurasi(1);
              resetDataPemesan(); // Reset form!
            },
            onError: function(){ showAlert("Gagal", "Pembayaran Gagal diproses!", "❌"); setIsLoading(false); },
            onClose: function(){ 
              axios.delete(`http://127.0.0.1:8000/api/booking/batal-bayar/${bookingId}`)
                .then(() => {
                  showAlert("Dibatalkan", "Anda telah menutup menu pembayaran.", "ℹ️"); 
                  // Hapus dari history karena dibatalkan sebelum memilih metode bayar
                  const h = JSON.parse(localStorage.getItem('riwayatPesananWijaya')) || [];
                  const updatedH = h.filter(item => item.id !== bookingId);
                  localStorage.setItem('riwayatPesananWijaya', JSON.stringify(updatedH));
                  setIsLoading(false); 
                }).catch(() => setIsLoading(false));
            }
          });
        }
      })
      .catch(() => { showAlert("Error Server", "Gagal menyambung ke server.", "🔌"); setIsLoading(false); });
  }; 

  return (
    <div className="lapangan-card">
      <img 
        src={`/lapangan_${index === 0 ? 'A' : 'B'}.jpg`} 
        alt={lapangan.nama_lapangan} 
        className="lapangan-img" 
        onError={(e) => {e.target.onerror = null; e.target.src = `/lapangan_${index + 1}.jpg`}} 
        // 👇 Tambahkan style ini untuk mengembalikan proporsi gambar 👇
        style={{ width: '100%', height: '260px', objectFit: 'cover', objectPosition: 'center' }} 
      />
      <div className="card-content">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>{lapangan.nama_lapangan}</h2>
          {tanggal && (
            <div className="badge-tanggal" style={{ backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #a32129', color: '#475569', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              📅 <span>Tanggal:</span> 
              <strong style={{ color: '#242c63' }}>{new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          )}
        </div>
        
        <div className="info-lapangan" style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
          <p style={{ margin: '0 0 5px 0' }}><strong style={{ color: '#1e293b' }}>Ukuran Lapangan:</strong> 13.4m x 6.1m</p>
          <p style={{ margin: '0 0 5px 0' }}><strong style={{ color: '#1e293b' }}>Tinggi Net:</strong> 1.5m</p>
          <p style={{ margin: 0 }}><strong style={{ color: '#1e293b' }}>Jenis Lantai:</strong> {lapangan.jenis_lantai}</p>
        </div>
        
        <p className="harga" style={{ fontSize: '2rem', fontWeight: '800', color: '#a32129', margin: '0 0 20px 0' }}>Rp {(lapangan.harga_per_jam || 0).toLocaleString('id-ID')}<span style={{ fontSize: '1rem', color: '#64748b', fontWeight: '500' }}>/jam</span></p>

        <div className="slot-jam-wrapper">
          <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#242c63', marginBottom: '12px' }}>Pilih Jam Mulai:</p>
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
          <div className="durasi-wrapper" style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #242c63', marginBottom: '25px' }}>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>Durasi Main:</p>
            <div className="durasi-container">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((opsi) => {
                const aman = cekDurasiAman(jamMulai, opsi);
                return (<button key={opsi} disabled={!aman} className={`btn-durasi ${durasi === opsi ? 'aktif' : ''} ${!aman ? 'penuh' : ''}`} onClick={() => setDurasi(opsi)}>{opsi} Jam</button>);
              })}
            </div>
            <p className="indikator-jam" style={{ color: '#475569', fontSize: '0.95rem', marginTop: '12px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
              Waktu Main: <strong style={{ color: '#242c63' }}>{jamMulai} - {jamSelesaiTampil}</strong>
            </p>
          </div>
        )}

        {/* 👇 RINCIAN HARGA & TOTAL BAYAR (1 CARD SAJA AGAR LEGA) 👇 */}
        {jamMulai && (
           <div className="rincian-harga" style={{ background: 'var(--bg-card, #ffffff)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color, #cbd5e1)' }}>

              {/* Rincian Harga Normal & Potongan (Hanya muncul jika dapat promo) */}
              {isDapatPromo && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary, #64748b)' }}>
                    <span>Harga Normal:</span>
                    <span>Rp {hargaNormal.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#ef4444', fontWeight: 'bold' }}>
                    <span>Potongan:</span>
                    <span>- Rp {potongan.toLocaleString('id-ID')}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px dashed var(--border-color, #cbd5e1)', margin: '12px 0' }} />
                </>
              )}

              {/* Total Keseluruhan (TEKS DP/LUNAS DIHAPUS AGAR LEBIH BERSIH) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <strong style={{ fontSize: 'clamp(0.95rem, 4vw, 1.1rem)', color: 'var(--text-primary, #1e293b)' }}>
                  Total Bayar:
                </strong>
                <strong style={{ fontSize: 'clamp(1.05rem, 5vw, 1.3rem)', color: 'var(--wijaya-blue, #242c63)', textAlign: 'right' }}>
                  Rp {(opsiBayar === 'dp' ? totalHarga / 2 : totalHarga).toLocaleString('id-ID')}
                </strong>
              </div>

           </div>
        )}

        {jamMulai && (
          <div className="opsi-bayar-wrapper" style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeft: '4px solid #a32129', marginBottom: '20px' }}>
            <p style={{ color: '#1e293b', fontWeight: '700', fontSize: '0.95rem', marginBottom: '12px' }}>Pilih Pembayaran:</p>
            <div className="opsi-bayar-container">
              <label className={`opsi-label ${opsiBayar === 'dp' ? 'aktif' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', border: '1px solid', borderColor: opsiBayar === 'dp' ? '#a32129' : '#cbd5e1', backgroundColor: opsiBayar === 'dp' ? 'rgba(163,33,41,0.05)' : '#fff' }}>
                <input type="radio" value="dp" checked={opsiBayar === 'dp'} onChange={() => setOpsiBayar('dp')} style={{ margin: 0, flexShrink: 0 }} /> 
                <span style={{ color: opsiBayar === 'dp' ? '#a32129' : '#475569', fontWeight: opsiBayar === 'dp' ? '700' : '500', fontSize: 'clamp(0.8rem, 3.8vw, 1rem)', whiteSpace: 'nowrap' }}>Bayar DP 50% (Rp {(totalHarga / 2).toLocaleString('id-ID')})</span>
              </label>
              
              <label className={`opsi-label ${opsiBayar === 'lunas' ? 'aktif' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid', borderColor: opsiBayar === 'lunas' ? '#a32129' : '#cbd5e1', backgroundColor: opsiBayar === 'lunas' ? 'rgba(163,33,41,0.05)' : '#fff' }}>
                <input type="radio" value="lunas" checked={opsiBayar === 'lunas'} onChange={() => setOpsiBayar('lunas')} style={{ margin: 0, flexShrink: 0 }} /> 
                <span style={{ color: opsiBayar === 'lunas' ? '#a32129' : '#475569', fontWeight: opsiBayar === 'lunas' ? '700' : '500', fontSize: 'clamp(0.8rem, 3.8vw, 1rem)', whiteSpace: 'nowrap' }}>Bayar Lunas (Rp {totalHarga.toLocaleString('id-ID')})</span>
              </label>
            </div>
          </div>
        )}

        <button className="btn-pilih" onClick={handleBooking} disabled={isLoading} style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: isLoading ? '#6b7280' : '#a32129', color: '#fff', width: '100%', padding: '14px', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold' }}>{isLoading ? '⏳ Memproses...' : 'Booking Sekarang'}</button>
      </div>
    </div>
  )
}

function UserPage() {
  const [daftarLapangan, setDaftarLapangan] = useState([]);
  const [tanggal, setTanggal] = useState('');
  const [namaPemesan, setNamaPemesan] = useState('');
  const [noWa, setNoWa] = useState('');
  const [waError, setWaError] = useState('');
  const waInputRef = useRef(null);
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

  // 👇 VALIDASI REAL-TIME: Pantau perubahan nomor WA 👇
  useEffect(() => {
    if (noWa.length > 0 && noWa.length < 11) {
      setWaError("*Minimal 11 angka");
    } else {
      setWaError(""); 
    }
  }, [noWa]);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/lapangan')
      .then((res) => {
        const dataLap = res.data?.data || res.data; 
        setDaftarLapangan(Array.isArray(dataLap) ? dataLap : []);
      }).catch(err => { console.error("Error Lapangan:", err); setDaftarLapangan([]); });

    axios.get('http://127.0.0.1:8000/api/promos/active')
      .then((res) => {
        const dataPromo = res.data?.data || res.data;
        const promos = Array.isArray(dataPromo) ? dataPromo : [];
        setPromosAktif(promos);
        
        // 👇 JURUS PELACAK BUG (Buka Console di Browser buat cek ini!) 👇
        console.log("🕵️‍♂️ Detektif BUG: Data Promo dari API:", promos);
        console.log("🕵️‍♂️ Detektif BUG: Status GOR:", gorInfo.status_db);

        // Kalau ada promo, nyalakan titik merah di lonceng!
        if(promos.length > 0) {
          setHasUnread(true);
          console.log("🕵️‍♂️ Detektif BUG: Titik merah NYALA karena ada Promo.");
        } else {
          console.log("🕵️‍♂️ Detektif BUG: Titik merah MATI karena API Promo Kosong.");
        }
      }).catch(err => { 
        console.error("❌ Error API Promo:", err); 
        setPromosAktif([]); 
      });

    const cekStatusRealTime = () => {
      axios.get(`http://127.0.0.1:8000/api/gor/status?_t=${new Date().getTime()}`)
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
      <CustomerHeader />
      
      {/* TOMBOL LONCENG NOTIFIKASI */}
      {adaPengumuman && (
        <div 
          className="bell-notification" 
          onClick={() => { setShowBanner(!showBanner); setHasUnread(false); }}
          style={{ 
            cursor: 'pointer',
            backgroundColor: 'var(--bg-card, #ffffff)', 
            width: '48px',   /* 👈 Dikecilkan dari 60px */
            height: '48px',  /* 👈 Dikecilkan dari 60px */
            borderRadius: '50%',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)', 
          }} 
        >
          {/* Ikon Lonceng */}
          <span style={{ fontSize: '1.4rem' }}>🔔</span> {/* 👈 Ikon dikecilkan */}
          
          {/* Titik Merah Notifikasi */}
          {hasUnread && (
            <span style={{
              position: 'absolute',
              top: '8px',    /* 👈 Posisi disesuaikan ulang */
              right: '8px',  /* 👈 Posisi disesuaikan ulang */
              width: '12px',
              height: '12px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              border: '2px solid var(--bg-card, #ffffff)' 
            }}></span>
          )}
        </div>
      )}
      
      {adaPengumuman && showBanner && (
        <div className="floating-announcement" style={{ 
            maxHeight: '80vh', overflowY: 'auto', 
            display: 'flex', flexDirection: 'column', gap: '15px' /* Bikin jarak rapi antar kartu */
        }}>
          
          {/* ==========================================
              1. KARTU MERAH (INFO GOR TUTUP)
              ========================================== */}
          {gorInfo.status_db === 'tutup' && (
            <div style={{ backgroundColor: '#ef4444', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', color: '#fff', position: 'relative' }}>
              <button className="fa-close" onClick={() => setShowBanner(false)} style={{ color: '#fff', position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
              
              <div className="fa-header" style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>⚠️</span> {new Date(hariIniStr).setHours(0,0,0,0) >= new Date(gorInfo.tglMulai).setHours(0,0,0,0) ? ' GOR TUTUP' : ' GOR AKAN TUTUP'}
              </div>
              <div className="fa-body" style={{ marginTop: '10px' }}>
                Mohon maaf, GOR tidak beroperasi sementara pada:
                <div className="fa-date" style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', lineHeight: '1.5' }}>
                  📅 {formatTgl(gorInfo.tglMulai)} {gorInfo.tglSampai ? `sampai ${formatTgl(gorInfo.tglSampai)}` : 'sampai batas waktu yang belum ditentukan'}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              2. KARTU HIJAU (INFO PROMO)
              ========================================== */}
          {Array.isArray(promosAktif) && promosAktif.length > 0 && (
             <div style={{ backgroundColor: '#10b981', padding: '20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', color: '#fff', position: 'relative' }}>
                
                {/* Tombol silang (X) hanya muncul di kartu hijau JIKA GOR sedang Buka (kartu merah gak ada) */}
                {gorInfo.status_db !== 'tutup' && (
                  <button className="fa-close" onClick={() => setShowBanner(false)} style={{ color: '#fff', position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✖</button>
                )}

                <div className="fa-header" style={{ color: '#ffffff', fontSize: '1.1rem', marginBottom: '15px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '10px' }}>
                  INFO PROMO SAAT INI
                </div>
                <div className="fa-body" style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#fff' }}>
                  <ul style={{ paddingLeft: '20px', margin: '0', textAlign: 'left' }}>
                    {promosAktif.map(p => {
                              // Format tanggal mulai
                              const tglMulai = new Date(p.tgl_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                              
                              // 👇 CEGAH BUG 1970: Jika tgl_selesai kosong (Tanpa Batas), jangan diconvert jadi Date!
                              const tglSelesai = p.tgl_selesai ? new Date(p.tgl_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Seterusnya';
                              
                              // Pengecekan status tombol dari database
                              const showTgl = p.tampilkan_tgl == 1 || p.tampilkan_tgl === true;
                              const showMinJam = p.tampilkan_min_jam == 1 || p.tampilkan_min_jam === true;

                              return (
                                <li key={p.id} style={{ marginBottom: '15px', lineHeight: '1.5' }}>
                                  <strong style={{ color: '#ffffff', fontSize: '1.15rem' }}>{p.nama_promo}</strong> <br/>
                                  
                                  {/* 👇 1. Tampilkan Tanggal HANYA jika diizinkan Admin 👇 */}
                                  {showTgl && (
                                    <>
                                      <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>🗓️ {tglMulai} - {tglSelesai}</span><br/>
                                    </>
                                  )}

                                  {/* 👇 2. Tampilkan Teks Hari Kustom (Senin-Kamis) JIKA Admin mengisinya 👇 */}
                                  {p.hari_berlaku && (
                                    <>
                                      <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold' }}> {p.hari_berlaku}</span><br/>
                                    </>
                                  )}

                                  Hanya <strong style={{color: '#ffffff', fontSize: '1.15rem'}}>Rp {p.harga_promo?.toLocaleString('id-ID')}/jam</strong> 
                                  
                                  {/* 👇 3. Sembunyikan (Min Main) jika dilarang Admin 👇 */}
                                  {showMinJam && (
                                    <span style={{ fontSize: '0.85rem', opacity: 0.9 }}> (Min. main {p.minimal_jam_main} Jam)</span>
                                  )}
                                </li>
                              );
                            })}
                  </ul>
                </div>
             </div>
          )}

        </div>
      )}

      <header className="header"><h1>Selamat Datang Di Sistem Booking Online GOR Badminton Wijaya</h1><p>Silahkan pilih tanggal main untuk melihat jadwal yang tersedia.</p></header>

      <div className="booking-form">
        <h3>📝 Data Pemesan & Jadwal</h3>
        <div className="input-group">
          
          {/* KOLOM NAMA (HANYA HURUF & SPASI) */}
          <div className="input-field-wrapper">
            <label className="input-label">Masukkan Nama Pemesan:</label>
            <input 
              type="text" 
              placeholder="Masukkan nama Anda..." 
              value={namaPemesan} 
              // 👇 Jurus Regex: Hapus semua selain huruf a-z, A-Z, dan spasi 👇
              onChange={(e) => setNamaPemesan(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} 
              style={{ width: '250px' }} 
            />
          </div>

          {/* KOLOM NO WA (HANYA ANGKA) */}
          <div className="input-field-wrapper" style={{ position: 'relative' }}> {/* 👈 Tambah position relative */}
            <label className="input-label">No. WhatsApp:</label>
            <input 
              ref={waInputRef}
              type="tel" 
              placeholder="Cth: 08123456789" 
              value={noWa} 
              onChange={(e) => setNoWa(e.target.value.replace(/[^0-9]/g, ''))} 
              style={{ width: '200px', border: waError ? '2px solid #ef4444' : '', transition: 'all 0.3s ease' }} 
            />
            {/* 👇 Teks error melayang (absolute) tanpa efek bold agar layout tidak bergeser 👇 */}
            {waError && <span style={{ color: '#ef4444', fontSize: '0.8rem', position: 'absolute', left: 0, bottom: '-20px' }}>{waError}</span>}
          </div>

          {/* KOLOM TANGGAL */}
          <div className="input-field-wrapper">
            <label className="input-label">Pilih Tanggal Main:</label>
            <input 
              type="date" 
              className="date-input-native" 
              value={tanggal} 
              min={hariIniStr} 
              max="2026-12-31" /* 👈 TAMBAHAN BARU: Kunci maksimal di 31 Des 2026 */
              onChange={(e) => setTanggal(e.target.value)} 
              onClick={(e) => {
                try { 
                  if (e.target.showPicker) e.target.showPicker(); 
                } catch (err) {}
              }}
              style={{ width: '200px' }}
            />
          </div>

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
          <LapanganCard key={lapangan.id} lapangan={lapangan} index={index} tanggal={tanggal} namaPemesan={namaPemesan} noWa={noWa} showAlert={showAlert} promosAktif={promosAktif} setWaError={setWaError} waInputRef={waInputRef} resetDataPemesan={() => { setNamaPemesan(''); setNoWa(''); setTanggal(''); }} />          
          ))}
        </div>
      )}

      {alertConfig.isOpen && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-box"><div className="custom-alert-icon">{alertConfig.icon}</div><h2 className="custom-alert-title">{alertConfig.title}</h2><p className="custom-alert-message">{alertConfig.message}</p><div className="custom-alert-actions"><button className="btn-alert-confirm" onClick={closeAlert}>Tutup</button></div></div>
        </div>
      )}
      <CustomerFooter />
    </div>
  )
}

export default UserPage;