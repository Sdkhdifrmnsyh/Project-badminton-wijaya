import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import '../appAdmin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // 👇 STATE BARU UNTUK MODAL INFO & DAFTAR MEMBER 👇
  const [modalDaftarMember, setModalDaftarMember] = useState(false);
  const [modalInfoMember, setModalInfoMember] = useState(false);
  const [formMemberBaru, setFormMemberBaru] = useState({ nama: '', no_wa: '', kategori: 'Member Promo' });

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [namaAdmin, setNamaAdmin] = useState('Admin');
  
  // 👇 STATE BARU UNTUK PAGINATION (HALAMAN) 👇
  const [currentPageDashboard, setCurrentPageDashboard] = useState(1);
  const [currentPageLaporan, setCurrentPageLaporan] = useState(1);
  const [currentPageJadwal, setCurrentPageJadwal] = useState(1);
  const itemsPerPage = 20; 

  const renderPagination = (currentPage, totalPages, onPageChange) => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) { pageNumbers.push(i); }
    
    return (
      <div className="pagination-container">
        <button className="pagination-btn" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>« Prev</button>
        {pageNumbers.map(num => (
          <button key={num} className={`pagination-btn ${currentPage === num ? 'active' : ''}`} onClick={() => onPageChange(num)}>
            {num}
          </button>
        ))}
        <button className="pagination-btn" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next »</button>
      </div>
    );
  };
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('adminTheme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const [isLoadingBtn, setIsLoadingBtn] = useState(false);
  const [forgetAccount, setForgetAccount] = useState(false);
  const [gorBuka, setGorBuka] = useState(true);
  const [gorActualBuka, setGorActualBuka] = useState(true); 
  const [gorTglMulai, setGorTglMulai] = useState('');
  const [gorTglSampai, setGorTglSampai] = useState('');
  const [isEditTgl, setIsEditTgl] = useState(false);
  const [editTglValue, setEditTglValue] = useState('');

  const [bookings, setBookings] = useState([]);
  const [promos, setPromos] = useState([]);
  const [daftarLapangan, setDaftarLapangan] = useState([]);

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [formPromo, setFormPromo] = useState({
    nama_promo: '', tgl_mulai: '', tgl_selesai: '',
    jam_mulai: '', jam_selesai: '', minimal_jam_main: 1, harga_promo: '',
    hari_berlaku: '', tampilkan_tgl: true, tampilkan_min_jam: true,
    hari_spesifik: [], 
    kecualikan_libur: false
  });

  // STATE UNTUK KASIR & INTEGRASI MEMBER
  const [formPesan, setFormPesan] = useState({ 
    nama: '', no_wa: '', kategori: 'Reguler', tanggal: '', lapangan_id: '', jam_mulai: '', durasi: 1, status: 'Lunas', 
    isLocked: false, 
    jumlah_pekan: 4 
  });

  // 👇 STATE BARU UNTUK PREVIEW BOOKING MASSAL 👇
  const [previewBulk, setPreviewBulk] = useState([]);
  const [isCheckingBulk, setIsCheckingBulk] = useState(false);

  // STATE UNTUK POP-UP KONFIRMASI BOOKING
  const [confirmBookingModal, setConfirmBookingModal] = useState({ isOpen: false, data: null });
  const [jamPenuhPesan, setJamPenuhPesan] = useState([]);

  const [jamPenuhModal, setJamPenuhModal] = useState([]); 
  const [filterTanggal, setFilterTanggal] = useState('');
  const [tanggalJadwal, setTanggalJadwal] = useState('');
  const [tahunJadwal, setTahunJadwal] = useState(new Date().getFullYear());
  const [bulanJadwal, setBulanJadwal] = useState('semua');
  const [bulanLaporan, setBulanLaporan] = useState('semua'); 
  const [tahunLaporan, setTahunLaporan] = useState(new Date().getFullYear());
  const [statusJadwal, setStatusJadwal] = useState('semua'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editTanggal, setEditTanggal] = useState('');
  const [editLapanganId, setEditLapanganId] = useState('');
  const [editSplits, setEditSplits] = useState([{ jam_mulai: '', jam_selesai: '' }]);
  const [daftarJadwalLama, setDaftarJadwalLama] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [waErrorKasir, setWaErrorKasir] = useState('');
  const [waErrorMember, setWaErrorMember] = useState('');
  const waInputKasirRef = useRef(null);

  const [alertConfig, setAlertConfig] = useState({ isOpen: false, type: 'alert', title: '', message: '', icon: '', confirmText: 'OK', isDanger: false, onConfirm: null });
  const [formTutup, setFormTutup] = useState({ pesan: '', tglMulai: '', tglSampai: '' });

  const showAlert = (title, message, icon = 'ℹ️', confirmText = 'OK') => setAlertConfig({ isOpen: true, type: 'alert', title, message, icon, confirmText, isDanger: false, onConfirm: null });
  const showConfirm = (title, message, icon, confirmText, isDanger, onConfirm) => setAlertConfig({ isOpen: true, type: 'confirm', title, message, icon, confirmText, isDanger, onConfirm });
  const closeAlert = () => setAlertConfig({ ...alertConfig, isOpen: false });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      localStorage.setItem('adminTheme', 'dark');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('adminTheme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (formPesan.no_wa && formPesan.no_wa.length > 0 && formPesan.no_wa.length < 11) {
      setWaErrorKasir("*Minimal 11 angka"); // 👈 Emoji hilang, teks diubah
    } else {
      setWaErrorKasir("");
    }
  }, [formPesan.no_wa]);

  // 👇 Effect pemantau panjang karakter untuk Modal Member Baru 👇
  useEffect(() => {
    if (formMemberBaru.no_wa && formMemberBaru.no_wa.length > 0 && formMemberBaru.no_wa.length < 11) {
      setWaErrorMember("*Minimal 11 angka");
    } else {
      setWaErrorMember("");
    }
  }, [formMemberBaru.no_wa]);

  useEffect(() => {
    if (formPesan.tanggal && formPesan.lapangan_id) {
      axios.get(`http://127.0.0.1:8000/api/booking/cek-jadwal?lapangan_id=${formPesan.lapangan_id}&tanggal_main=${formPesan.tanggal}`)
        .then(res => setJamPenuhPesan(Array.isArray(res.data.data) ? res.data.data : []))
        .catch(err => console.error(err));
    }
  }, [formPesan.tanggal, formPesan.lapangan_id]);

  // 👇 FETCH JAM PENUH KHUSUS UNTUK MODAL RESCHEDULE & GANTI LAPANGAN 👇
  useEffect(() => {
    if (isModalOpen && editTanggal && editLapanganId) {
      axios.get(`http://127.0.0.1:8000/api/booking/cek-jadwal?lapangan_id=${editLapanganId}&tanggal_main=${editTanggal}`)
        .then(res => setJamPenuhModal(Array.isArray(res.data.data) ? res.data.data : []))
        .catch(err => console.error(err));
    }
  }, [editTanggal, isModalOpen, editLapanganId]);

  // 👇 LOGIKA AI: AUTO-SHIFT JADWAL KE H+1 KHUSUS MEMBER/RUTIN JIKA TANGGAL LAMA MATI 👇
  useEffect(() => {
    if (isModalOpen && selectedBooking && editTanggal === selectedBooking.tanggal_main) {
       const namaUpper = (selectedBooking.nama_pemesan || '').toUpperCase();
       
       if (namaUpper.includes('MEMBER') || namaUpper.includes('RUTIN')) {
           // 1. PERBAIKAN KALKULASI DURASI (Anggap 23:59 itu 24)
           const startInt = parseInt((selectedBooking.jam_mulai || '00:00').split(':')[0]);
           const endStr = selectedBooking.jam_selesai || '00:00';
           const endInt = endStr.startsWith('23:59') ? 24 : parseInt(endStr.split(':')[0]);
           const durasi = endInt - startInt;

           let penuhBeneran = Array.isArray(jamPenuhModal) ? [...jamPenuhModal] : [];
           
           // Bebaskan memori jam yang sedang dipakai jadwal ini sendiri
           for(let i = startInt; i < endInt; i++) {
             penuhBeneran = penuhBeneran.filter(j => j !== `${i < 10 ? '0' : ''}${i}:00`);
           }

           const dNow = new Date();
           const timeZoneOffset = dNow.getTimezoneOffset() * 60000;
           const hariIniStr = new Date(dNow.getTime() - timeZoneOffset).toISOString().split('T')[0];
           const jamSekarang = dNow.getHours();
           const slotJamAll = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
           
           let adaSisa = false;
           for (let jam of slotJamAll) {
              let aman = true;
              
              // Cek bentrok jam lain untuk SEPANJANG DURASI (Misal: 3 Jam berturut-turut)
              for(let i = 0; i < durasi; i++) {
                const jamDicek = parseInt(jam.split(':')[0]) + i;
                const formatJamDicek = `${jamDicek < 10 ? '0' : ''}${jamDicek}:00`;
                if (penuhBeneran.includes(formatJamDicek) || jamDicek > 23) { aman = false; break; }
              }
              if (editTanggal === hariIniStr && parseInt(jam.split(':')[0]) <= jamSekarang) aman = false;
              if (namaUpper.includes('PROMO') && parseInt(jam.split(':')[0]) >= 14) aman = false;

              if (aman) { adaSisa = true; break; }
           }

           // JIKA DI HARI INI TIDAK ADA SISA WAKTU YANG BISA MENAMPUNG DURASI TERSEBUT
           if (!adaSisa) {
              setTimeout(() => {
                 showAlert("Jadwal Tidak Memungkinkan", `Waktu di tanggal ini tidak cukup untuk menampung durasi ${durasi} Jam. Sistem otomatis memindahkan ke hari berikutnya (Minimal H+1).`, "⚠️");
                 
                 const besok = new Date(selectedBooking.tanggal_main);
                 besok.setDate(besok.getDate() + 1);
                 setEditTanggal(besok.toISOString().split('T')[0]);
                 setEditJamMulai(''); setEditJamSelesai('');
              }, 300);
           }
       }
    }
  }, [jamPenuhModal, isModalOpen]);

  const fetchSemuaData = () => {
    fetchAdminData(); fetchStatusGor(); fetchPromos();
    axios.get('http://127.0.0.1:8000/api/lapangan').then(res => setDaftarLapangan(res.data.data || []));
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      const namaPertama = storedUsername.split(' ')[0]; 
      setNamaAdmin(namaPertama.charAt(0).toUpperCase() + namaPertama.slice(1).toLowerCase());
    }
    fetchSemuaData();
    const intervalId = setInterval(fetchSemuaData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchAdminData = () => {
    axios.get(`http://127.0.0.1:8000/api/admin/bookings?_t=${new Date().getTime()}`)
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) {
          
          let dataPesanan = response.data.data.filter(b => {
            const status = (b?.status_pembayaran || '').toLowerCase(); // Tambah ?.
            return !status.includes('pending') && !status.includes('expired') && !status.includes('kadaluarsa');
          });

          // Urutkan dari yang terbaru (Tambah ?. untuk mencegah crash)
          dataPesanan.sort((a, b) => (b?.id || 0) - (a?.id || 0));
          setBookings(dataPesanan);
          
        } else { setBookings([]); }
      }).catch((error) => console.error(error));
  };

  const fetchStatusGor = () => {
    axios.get(`http://127.0.0.1:8000/api/gor/status?_t=${new Date().getTime()}`)
      .then((response) => {
        setGorBuka(response.data.status_db === 'buka');
        setGorActualBuka(response.data.status_actual === 'buka');
        setGorTglMulai(response.data.tgl_mulai);
        setGorTglSampai(response.data.tgl_sampai);
      }).catch((error) => console.error(error));
  };

  const fetchPromos = () => {
    axios.get(`http://127.0.0.1:8000/api/promos?_t=${new Date().getTime()}`)
      .then((response) => {
        if (response.data && Array.isArray(response.data.data)) { setPromos(response.data.data); }
      }).catch((error) => console.error(error));
  };

  const handleSimpanBatasWaktu = () => {
    if (!editTglValue) { showAlert("Perhatian", "Pilih tanggal terlebih dahulu!", "⚠️"); return; }
    if (editTglValue <= gorTglMulai) { showAlert("Tanggal Tidak Valid", "Tanggal buka harus SETELAH tanggal tutup!", "❌"); return; }
    
    if(isLoadingBtn) return; setIsLoadingBtn(true);
    axios.put('http://127.0.0.1:8000/api/admin/gor/status', { status: 'tutup', tgl_mulai: gorTglMulai, tgl_sampai: editTglValue })
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

  const cekBisaBatal = (tanggalMain, jamMulai, kategoriPemesan = '') => {
    // Member dan Rutin gk bisa batal, cuman boleh reschedule
    if (kategoriPemesan.includes('MEMBER') || kategoriPemesan.includes('RUTIN')) return false; 
    if (!jamMulai) return false;
    
    const waktuMain = new Date(`${tanggalMain}T${jamMulai.substring(0, 5)}:00`);
    const sekarang = new Date();
    // Hitung selisih dalam jam
    const selisihJam = (waktuMain - sekarang) / (1000 * 60 * 60);
    
    return selisihJam >= 24; // Harus batal maksimal 24 jam sebelum main
  };

  const cekSudahLewat = (tanggalMain, jamMulai) => {
    if (!jamMulai) return false;
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
    axios.put('http://127.0.0.1:8000/api/admin/gor/status', { status, ...dataTambahan })
    .then((res) => { closeAlert(); showAlert("Sukses", res.data.pesan, "✅"); fetchAdminData(); fetchStatusGor(); })
    .finally(() => setIsLoadingBtn(false));
  };

  const handlePelunasanManual = (id) => {
    showConfirm("Lunasi?", "Pelanggan sudah bayar sisa tagihan?", "💰", "Ya, Lunasi", false, () => {
      if(isLoadingBtn) return; setIsLoadingBtn(true);
      axios.put(`http://127.0.0.1:8000/api/admin/booking/pelunasan/${id}`)
      .then(res => { closeAlert(); showAlert("Lunas!", res.data.pesan, "✅"); fetchAdminData(); })
      .finally(() => setIsLoadingBtn(false));
    });
  };

  const handleBatalkanPesanan = (id) => {
    // 👇 Teks tombol diubah sesuai permintaan 👇
    showConfirm("Batalkan?", "Pesanan akan dihapus permanen. Yakin?", "🚨", "Ya, Batalkan", true, () => {
      if(isLoadingBtn) return; setIsLoadingBtn(true);
      axios.delete(`http://127.0.0.1:8000/api/admin/booking/batal/${id}`)
      .then(res => { closeAlert(); showAlert("Dibatalkan", res.data.pesan, "🗑️"); fetchAdminData(); })
      .finally(() => setIsLoadingBtn(false));
    });
  };

  const handleLogout = () => {
    const isRemembered = localStorage.getItem('rememberAdmin') === 'true';
    setAlertConfig({ 
      isOpen: true, 
      type: 'logout', 
      title: 'Logout?', 
      message: 'yakin ingin keluar aplikasi?', 
      
      confirmText: 'Ya, Keluar', 
      isDanger: true,
      isRemembered: isRemembered
    });
    setForgetAccount(false); 
  };

  // 👇 FUNGSI AI: LOMPAT HARI JIKA JAM TERAKHIR > 21:00 👇
  const applyLompatHari = (bookingLama) => {
    let tglBaru = bookingLama.tanggal_main;
    const strSelesai = bookingLama.jam_selesai || '00:00';
    const endH = strSelesai.startsWith('23:59') ? 24 : parseInt(strSelesai.split(':')[0]);

    if (endH > 21) {
      const besok = new Date(tglBaru);
      besok.setDate(besok.getDate() + 1);
      tglBaru = besok.toISOString().split('T')[0];
    }
    setEditTanggal(tglBaru);
    setEditSplits([{ jam_mulai: '', jam_selesai: '' }]);
  };

  // 👇 MESIN PEMECAH JADWAL (SIMPAN MULTI-REQUEST) 👇
  const simpanReschedule = () => {
    if(isLoadingBtn) return; setIsLoadingBtn(true);
    const requests = [];
    
    editSplits.forEach((split, idx) => {
        if (idx === 0) {
            // Urutan ke-1: Timpa/Edit jadwal yang asli di Database
            requests.push(axios.put(`http://127.0.0.1:8000/api/admin/booking/reschedule/${selectedBooking.id}`, {
              lapangan_id: editLapanganId,  
              tanggal_main: editTanggal, jam_mulai: split.jam_mulai, jam_selesai: split.jam_selesai
            }));
        } else {
            // Urutan ke-2 dst: Buat pesanan baru dengan harga 0 (karena hasil pecahan)
            requests.push(axios.post('http://127.0.0.1:8000/api/admin/booking/manual', {
                nama_pemesan: selectedBooking.nama_pemesan, no_wa: selectedBooking.no_wa, 
                lapangan_id: editLapanganId,
                tanggal_main: editTanggal, jam_mulai: split.jam_mulai, jam_selesai: split.jam_selesai,
                total_harga: 0, status_pembayaran: selectedBooking.status_pembayaran
            }));
        }
    });

    Promise.all(requests)
      .then(() => { setIsModalOpen(false); showAlert("Berhasil!", "Jadwal berhasil dipindah (dan dipecah jika ada)!", "✅"); fetchAdminData(); })
      .catch(() => showAlert("Gagal", "Terjadi kesalahan server saat memecah jadwal.", "❌"))
      .finally(() => setIsLoadingBtn(false));
  };

  const bukaModalReschedule = (booking) => {
    setSelectedBooking(booking); 
    setEditLapanganId(booking.lapangan_id);
    applyLompatHari(booking); // Panggil AI Lompat Hari di sini

    const namaUpper = (booking.nama_pemesan || '').toUpperCase();
    if (namaUpper.includes('MEMBER') || namaUpper.includes('RUTIN')) {
      const sekarang = new Date();
      const jadwalMasaDepan = bookings.filter(b => {
        if (b.nama_pemesan !== booking.nama_pemesan) return false;
        if ((b.status_pembayaran || '').toLowerCase() === 'batal') return false;
        if (b.id === booking.id) return true;
        const waktuMain = new Date(`${b.tanggal_main}T${(b.jam_mulai || '00:00').substring(0, 5)}:00`);
        return waktuMain >= sekarang;
      });
      jadwalMasaDepan.sort((a, b) => new Date(a.tanggal_main) - new Date(b.tanggal_main));
      setDaftarJadwalLama(jadwalMasaDepan);
    } else { setDaftarJadwalLama([]); }
    setIsModalOpen(true);
  };

  // 👇 FUNGSI BARU UNTUK MENGISI FORM EDIT PROMO 👇
  const handleEditPromo = (promo) => {
    setFormPromo({
      id: promo.id, 
      nama_promo: promo.nama_promo || '',
      tgl_mulai: promo.tgl_mulai,
      tgl_selesai: promo.tgl_selesai,
      jam_mulai: (promo.jam_mulai || '').substring(0,5),
      jam_selesai: promo.jam_selesai === '23:59:00' ? '24:00' : (promo.jam_selesai || '').substring(0,5),
      minimal_jam_main: promo.minimal_jam_main,
      harga_promo: promo.harga_promo,
      hari_berlaku: promo.hari_berlaku || '',
      hari_spesifik: promo.hari_spesifik ? promo.hari_spesifik.split(',') : [],
      kecualikan_libur: promo.kecualikan_libur === 1 || promo.kecualikan_libur === true,
      tampilkan_tgl: promo.tampilkan_tgl !== undefined ? (promo.tampilkan_tgl == 1 || promo.tampilkan_tgl === true) : true,
      tampilkan_min_jam: promo.tampilkan_min_jam !== undefined ? (promo.tampilkan_min_jam == 1 || promo.tampilkan_min_jam === true) : true
    });
    setIsPromoModalOpen(true);
  };

  // 👇 FUNGSI SIMPAN PROMO (BISA BUAT BARU & EDIT) 👇
  const handleSimpanPromo = () => {
    if(isLoadingBtn) return; 
    // 👇 PERBAIKAN: tgl_selesai tidak lagi wajib 👇
    if (!formPromo.tgl_mulai || !formPromo.jam_mulai || !formPromo.jam_selesai || !formPromo.harga_promo) {
      showAlert("Peringatan", "Tanggal Mulai, Jam, dan Harga wajib diisi!", "⚠️"); return;
    }
    setIsLoadingBtn(true);
    const dataKirim = {
      ...formPromo,
      nama_promo: formPromo.nama_promo || 'Promo Spesial',
      jam_selesai: formPromo.jam_selesai === '24:00' ? '23:59:00' : formPromo.jam_selesai,
      hari_spesifik: formPromo.hari_spesifik.join(','),
      tgl_selesai: formPromo.tgl_selesai || null
    };

    const resetForm = { 
      id: null, nama_promo: '', tgl_mulai: '', tgl_selesai: '', jam_mulai: '', jam_selesai: '', 
      minimal_jam_main: 1, harga_promo: '', hari_berlaku: '', tampilkan_tgl: true, tampilkan_min_jam: true,
      hari_spesifik: [], kecualikan_libur: false 
    };

    if (formPromo.id) {
      axios.put(`http://127.0.0.1:8000/api/promos/${formPromo.id}`, dataKirim)
        .then(() => {
          showAlert("Berhasil", "Promo berhasil diperbarui!", "✅");
          setIsPromoModalOpen(false); fetchPromos(); setFormPromo(resetForm);
        }).catch(err => console.error(err)).finally(() => setIsLoadingBtn(false));
    } else {
      axios.post('http://127.0.0.1:8000/api/promos', dataKirim)
        .then(() => {
          showAlert("Berhasil", "Promo baru berhasil ditambahkan!", "✅");
          setIsPromoModalOpen(false); fetchPromos(); setFormPromo(resetForm);
        }).catch(err => console.error(err)).finally(() => setIsLoadingBtn(false));
    }
  };

  const handleTogglePromo = (id, currentStatus) => {
    if(isLoadingBtn) return; setIsLoadingBtn(true);
    axios.put(`http://127.0.0.1:8000/api/promos/${id}`, { is_active: !currentStatus })
      .then(() => fetchPromos())
      .finally(() => setIsLoadingBtn(false));
  };

  const handleHapusPromo = (id) => {
    showConfirm("Hapus Promo?", "Yakin ingin menghapus promo ini?", "🗑️", "Hapus", true, () => {
      if(isLoadingBtn) return; setIsLoadingBtn(true);
      axios.delete(`http://127.0.0.1:8000/api/promos/${id}`)
        .then(() => { closeAlert(); fetchPromos(); })
        .finally(() => setIsLoadingBtn(false));
    });
  };

  const d = new Date();
  const minHariIni = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const getMinTglSelesaiPromo = () => {
    if (!formPromo.tgl_mulai) return minHariIni;
    const baseDate = new Date(formPromo.tgl_mulai);
    baseDate.setDate(baseDate.getDate() + 1);
    return baseDate.toISOString().split('T')[0];
  };

  const opsiJamPromo = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00','24:00'];

  const renderDaftarPesanan = (dataBookings) => {
    // VAKSIN ANTI CRASH: Pastikan status_pembayaran ada isinya
    const dataBersih = dataBookings.filter(b => !(b.status_pembayaran || '').toLowerCase().includes('pending'));

    return (
      <div className="booking-list">
        {dataBersih.length === 0 && <p className="empty-log">Tidak ada pesanan.</p>}
        {dataBersih.map((booking) => {
        // VAKSIN ANTI CRASH: Amankan bacaan string
        const s = (booking.status_pembayaran || '').toLowerCase();
        const isLunas = s === 'lunas'; const isBatal = s === 'batal'; const isDP = s.includes('dp');
        let displayStatus = 'DP'; if(isLunas) displayStatus = 'LUNAS'; if(isBatal) displayStatus = 'BATAL';
        
        const bisaDibatalkan = cekBisaBatal(booking.tanggal_main, booking.jam_mulai, (booking.nama_pemesan || '').toUpperCase());
        const sudahLewat = cekSudahLewat(booking.tanggal_main, booking.jam_mulai); 

        // VAKSIN ANTI CRASH: Fallback ke 00:00
        const jamMulaiInt = parseInt((booking.jam_mulai || '00:00').substring(0, 2));
        const jamSelesaiInt = parseInt((booking.jam_selesai || '00:00').substring(0, 2));
        let durasi = jamSelesaiInt - jamMulaiInt; if (durasi < 0) durasi += 24; 

        return (
          <div className={`booking-card ${isBatal ? 'card-batal' : (isLunas ? 'card-lunas' : 'card-dp')}`} key={booking.id} style={isBatal ? { opacity: 0.6, filter: 'grayscale(100%)' } : {}}>
            <div className="bc-header">
              <span className="bc-lapangan">🏸 {booking.nama_lapangan}</span>
              <span className={`lap-badge ${isLunas ? 'lunas' : 'dp'}`} style={isBatal ? { background: '#ef4444', color: 'white' } : {}}>{displayStatus}</span>
            </div>
            <div className="bc-body">
              <div className="bc-info" style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...(isBatal ? { textDecoration: 'line-through' } : {}) }}>
                <strong className="bc-nama" style={{ fontSize: '1.1rem' }}>{booking.nama_pemesan || 'Tanpa Nama'}</strong>
                
                {/* 👇 FORMAT BARU: Tanggal | Jam (1 BARIS PAKSA DI HP) 👇 */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: '6px', color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 3.5vw, 0.85rem)', overflow: 'hidden' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>📅 {booking.tanggal_main}</span>
                  <span style={{ color: 'var(--border-color)' }}>|</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>⏰ {(booking.jam_mulai || '').substring(0,5)} - {(booking.jam_selesai || '').substring(0,5)}</span>
                </div>
                
                {/* 👇 FORMAT BARU: Durasi | WA (1 BARIS PAKSA DI HP) 👇 */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap', gap: '6px', color: 'var(--text-secondary)', fontSize: 'clamp(0.75rem, 3.5vw, 0.85rem)', overflow: 'hidden' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>⏳ {durasi} Jam</span>
                  {booking.no_wa && (
                    <>
                      <span style={{ color: 'var(--border-color)' }}>|</span>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📱 {booking.no_wa}</span>
                    </>
                  )}
                </div>
                
                {/* 👇 FORMAT BARU: Tagihan Sendirian di Bawah 👇 */}
                <div style={{ color: 'var(--text-primary)', fontSize: 'clamp(0.9rem, 4vw, 1rem)', fontWeight: 'bold', marginTop: '2px' }}>
                  <span>💰 Tagihan: Rp {(booking.total_harga || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div className="bc-actions">
                {isBatal ? (<span className="text-status"> Pesanan Dibatalkan</span>) 
                : (isLunas && sudahLewat) ? (<span className="text-status"> Booking Selesai</span>) 
                : (
                    <>
                      {/* Tombol Lunas selalu muncul kalau belum lunas, walau sudah lewat */}
                      {activeMenu === 'dashboard' && !isLunas && (<button className="btn-lunas" disabled={isLoadingBtn} onClick={() => handlePelunasanManual(booking.id)}>{isLoadingBtn ? '⏳' : '✅ Lunas'}</button>)}
                      
                      {activeMenu === 'jadwal' && !isBatal && (
                          <>
                            {/* Tombol Pindah selalu ada (Tidak ada lagi dana hangus) */}
                            <button className="btn-reschedule" onClick={() => bukaModalReschedule(booking)}>📅 Pindah</button>
                            
                            {/* Tombol batal hanya muncul jika bisa dibatalkan (H-1 dan bukan member) */}
                            {bisaDibatalkan ? (
                              <button className="btn-batal-pesanan" disabled={isLoadingBtn} onClick={() => handleBatalkanPesanan(booking.id)}>{isLoadingBtn ? '⏳' : '❌ Batal'}</button>
                            ) : (
                              <span className="text-locked" style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '0.8rem', alignSelf: 'center' }}>
                                🔒 Batal Terkunci
                              </span>
                            )}
                          </>
                      )}
                    </>
                  )
                }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  };

  const renderDashboardUtama = () => {
    let totalUangDashboard = 0;
    bookings.forEach(p => { 
      // VAKSIN ANTI CRASH: Cek null di foreach
      const s = (p.status_pembayaran || '').toLowerCase(); 
      if (s.includes('dp') && !s.includes('batal')) totalUangDashboard += ((p.total_harga || 0) / 2); 
      else if (s === 'lunas') totalUangDashboard += (p.total_harga || 0); 
    });

    const filteredBookings = bookings.filter(b => {
      const matchTanggal = filterTanggal ? b.tanggal_main === filterTanggal : true;
      const matchNama = searchName ? (b.nama_pemesan || '').toLowerCase().includes(searchName.toLowerCase()) : true;
      return matchTanggal && matchNama;
    });

    const totalPagesDashboard = Math.ceil(filteredBookings.length / itemsPerPage);
    const currentDashboardItems = filteredBookings.slice((currentPageDashboard - 1) * itemsPerPage, currentPageDashboard * itemsPerPage);

    return (
      <>
        <div className="admin-cards mobile-compact-card">
          <div className="card-stat"><h3>💰 Total Pendapatan</h3><p className="stat-value text-green">Rp {totalUangDashboard.toLocaleString('id-ID')}</p></div>
          <div className="card-stat"><h3>🛒 Total Transaksi</h3><p className="stat-value">{bookings.length} Pesanan</p></div>
          
          <div className="card-stat" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ marginBottom: '15px' }}>🎛️ Operasional</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: gorBuka ? '#10b981' : '#ef4444', boxShadow: `0 0 15px ${gorBuka ? '#10b981' : '#ef4444'}` }}></div>
              <p className={`stat-value ${getStatusTampilan().warna}`} style={{ fontSize: '2rem', margin: 0, lineHeight: 1 }}>
                {getStatusTampilan().teks}
              </p>
            </div>
            
            {!gorBuka && gorTglMulai && (
              <div className="info-tutup-admin" style={{ fontSize: '0.8rem', lineHeight: '1.5', padding: '10px', whiteSpace: 'normal', textAlign: 'center', marginBottom: '15px' }}>
                Pada Tanggal {formatTglSingkat(gorTglMulai)} - {gorTglSampai ? formatTglSingkat(gorTglSampai) : '(Sampai batas waktu yang belum ditentukan)'}
                {!gorTglSampai && (
                  <>
                    {!isEditTgl ? (<span style={{ display: 'block', marginTop: '6px', fontSize: '0.75rem' }}>Tentukan waktu klik <strong style={{ color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setIsEditTgl(true)}>disini</strong></span>) 
                    : (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 'bold' }}>Pilih Tanggal Buka GOR:</p>
                        <input type="date" value={editTglValue} min={gorTglMulai ? new Date(new Date(gorTglMulai).getTime() + 86400000).toISOString().split('T')[0] : ''} onChange={(e) => setEditTglValue(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="input-filter" />
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
            
            <button disabled={isLoadingBtn} className={`btn-toggle ${gorBuka ? 'btn-danger' : 'btn-success'}`} onClick={handleToggleGor} style={{ marginTop: 'auto' }}>
              {gorBuka ? 'Tutup GOR' : 'Buka GOR'}
            </button>
          </div>
        </div>
        <div className="admin-table-container">
          <div className="table-header">
            <h2>📋 Riwayat Pesanan</h2>
            <div className="table-controls">
              <input type="text" className="input-search" placeholder="🔍 Cari nama pelanggan..." value={searchName} onChange={(e) => { setSearchName(e.target.value); setCurrentPageDashboard(1); }} />
              <div className="table-actions">
                <input type="date" className="input-filter" value={filterTanggal} onChange={(e) => { setFilterTanggal(e.target.value); setCurrentPageDashboard(1); }} onClick={(e) => e.target.showPicker && e.target.showPicker()} style={{ cursor: 'pointer' }} />
                <button className="btn-refresh" onClick={() => { setFilterTanggal(''); setSearchName(''); setCurrentPageDashboard(1); fetchAdminData(); }}>🔄 Refresh</button>
              </div>
            </div>
          </div>
          
          {renderDaftarPesanan(currentDashboardItems)}
          {renderPagination(currentPageDashboard, totalPagesDashboard, setCurrentPageDashboard)}
        </div>
      </>
    );
  };

 // 👇 FUNGSI UNTUK MENU KELOLA JADWAL (SUDAH ADA PAGINATION 20 DATA) 👇
  const renderKelolaJadwal = () => {
    // Logika Filter Data
    const jadwalDifilter = bookings.filter(b => {
      if (statusJadwal !== 'semua') {
        let s = (b.status_pembayaran || '').toLowerCase();
        let currentStatus = s === 'lunas' ? 'lunas' : (s === 'batal' ? 'batal' : 'dp');
        if (currentStatus !== statusJadwal) return false; 
      }
      
      let matchWaktu = true;
      if (tanggalJadwal) {
        matchWaktu = b.tanggal_main === tanggalJadwal;
      } else if (bulanJadwal !== 'semua') {
        const d = new Date(b.tanggal_main); 
        matchWaktu = (d.getMonth() + 1) == parseInt(bulanJadwal) && d.getFullYear() == parseInt(tahunJadwal);
      }
      if (!matchWaktu) return false;

      if (searchName && !(b.nama_pemesan || '').toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Jika tanggal sama, tetap urutkan dari jam paling pagi ke malam
      if (a.tanggal_main === b.tanggal_main) return (a.jam_mulai || '').localeCompare(b.jam_mulai || '');
      
      // 👇 PERBAIKAN: Urutkan tanggal dari yang TERBARU (Descending: b dikurangi a) 👇
      return new Date(b.tanggal_main) - new Date(a.tanggal_main);
    });

    const daftarBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    let teksJudul = tanggalJadwal ? formatTglSingkat(tanggalJadwal) : bulanJadwal !== 'semua' ? `${daftarBulan[parseInt(bulanJadwal) - 1]} ${tahunJadwal}` : 'Semua Waktu';

    // 👇 JURUS POTONG DATA (20 DATA PER HALAMAN) 👇
    const totalPagesJadwal = Math.ceil(jadwalDifilter.length / itemsPerPage);
    const currentJadwalItems = jadwalDifilter.slice((currentPageJadwal - 1) * itemsPerPage, currentPageJadwal * itemsPerPage);

    return (
      <div className="admin-table-container" style={{ paddingBottom: '30px' }}>
        
        {/* BARIS 1: HEADER COMPACT */}
        <div className="jadwal-header-compact">
          <div className="jadwal-header-kiri">
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.4rem' }}>📅 Jadwal: {teksJudul} ({jadwalDifilter.length})</h2>
            {/* 👇 DIBIKIN SATU BARIS (nowrap) DAN BISA DIGESER JIKA HP KEKECILAN 👇 */}
            <div className="status-btns-group" style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '4px', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              {[
                { id: 'semua', name: 'Semua', border: '#555', bg: '#3b82f6' },
                { id: 'lunas', name: 'Lunas', border: '#10b981', bg: '#10b981' },
                { id: 'dp', name: 'DP', border: '#f59e0b', bg: '#f59e0b' },
                { id: 'batal', name: 'Batal', border: '#ef4444', bg: '#ef4444' }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setStatusJadwal(item.id); setCurrentPageJadwal(1); }} 
                  className={`btn-filter-status ${statusJadwal === item.id ? 'active' : ''}`}
                  style={{ 
                    '--border-color': item.border, 
                    '--active-bg': item.bg,
                    flexShrink: 0, /* 👈 Cegah tombol berubah jadi gepeng */
                    padding: '6px 12px', /* 👈 Perkecil jarak pinggir agar muat 4 tombol */
                    fontSize: 'clamp(0.75rem, 3.5vw, 0.9rem)', /* 👈 Perkecil huruf otomatis di HP */
                    margin: 0
                  }}>
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="jadwal-header-kanan">
            <select value={bulanJadwal} onChange={(e) => { setBulanJadwal(e.target.value); setTanggalJadwal(''); setCurrentPageJadwal(1); }} className="input-filter">
              <option value="semua">Semua Bulan</option>
              {daftarBulan.map((b, i) => <option key={i+1} value={i+1}>{b}</option>)}
            </select>
            
            <input type="date" value={tanggalJadwal} onChange={(e) => { setTanggalJadwal(e.target.value); setBulanJadwal('semua'); setCurrentPageJadwal(1); }} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="input-filter input-date-kelola" />
          </div>
        </div>

        {/* BARIS 2: SEARCH BAR FULL WIDTH */}
        <div className="jadwal-search-full">
          <input 
            type="text" 
            className="input-search" 
            placeholder="🔍 Cari nama pelanggan..." 
            value={searchName} 
            onChange={(e) => { setSearchName(e.target.value); setCurrentPageJadwal(1); }} 
          />
        </div>

        {/* 👇 GRID DAFTAR JADWAL (HANYA NAMPILIN YANG SUDAH DIPOTONG) 👇 */}
        {renderDaftarPesanan(currentJadwalItems)}

        {/* 👇 TAMPILKAN TOMBOL PAGINASI DI BAWAH DAFTAR 👇 */}
        {renderPagination(currentPageJadwal, totalPagesJadwal, setCurrentPageJadwal)}

      </div>
    );
  };

// 👇 FITUR PESAN JADWAL (KASIR CLEAN & TERINTEGRASI INFO MEMBER) 👇
  const renderPesanJadwalAdmin = () => {
    const slotJamAdmin = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];
    const lapanganTerpilih = daftarLapangan.find(l => l.id.toString() === formPesan.lapangan_id);
    
    const dNow = new Date();
    const hariIniStr = `${dNow.getFullYear()}-${String(dNow.getMonth() + 1).padStart(2, '0')}-${String(dNow.getDate()).padStart(2, '0')}`;
    const jamSekarang = dNow.getHours(); 

    const isMember = formPesan.kategori === 'Member Promo' || formPesan.kategori === 'Member Eksklusif';
    const isMemberPromo = formPesan.kategori === 'Member Promo';
    // ==============================================================
    // JADWAL MASSAL & DETEKSI BENTROK OTOMATIS
    // ==============================================================
    const handleGenerateBulk = async () => {
      if(!formPesan.nama || !formPesan.no_wa || !formPesan.tanggal || !formPesan.lapangan_id || !formPesan.jam_mulai) {
        showAlert("Error", "Lengkapi semua data sebelum mengecek jadwal!", "⚠️"); return;
      }
      setIsCheckingBulk(true);
      let dates = [];
      const startD = new Date(formPesan.tanggal);
      
      if (isMember) {
          // 👉 Logika 1 Bulan Otomatis: Cerdas menyesuaikan 28/30/31 hari
          const endD = new Date(startD);
          endD.setMonth(endD.getMonth() + 1); 
          let curr = new Date(startD);
          while(curr < endD) {
              dates.push(curr.toISOString().split('T')[0]);
              curr.setDate(curr.getDate() + 7);
          }
      } else if (formPesan.kategori === 'Rutin') {
          // 👉 Logika Mingguan: Berdasarkan pilihan dropdown
          let curr = new Date(startD);
          for(let i=0; i < (formPesan.jumlah_pekan || 1); i++) {
              dates.push(curr.toISOString().split('T')[0]);
              curr.setDate(curr.getDate() + 7);
          }
      } else {
          dates = [formPesan.tanggal]; // Reguler hanya 1x
      }

      let bulkData = [];
      for (let tgl of dates) {
          try {
              const res = await axios.get(`http://127.0.0.1:8000/api/booking/cek-jadwal?lapangan_id=${formPesan.lapangan_id}&tanggal_main=${tgl}`);
              const jamPenuhTglIni = Array.isArray(res.data.data) ? res.data.data : [];
              let isBentrok = false;
              const mulaiInt = parseInt(formPesan.jam_mulai.split(':')[0]);
              for (let i = 0; i < formPesan.durasi; i++) {
                  let cekJam = `${mulaiInt + i < 10 ? '0' : ''}${mulaiInt + i}:00`;
                  if (jamPenuhTglIni.includes(cekJam)) { isBentrok = true; break; }
              }
              bulkData.push({
                  id_temp: Math.random().toString(36).substr(2, 9),
                  tanggal_baru: tgl,
                  jam_mulai_baru: formPesan.jam_mulai,
                  is_bentrok: isBentrok
              });
          } catch (err) { console.error(err); }
      }
      setPreviewBulk(bulkData);
      setIsCheckingBulk(false);
    };

    // Fungsi untuk menggeser jadwal khusus di tanggal yang bentrok
    const handleUbahJadwalBentrok = async (id_temp, field, value) => {
        const newData = previewBulk.map(item => item.id_temp === id_temp ? { ...item, [field]: value } : item);
        setPreviewBulk(newData);
        const item = newData.find(i => i.id_temp === id_temp);
        if (item.tanggal_baru && item.jam_mulai_baru) {
             const res = await axios.get(`http://127.0.0.1:8000/api/booking/cek-jadwal?lapangan_id=${formPesan.lapangan_id}&tanggal_main=${item.tanggal_baru}`);
             const jamPenuh = Array.isArray(res.data.data) ? res.data.data : [];
             let isBentrok = false;
             const mulaiInt = parseInt(item.jam_mulai_baru.split(':')[0]);
             for (let i = 0; i < formPesan.durasi; i++) {
                  let cekJam = `${mulaiInt + i < 10 ? '0' : ''}${mulaiInt + i}:00`;
                  if (jamPenuh.includes(cekJam)) { isBentrok = true; break; }
             }
             setPreviewBulk(prev => prev.map(i => i.id_temp === id_temp ? { ...i, is_bentrok: isBentrok } : i));
        }
    };

    // ====================================================================
    // 🧠 LOGIKA AI: MENGHITUNG KUOTA KALENDER PEKANAN (SENIN - MINGGU)
    // ====================================================================
    let sisaKuotaPekanIni = 3;
    let jamTerpakai = 0;

    if (isMember && formPesan.nama && formPesan.tanggal) {
      const baseName = formPesan.nama.replace(/\[.*?\]/g, '').replace(/\(via admin\)/gi, '').trim().toLowerCase();
      const riwayatUser = bookings.filter(b => 
        (b.nama_pemesan || '').toLowerCase().includes(baseName) &&
        !(b.status_pembayaran || '').toLowerCase().includes('batal')
      );

      // Cari Senin di pekan dari TANGGAL MAIN yang dipilih
      const tglPilih = new Date(formPesan.tanggal);
      const day = tglPilih.getDay();
      const diffToMonday = tglPilih.getDate() - day + (day === 0 ? -6 : 1); // Geser ke Senin
      
      const startOfWeek = new Date(tglPilih.setDate(diffToMonday));
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Geser ke Minggu
      endOfWeek.setHours(23,59,59,999);

      riwayatUser.forEach(b => {
        const bDate = new Date(b.tanggal_main);
        // Jika jadwal ini berada di antara Senin - Minggu pekan tersebut
        if (bDate >= startOfWeek && bDate <= endOfWeek) {
          const startH = parseInt(b.jam_mulai.split(':')[0]);
          const endH = b.jam_selesai.startsWith('23:59') ? 24 : parseInt(b.jam_selesai.split(':')[0]);
          let dur = endH - startH;
          if (dur < 0) dur += 24;
          jamTerpakai += dur;
        }
      });

      sisaKuotaPekanIni = 3 - jamTerpakai;
      if (sisaKuotaPekanIni < 0) sisaKuotaPekanIni = 0;
    }
    // ====================================================================

    const handleKategoriChange = (kat) => {
      if (formPesan.isLocked) return; // Gak bisa ganti kalau dari menu member
      setFormPesan({...formPesan, kategori: kat, tanggal: '', jam_mulai: '', durasi: 1, status: 'Lunas'});
    };

    const handleTanggalChange = (e) => {
      const tglDipilih = e.target.value;
      if (isMemberPromo && tglDipilih) {
        const dateObj = new Date(tglDipilih);
        const day = dateObj.getDay(); 
        if (day === 0 || day === 5 || day === 6) {
          // Diam-diam tolak Jumat, Sabtu, Minggu
          setFormPesan({...formPesan, tanggal: '', jam_mulai: ''});
          return;
        }
      }
      setFormPesan({...formPesan, tanggal: tglDipilih, jam_mulai: ''});
    };

    const isJamPenuh = (jamCek) => jamPenuhPesan.includes(jamCek);
    const isJamLewat = (jamCek) => formPesan.tanggal === hariIniStr && parseInt((jamCek || '00').split(':')[0]) <= jamSekarang;
    
    const isJamDisabled = (jamCek) => {
      if (isJamPenuh(jamCek) || isJamLewat(jamCek)) return true;
      if (isMemberPromo && parseInt(jamCek.split(':')[0]) >= 14) return true; 
      if (isMember && sisaKuotaPekanIni === 0) return true; 
      return false;
    };

    let batasDurasiMax = isMember ? Math.min(sisaKuotaPekanIni, 3) : 8; 
    let maxDurasi = batasDurasiMax;
    
    if (formPesan.jam_mulai) {
      maxDurasi = 0;
      const jamInt = parseInt(formPesan.jam_mulai.split(':')[0]);
      for (let i = jamInt; i <= 23; i++) {
        const jamCek = `${i < 10 ? '0' : ''}${i}:00`;
        if (isJamDisabled(jamCek)) break; 
        maxDurasi++;
      }
      if (maxDurasi > batasDurasiMax) maxDurasi = batasDurasiMax;
    }

    const handlePilihJam = (jam) => {
      let newMax = 0;
      const jamInt = parseInt(jam.split(':')[0]);
      for (let i = jamInt; i <= 23; i++) {
        const jamCek = `${i < 10 ? '0' : ''}${i}:00`;
        if (isJamDisabled(jamCek)) break;
        newMax++;
      }
      if (newMax > batasDurasiMax) newMax = batasDurasiMax;
      setFormPesan({ ...formPesan, jam_mulai: jam, durasi: formPesan.durasi > newMax ? 1 : (formPesan.durasi || 1) });
    };

    // 👇 INI FUNGSI YANG HILANG (SELIPKAN DI SINI) 👇
    const isSlotSelected = (jamCek) => {
      if (!formPesan.jam_mulai) return false;
      const jamCekInt = parseInt(jamCek.split(':')[0]);
      const mulaiInt = parseInt(formPesan.jam_mulai.split(':')[0]);
      return jamCekInt >= mulaiInt && jamCekInt < (mulaiInt + formPesan.durasi);
    };
    // 👆 ========================================== 👆

    let jamSelesaiTampil = '';
    if (formPesan.jam_mulai) {
      const jamMulaiInt = parseInt(formPesan.jam_mulai.split(':')[0]);
      const selesaiInt = jamMulaiInt + formPesan.durasi;
      jamSelesaiTampil = `${selesaiInt < 10 ? '0' : ''}${selesaiInt}:00`;
    }

    // LOGIKA HARGA
    let hargaFinal = 0; let hargaNormal = 0; let totalDiskon = 0; let isPromoDipakai = false;
    if (!isMember) {
      const hargaPerJamNormal = lapanganTerpilih ? lapanganTerpilih.harga_per_jam : 0;
      hargaNormal = hargaPerJamNormal * formPesan.durasi;
      if (formPesan.tanggal && formPesan.jam_mulai && formPesan.durasi && lapanganTerpilih) {
        const tglMain = formPesan.tanggal;
        const jamMulaiInt = parseInt(formPesan.jam_mulai.split(':')[0]);
        let hitungHargaFinal = 0;
        for (let i = 0; i < formPesan.durasi; i++) {
          const jamSedangDicek = jamMulaiInt + i;
          let hargaJamIni = hargaPerJamNormal; 
          const promoAktif = promos.find(p => {
            if (!p.is_active || !p.jam_mulai || !p.jam_selesai) return false;
            if (tglMain < p.tgl_mulai || tglMain > p.tgl_selesai) return false;
            if (formPesan.durasi < p.minimal_jam_main) return false; 
            const pMulaiInt = parseInt(p.jam_mulai.split(':')[0]);
            const pSelesaiInt = p.jam_selesai.startsWith('23:59') ? 24 : parseInt(p.jam_selesai.split(':')[0]);
            return jamSedangDicek >= pMulaiInt && jamSedangDicek < pSelesaiInt;
          });
          if (promoAktif) { hargaJamIni = promoAktif.harga_promo; isPromoDipakai = true; }
          hitungHargaFinal += hargaJamIni; 
        }
        hargaFinal = hitungHargaFinal;
        totalDiskon = hargaNormal - hargaFinal;
      }
    }

    const handleBukaKonfirmasi = () => {
      if(!formPesan.nama || !formPesan.no_wa || !formPesan.tanggal || !formPesan.lapangan_id || !formPesan.jam_mulai) {
        showAlert("Error", "Harap isi semua data dengan lengkap, termasuk No. WhatsApp!", "⚠️"); return;
      }
      
      if(formPesan.no_wa.length < 11) {
        setWaErrorKasir("*Minimal 11 angka!"); 
        if (waInputKasirRef && waInputKasirRef.current) {
          waInputKasirRef.current.focus(); 
          waInputKasirRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }
      setWaErrorKasir("");

      // 👇 Validasi Massal 👇
      const adaBentrok = previewBulk.some(item => item.is_bentrok);
      if (formPesan.kategori !== 'Reguler' && previewBulk.length === 0) {
          showAlert("Perhatian", "Silakan klik 'Cek & Generate Jadwal' terlebih dahulu!", "⚠️"); return;
      }
      if (adaBentrok) {
          showAlert("Jadwal Bentrok", "Terdapat jadwal yang bentrok (warna merah). Silakan geser ke tanggal/jam yang kosong!", "❌"); return;
      }

      let namaPelanggan = formPesan.nama;
      if (formPesan.kategori === 'Rutin') namaPelanggan += ' [RUTIN]';
      else if (isMemberPromo) namaPelanggan += ' [MEMBER PROMO]';
      else if (formPesan.kategori === 'Member Eksklusif') namaPelanggan += ' [MEMBER EKSKLUSIF]';

      setConfirmBookingModal({
        isOpen: true,
        data: {
          nama_pemesan: namaPelanggan,
          no_wa: formPesan.no_wa,
          nama_lapangan: lapanganTerpilih.nama_lapangan,
          lapangan_id: formPesan.lapangan_id,
          tanggal_main: formPesan.tanggal,
          waktu: `${formPesan.jam_mulai} - ${jamSelesaiTampil === '24:00' ? '23:59' : jamSelesaiTampil}`,
          durasi: formPesan.durasi,
          total_harga: (formPesan.status === 'DP' && !isMember) ? hargaFinal / 2 : hargaFinal, 
          status_pembayaran: isMember ? 'Lunas' : formPesan.status,
          kategori: formPesan.kategori,
          is_bulk: formPesan.kategori !== 'Reguler', // Penanda massal
          bulk_data: previewBulk, // Bawa data preview untuk disimpan
          harga_per_pertemuan: hargaFinal // Bawa nominal harga
        }
      });
    };

    const durasiOptions = [];
    for(let i=1; i<=batasDurasiMax; i++) durasiOptions.push(i);

    return (
      <div className="admin-table-container" style={{ paddingBottom: '40px' }}>
        {/* 👇 HEADER KASIR DITAMBAH 2 TOMBOL MEMBER 👇 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>📝 Kasir: Pesan Jadwal Manual</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setModalInfoMember(true)} style={{ padding: '8px 15px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Info Member</button>
            <button onClick={() => setModalDaftarMember(true)} style={{ padding: '8px 15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Daftar Member Baru</button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>
          
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 'bold' }}>Nama Pelanggan:</label>
              {/* 👇 HANYA BISA DIISI HURUF DAN SPASI 👇 */}
              <input type="text" className="input-search" placeholder="Masukkan nama pelanggan..." value={formPesan.nama} 
                onChange={e => setFormPesan({...formPesan, nama: e.target.value.replace(/[^a-zA-Z\s]/g, '')})} 
                disabled={formPesan.isLocked} 
                style={{ opacity: formPesan.isLocked ? 0.7 : 1, width: '100%', margin: 0, height: '42px', boxSizing: 'border-box' }}
              />
            </div>
            
            {/* 👇 INPUT NO WA BARU DI KASIR 👇 */}
            <div className="form-group" style={{ flex: 1, minWidth: '200px', position: 'relative' }}> {/* 👈 Tambah position relative */}
              <label style={{ fontWeight: 'bold' }}>No. WhatsApp:</label>
              <input 
                ref={waInputKasirRef}
                type="tel" 
                className="input-search" 
                placeholder="Cth: 08123456789" 
                value={formPesan.no_wa} 
                onChange={e => setFormPesan({...formPesan, no_wa: e.target.value.replace(/[^0-9]/g, '')})} 
                disabled={formPesan.isLocked} 
                style={{ 
                  opacity: formPesan.isLocked ? 0.7 : 1, 
                  width: '100%', margin: 0, height: '42px', boxSizing: 'border-box',
                  border: waErrorKasir ? '2px solid #ef4444' : '',
                  transition: 'all 0.3s ease'
                }}
              />
              {/* 👇 Teks error melayang (absolute) tanpa efek bold agar layout tidak bergeser 👇 */}
              {waErrorKasir && <span style={{ color: '#ef4444', fontSize: '0.8rem', position: 'absolute', left: 0, bottom: '-20px' }}>{waErrorKasir}</span>}
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 'bold' }}>Kategori Pelanggan:</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
              
              {/* JIKA TIDAK DILOCK, TAMPILKAN REGULER & RUTIN SAJA */}
              {!formPesan.isLocked ? (
                ['Reguler', 'Rutin'].map(kat => (
                  <button 
                    key={kat} type="button" onClick={() => handleKategoriChange(kat)}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', fontSize: '0.9rem',
                      border: formPesan.kategori === kat ? '2px solid var(--wijaya-blue)' : '1px solid var(--border-color)',
                      background: formPesan.kategori === kat ? 'var(--wijaya-blue)' : 'var(--bg-input)',
                      color: formPesan.kategori === kat ? '#fff' : 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                    {kat}
                  </button>
                ))
              ) : (
                /* 👇 JIKA DILOCK DARI MENU MEMBER, TAMPILKAN KATEGORI & TOMBOL KELUAR 👇 */
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    type="button" disabled
                    style={{
                      padding: '8px 14px', borderRadius: '8px', fontSize: '0.9rem',
                      border: '2px solid var(--wijaya-blue)', background: 'var(--wijaya-blue)',
                      color: '#fff', fontWeight: 'bold', cursor: 'not-allowed', opacity: 0.8
                    }}>
                    {formPesan.kategori}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFormPesan({ nama: '', no_wa: '', kategori: 'Reguler', isLocked: false, tanggal: '', lapangan_id: '', jam_mulai: '', durasi: 1, status: 'Lunas' })}
                    style={{
                      padding: '8px 14px', borderRadius: '8px', fontSize: '0.9rem',
                      border: '2px solid #ef4444', background: '#fef2f2',
                      color: '#ef4444', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* DROPDOWN RUTIN */}
          {!formPesan.isLocked && formPesan.kategori === 'Rutin' && (
            <div className="form-group" style={{ marginTop: '5px', background: 'var(--bg-hover)', padding: '12px', borderRadius: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Pesan Rutin Untuk Berapa Minggu?</label>
              <select className="input-filter" value={formPesan.jumlah_pekan} onChange={e => {setFormPesan({...formPesan, jumlah_pekan: parseInt(e.target.value)}); setPreviewBulk([]);}} style={{ width: '100%', marginTop: '5px' }}>
                <option value={2}>2 Minggu</option>
                <option value={3}>3 Minggu</option>
                <option value={4}>4 Minggu</option>
                <option value={5}>5 Minggu</option>
                <option value={6}>6 Minggu</option>
                <option value={7}>7 Minggu</option>
                <option value={8}>8 Minggu</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 'bold' }}>Tanggal Main:</label>
              {/* 👇 Tambahkan max="2026-12-31" di dalam input ini 👇 */}
              <input type="date" className="input-filter" value={formPesan.tanggal} min={minHariIni} max="2026-12-31" onChange={handleTanggalChange} onClick={e => e.target.showPicker && e.target.showPicker()} style={{ width: '100%' }} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 'bold' }}>Pilih Lapangan:</label>
              <select className="input-filter" value={formPesan.lapangan_id} onChange={e => setFormPesan({...formPesan, lapangan_id: e.target.value, jam_mulai: ''})} style={{ width: '100%' }}>
                <option value="" disabled>-- Pilih Lapangan --</option>
                {daftarLapangan.map(l => <option key={l.id} value={l.id}>{l.nama_lapangan}</option>)}
              </select>
            </div>
          </div>

          {formPesan.tanggal && formPesan.lapangan_id && (
            <>
              {isMember && formPesan.nama && (
                <div style={{ background: sisaKuotaPekanIni === 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: sisaKuotaPekanIni === 0 ? '1px solid #ef4444' : '1px solid #10b981', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                  <p style={{ margin: '0', fontWeight: 'bold', color: sisaKuotaPekanIni === 0 ? '#ef4444' : '#10b981' }}>
                    📊 Sisa Kuota Pekan Ini: {sisaKuotaPekanIni} Jam (Terpakai {jamTerpakai} Jam)
                  </p>
                </div>
              )}

              <div className="form-group">
                <label style={{ fontWeight: 'bold' }}>Pilih Jam Mulai:</label>
                
                {/* 👇 JURUS GRID PASTI PAS: 3 HP, 4 Tablet, 5 Laptop 👇 */}
                <style>{`
                  .grid-jam-responsif {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr); /* Wajib 3 Kolom di HP */
                    gap: 8px;
                    margin-top: 8px;
                  }
                  @media (min-width: 600px) {
                    .grid-jam-responsif { grid-template-columns: repeat(4, 1fr); } /* Wajib 4 Kolom di Tablet */
                  }
                  @media (min-width: 900px) {
                    .grid-jam-responsif { grid-template-columns: repeat(5, 1fr); } /* Wajib 5 Kolom di Laptop */
                  }
                `}</style>

                <div className="grid-jam-responsif">
                  {slotJamAdmin.map(jam => {
                    const penuh = isJamPenuh(jam);
                    const lewat = isJamLewat(jam);
                    const dilarangMember = isMemberPromo && parseInt(jam.split(':')[0]) >= 14;
                    const kuotaHabis = isMember && sisaKuotaPekanIni === 0;
                    
                    let aman = true;
                    if (penuh || lewat || dilarangMember || kuotaHabis) aman = false;
                    else {
                      const jamInt = parseInt(jam.split(':')[0]);
                      for(let i = 0; i < formPesan.durasi; i++){
                        let jamBerjalan = jamInt + i;
                        let jamFormat = `${jamBerjalan < 10 ? '0' : ''}${jamBerjalan}:00`;
                        if(jamBerjalan > 23 || isJamPenuh(jamFormat) || isJamLewat(jamFormat) || (isMemberPromo && jamBerjalan >= 14)) {
                          aman = false; break;
                        }
                      }
                    }

                    const terpilih = isSlotSelected(jam);
                    let teksTombol = jam;
                    if (penuh) teksTombol = 'Penuh';
                    else if (lewat || dilarangMember) teksTombol = <span style={{ textDecoration: 'line-through' }}>{jam}</span>;

                    return (
                      <button 
                        key={jam} type="button" className="btn-jadwal-admin" disabled={!aman} onClick={() => handlePilihJam(jam)} 
                        style={{ 
                          borderRadius: '6px', 
                          border: terpilih ? '2px solid var(--wijaya-blue)' : '1px solid var(--border-color)', 
                          background: !aman ? 'var(--bg-hover, #f1f5f9)' : (terpilih ? 'var(--wijaya-blue)' : 'var(--bg-input)'), 
                          color: !aman ? '#64748b' : (terpilih ? '#fff' : 'var(--text-primary)'), 
                          cursor: !aman ? 'not-allowed' : 'pointer', 
                          fontWeight: 'bold', 
                          opacity: !aman ? 0.6 : 1,
                          padding: '10px 0', /* 👈 Pastikan padding aman */
                          width: '100%',     /* 👈 Paksa memenuhi kotak grid */
                          boxSizing: 'border-box'
                        }}>
                        {teksTombol}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 👇 DIKEMBALIKAN: Blok Durasi Main yang tidak sengaja tertimpa 👇 */}
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Durasi Main:</label>
                <div className="durasi-grid-mobile" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '5px' }}>
                  {durasiOptions.length === 0 ? (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', fontStyle: 'italic' }}>Kuota pekan ini sudah habis.</p>
                  ) : (
                    durasiOptions.map(d => {
                      let isDisabled = false;
                      if (formPesan.jam_mulai) isDisabled = d > maxDurasi; 
                      return (
                        <button 
                          key={d} type="button" className="btn-jadwal-admin" disabled={isDisabled} onClick={() => setFormPesan({...formPesan, durasi: d})} 
                          style={{ 
                            borderRadius: '8px', border: formPesan.durasi === d ? '2px solid var(--wijaya-blue)' : '1px solid var(--border-color)', 
                            background: formPesan.durasi === d ? 'var(--wijaya-blue)' : 'var(--bg-input)', 
                            color: formPesan.durasi === d ? '#fff' : 'var(--text-primary)', cursor: isDisabled ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: isDisabled ? 0.4 : 1,
                            whiteSpace: 'nowrap',
                            padding: '10px 20px',
                            flex: '1 1 auto', 
                            minWidth: '70px'
                          }}>
                          {d} Jam
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {formPesan.jam_mulai && (
            <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '10px' }}>
              <p style={{ margin: '0 0 15px 0', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                🕒 Waktu Main: <span className="teks-waktu-main">{formPesan.jam_mulai} - {jamSelesaiTampil}</span>
              </p>

              <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                {!isMember && (
                  <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <span>Jenis Paket:</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{formPesan.kategori}</span>
                  </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      <span>Harga Normal:</span><span>Rp {hargaNormal.toLocaleString('id-ID')}</span>
                    </div>
                    {isPromoDipakai && totalDiskon > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <span>Potongan Promo:</span><span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>-Rp {totalDiskon.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </>
                )}
                
                <div style={{ borderTop: '1px dashed var(--border-color)', margin: '12px 0' }}></div>
                
                <div className="total-bayar-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', fontSize: 'clamp(1rem, 4vw, 1.15rem)', color: 'var(--text-primary)', flexWrap: 'nowrap', gap: '8px' }}>
                  <span style={{ whiteSpace: 'nowrap' }}>Total Bayar {(!isMember && formPesan.status === 'DP') ? '(DP 50%)' : ''}:</span>
                  <span style={{ color: hargaFinal === 0 ? '#10b981' : 'var(--text-primary)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    Rp {(hargaFinal * ((!isMember && formPesan.status === 'DP') ? 0.5 : 1)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              
              {!isMember && (
                <>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', color: 'var(--text-primary)' }}>Uang yang diterima Kasir:</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: formPesan.status === 'DP' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-input)', padding: '10px 15px', borderRadius: '8px', border: formPesan.status === 'DP' ? '2px solid #f59e0b' : '1px solid var(--border-color)', fontWeight: formPesan.status === 'DP' ? 'bold' : 'normal', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={formPesan.status === 'DP'} onChange={() => setFormPesan({...formPesan, status: 'DP'})} /> DP (50%)
                    </label>
                    <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: formPesan.status === 'Lunas' ? 'rgba(36, 45, 102, 0.1)' : 'var(--bg-input)', padding: '10px 15px', borderRadius: '8px', border: formPesan.status === 'Lunas' ? '2px solid var(--wijaya-blue)' : '1px solid var(--border-color)', fontWeight: formPesan.status === 'Lunas' ? 'bold' : 'normal', color: 'var(--text-primary)' }}>
                      <input type="radio" checked={formPesan.status === 'Lunas'} onChange={() => setFormPesan({...formPesan, status: 'Lunas'})} /> LUNAS (100%)
                    </label>
                  </div>
                </>
              )}

              {/* 👇 TOMBOL DIGANTI JADI GENERATE MASSAL & PREVIEW BENTROK 👇 */}
              {formPesan.kategori !== 'Reguler' ? (
                 <>
                   <button disabled={isCheckingBulk} onClick={handleGenerateBulk} style={{ marginTop: '15px', width: '100%', padding: '14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>
                     {isCheckingBulk ? '⏳ Mengecek Kalender...' : 'Cek Jadwal'}
                   </button>
                   
                   {/* TAMPILAN PREVIEW RESOLUSI BENTROK */}
                   {previewBulk.length > 0 && (
                     <div style={{ marginTop: '20px', background: 'transparent', padding: '0', borderRadius: '0', border: 'none' }}>
                       <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                         <h4 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           🗓️ Daftar Pertemuan ({previewBulk.length}x)
                         </h4>
                         
                         {previewBulk.map((item, idx) => {
                            const startHourInt = parseInt(item.jam_mulai_baru.split(':')[0]);
                            const endHourInt = startHourInt + formPesan.durasi;
                            const endHourStr = endHourInt >= 24 ? '23:59' : `${endHourInt < 10 ? '0' : ''}${endHourInt}:00`;
                            
                            return (
                            <div key={item.id_temp} style={{ padding: '15px', marginBottom: '12px', borderRadius: '10px', border: item.is_bentrok ? '2px solid #ef4444' : '2px solid #10b981', background: 'var(--bg-card)' }}>
                               
                               {/* 👇 PERBAIKAN: Status Aman/Bentrok ditaruh di bawah judul pertemuan 👇 */}
                               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginBottom: '15px' }}>
                                  <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Pertemuan {idx + 1}</strong>
                                  <span style={{ 
                                    color: '#fff', 
                                    background: item.is_bentrok ? '#ef4444' : '#10b981', 
                                    padding: '4px 10px', 
                                    borderRadius: '6px', 
                                    fontWeight: 'bold', 
                                    fontSize: '0.8rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    {item.is_bentrok ? '❌ Bentrok' : '✅ Aman'}
                                  </span>
                               </div>
                               
                               {/* 👇 PERBAIKAN: Input Tanggal & Jam dibuat atas-bawah agar lega di HP 👇 */}
                               <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <input 
                                    type="date" 
                                    value={item.tanggal_baru} 
                                    onChange={e => handleUbahJadwalBentrok(item.id_temp, 'tanggal_baru', e.target.value)} 
                                    onClick={e => e.target.showPicker && e.target.showPicker()} 
                                    className="input-filter" 
                                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', margin: 0 }} 
                                  />
                                  <select 
                                    value={item.jam_mulai_baru} 
                                    onChange={e => handleUbahJadwalBentrok(item.id_temp, 'jam_mulai_baru', e.target.value)} 
                                    className="input-filter" 
                                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', cursor: 'pointer', fontSize: '0.9rem', borderRadius: '8px', margin: 0 }}
                                  >
                                     {slotJamAdmin.map(j => <option key={j} value={j}>{j}</option>)}
                                  </select>
                               </div>
                               
                               {/* 👇 Waktu Main yang diposisikan elegan sejajar ikon 👇 */}
                               <div style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <span style={{ fontSize: '1rem', marginTop: '-1px' }}>🕒</span> 
                                    <div>
                                      <span style={{ display: 'block', marginBottom: '2px' }}>Waktu Main: <strong style={{ color: 'var(--text-primary)' }}>{item.jam_mulai_baru} - {endHourStr}</strong></span>
                                      <span style={{ fontSize: '0.85rem' }}>(Durasi: {formPesan.durasi} Jam)</span>
                                    </div>
                                  </div>
                               </div>

                            </div>
                            );
                         })}

                         <button disabled={isMember && sisaKuotaPekanIni === 0} onClick={handleBukaKonfirmasi} style={{ marginTop: '10px', width: '100%', padding: '14px', background: 'var(--color-success, #10b981)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}>
                           Simpan Semua Jadwal
                         </button>
                       </div>
                     </div>
                   )}
                 </>
              ) : (
                 <button onClick={handleBukaKonfirmasi} style={{ marginTop: '25px', width: '100%', padding: '14px', background: 'var(--color-success)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                   Buat Pesanan
                 </button>
              )}

            </div>
          )}
        </div>
      </div>
    );
  };

  // 👇 FUNGSI UNTUK MENU LAPORAN KEUANGAN (SUDAH FIX 100%) 👇
  const renderLaporanKeuangan = () => {
    const dataLaporan = bookings.filter(b => {
      let matchWaktu = true;
      if (bulanLaporan !== 'semua') { const d = new Date(b.tanggal_main); matchWaktu = (d.getMonth() + 1) == parseInt(bulanLaporan) && d.getFullYear() == parseInt(tahunLaporan); }
      return matchWaktu && (searchName ? (b.nama_pemesan || '').toLowerCase().includes(searchName.toLowerCase()) : true);
    });

    let totalLunas = 0; let totalDP = 0;
    dataLaporan.forEach(b => { 
      const s = (b.status_pembayaran || '').toLowerCase();
      if (s === 'lunas') totalLunas += (b.total_harga || 0); 
      else if (s.includes('dp') && !s.includes('batal')) totalDP += ((b.total_harga || 0) / 2); 
    });

    const daftarBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

    const totalPagesLaporan = Math.ceil(dataLaporan.length / itemsPerPage);
    const currentLaporanItems = dataLaporan.slice((currentPageLaporan - 1) * itemsPerPage, currentPageLaporan * itemsPerPage);

    return (
      <div className="admin-table-container container-laporan">
        
        {/* 👇 BARIS 1: HEADER & FILTER WAKTU 👇 */}
        <div className="laporan-header-compact">
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
            📊 Rekapitulasi Kas: {bulanLaporan === 'semua' ? 'Semua Waktu' : `${daftarBulan[parseInt(bulanLaporan) - 1]} ${tahunLaporan}`}
          </h2>
          <div className="laporan-header-kanan">
            <select value={bulanLaporan} onChange={(e) => { setBulanLaporan(e.target.value); setCurrentPageLaporan(1); }} className="input-filter">
              <option value="semua">Semua Bulan</option>
              {daftarBulan.map((b, i) => <option key={i+1} value={i+1}>{b}</option>)}
            </select>
            <input type="number" value={tahunLaporan} onChange={(e) => { setTahunLaporan(e.target.value); setCurrentPageLaporan(1); }} className="input-filter" style={{ width: '90px', display: bulanLaporan === 'semua' ? 'none' : 'block' }} />
            
            {/* Tombol Semua Waktu Baru */}
            <button 
              onClick={() => { setBulanLaporan('semua'); setCurrentPageLaporan(1); }} 
              className={`btn-semua-waktu ${bulanLaporan === 'semua' ? 'active' : ''}`}>
              Semua Waktu
            </button>
          </div>
        </div>

        {/* 👇 BARIS 2: KARTU SUMMARY (STYLE BORDER KIRI TEBAL) 👇 */}
        <div className="laporan-summary-cards">
          {/* Hapus inline-style, biarkan class 'lunas' dan 'dp' yang kerja di CSS */}
          <div className="summary-box lunas">
            <span>Total Lunas (Masuk)</span>
            <h3>Rp {totalLunas.toLocaleString('id-ID')}</h3>
          </div>
          <div className="summary-box dp">
            <span>Total DP (Ditahan)</span>
            <h3>Rp {totalDP.toLocaleString('id-ID')}</h3>
          </div>
          <div className="summary-box bersih">
            <span style={{ color: '#e0e7ff' }}>Total Bersih</span>
            <h2 style={{ color: '#ffffff' }}>Rp {(totalLunas + totalDP).toLocaleString('id-ID')}</h2>
          </div>
        </div>

        {/* 👇 BARIS 3: HEADER RINCIAN & SEARCH BAR (MEMANJANG FULL) 👇 */}
        <div className="rincian-header-row">
          <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>Rincian Transaksi ({dataLaporan.length})</h3>
          
          <div className="search-action-group">
            <input 
              type="text" 
              className="input-search input-search-laporan" 
              placeholder="🔍 Cari nama pelanggan..." 
              value={searchName} 
              onChange={(e) => { setSearchName(e.target.value); setCurrentPageLaporan(1); }}
            />
            {/* Tombol Refresh Anti-Putih */}
            <button 
              onClick={() => { setSearchName(''); fetchAdminData(); setCurrentPageLaporan(1); }} 
              className="btn-refresh-laporan">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* DAFTAR TRANSAKSI*/}
        <div className="laporan-list" style={{ marginTop: '15px' }}>
          {currentLaporanItems.length === 0 ? <p className="empty-log">Tidak ada transaksi yang sesuai pencarian.</p> : currentLaporanItems.map((b, i) => {
            const isBatal = (b.status_pembayaran || '').toLowerCase() === 'batal'; 
            const isLunas = (b.status_pembayaran || '').toLowerCase() === 'lunas';
            let nominal = isBatal ? 0 : (isLunas ? (b.total_harga || 0) : (b.total_harga || 0) / 2);
            
            const jamMulaiInt = parseInt((b.jam_mulai || '00:00').substring(0, 2));
            const jamSelesaiInt = parseInt((b.jam_selesai || '00:00').substring(0, 2));
            let durasi = jamSelesaiInt - jamMulaiInt; if (durasi < 0) durasi += 24;

            // 👇 Gunakan nama asli dari database (termasuk Via Admin / Member)
            let namaTampil = b.nama_pemesan || 'Tanpa Nama';

            return (
              <div className="laporan-item" key={i} style={{
                background: 'var(--bg-card)', 
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                marginBottom: '10px',
                display: 'flex',
                flexDirection: 'column', 
                alignItems: 'stretch', /* 👇 KUNCI 1: Paksa melar ke kiri-kanan melawan class CSS bawaan 👇 */
                gap: '12px',
                opacity: isBatal ? 0.6 : 1,
                width: '100%',
                boxSizing: 'border-box'
              }}>
                
                {/* 👇 HEADER KARTU: Lapangan (Kiri) & Status Badge (Kanan) 👇 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' /* 👈 KUNCI 2: Paksa 100% */ }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', textAlign: 'left' }}>
                    🏸 {b.nama_lapangan}
                  </span>
                  <span className={`lap-badge ${isLunas ? 'lunas' : 'dp'}`} style={{ margin: 0, padding: '4px 12px', fontSize: '0.75rem', borderRadius: '15px', ...(isBatal ? { background: '#ef4444', color: 'white', border: 'none' } : {}) }}>
                    {isBatal ? 'BATAL' : (isLunas ? 'LUNAS' : 'DP')}
                  </span>
                </div>

                {/* 👇 BODY KARTU: Info (Kiri) & Nominal Pendapatan (Kanan Bawah) 👇 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px', width: '100%' /* 👈 KUNCI 3: Paksa 100% */ }}>
                  
                  <div className="lap-info" style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '240px', textAlign: 'left' /* 👈 KUNCI 4: Paksa teks rata kiri */, ...(isBatal ? { textDecoration: 'line-through' } : {}) }}>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                      {namaTampil}
                    </strong>
                    
                    {/* 👇 FORMAT BARU: Tanggal | Jam 👇 */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>📅 {b.tanggal_main}</span>
                      <span>|</span>
                      <span style={{ whiteSpace: 'nowrap' }}>⏰ {(b.jam_mulai || '').substring(0,5)} - {(b.jam_selesai || '').substring(0,5)}</span>
                    </div>
                    
                    {/* 👇 FORMAT BARU: Durasi | WA 👇 */}
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <span style={{ whiteSpace: 'nowrap' }}>⏳ {durasi} Jam</span>
                      {b.no_wa && (
                        <>
                          <span>|</span>
                          <span style={{ whiteSpace: 'nowrap' }}>📱 {b.no_wa}</span>
                        </>
                      )}
                    </div>
                    
                    {/* 👇 FORMAT BARU: Tagihan Sendirian di Bawah 👇 */}
                    <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '4px' }}>
                      <span>💰 Tagihan: Rp {(b.total_harga || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* 👇 Nominal Pemasukan (+ Rp) 👇 */}
                  <div className="lap-nominal" style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'right' }}>
                    <span style={{ whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '1.15rem', color: isBatal ? '#ef4444' : '#10b981' }}>
                      {isBatal ? '- Rp 0' : `+ Rp ${nominal.toLocaleString('id-ID')}`}
                    </span>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
        
        {/* PAGINATION */}
        {renderPagination(currentPageLaporan, totalPagesLaporan, setCurrentPageLaporan)}
      </div>
    );
  };
 // 👇 TATA LETAK MENU KELOLA PROMO (TOMBOL KEMBALI KE ATAS & EDIT/HAPUS BISA DIKUNCI) 👇
  const renderKelolaPromo = () => {
    return (
      <div className="admin-table-container">
        <div className="table-header">
          <h2>🏷️ Kelola Promo Harga</h2>
          <button 
            onClick={() => {
              setFormPromo({ 
                id: null, nama_promo: '', tgl_mulai: '', tgl_selesai: '', jam_mulai: '', jam_selesai: '', minimal_jam_main: 1, harga_promo: '',
                hari_berlaku: '', tampilkan_tgl: true, tampilkan_min_jam: true,
                hari_spesifik: [], kecualikan_libur: false
              });
              setIsPromoModalOpen(true);
            }} 
            style={{ padding: '10px 15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Buat Promo Baru
          </button>
        </div>
        <div className="booking-list" style={{ marginTop: '20px' }}>
          {promos.length === 0 && <p className="empty-log">Belum ada promo yang dibuat.</p>}
          {promos.map((promo) => (
            
            /* 👇 KARTU TIDAK DIBIKIN REDUP LAGI, Cuma border kirinya aja jadi abu-abu kalau mati 👇 */
            <div className="booking-card" key={promo.id} style={{ borderLeft: promo.is_active ? '5px solid #10b981' : '5px solid #6b7280' }}>
              
              {/* 👇 BAGIAN HEADER: NAMA, STATUS, & TOMBOL MATIKAN/AKTIFKAN 👇 */}
              <div className="bc-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                <span className="bc-lapangan" style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {promo.nama_promo}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                    background: promo.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)', 
                    color: promo.is_active ? '#059669' : '#6b7280', border: promo.is_active ? '1.5px solid #10b981' : '1.5px solid #6b7280', 
                    margin: 0, display: 'inline-block'
                  }}>
                    {promo.is_active ? 'AKTIF' : 'NON-AKTIF'}
                  </span>

                  {/* TOMBOL TOGGLE */}
                  <button 
                    disabled={isLoadingBtn} onClick={() => handleTogglePromo(promo.id, promo.is_active)} 
                    style={{ padding: '6px 14px', border: 'none', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem', cursor: isLoadingBtn ? 'not-allowed' : 'pointer', background: promo.is_active ? '#f59e0b' : '#10b981', color: '#fff' }}>
                    {isLoadingBtn ? '⏳' : (promo.is_active ? 'Matikan' : 'Aktifkan')}
                  </button>
                </div>
              </div>

              <div className="bc-body" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                
                {/* 👇 KETERANGAN PROMO (RESPONSIF DI HP) 👇 */}
                <div className="bc-info" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  
                  {/* Perbaikan: Menggunakan clamp agar teks mengecil di HP tapi tetap 1rem di Laptop */}
                  <div style={{ color: 'var(--text-primary)', fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.5' }}>
                    <span style={{ flexShrink: 0 }}>📅</span> 
                    <span style={{ wordBreak: 'break-word' }}>{promo.tgl_mulai} – {promo.tgl_selesai ? promo.tgl_selesai : 'Seterusnya (Tanpa Batas)'}</span>
                  </div>
                  
                  <div style={{ color: 'var(--text-primary)', fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.5' }}>
                    <span style={{ flexShrink: 0 }}>⏰</span>
                    <span>Jam: {(promo.jam_mulai || '').substring(0,5)} - {(promo.jam_selesai || '').substring(0,5)} WIB</span>
                  </div>
                  
                  <div style={{ color: 'var(--text-primary)', fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.5' }}>
                    <span style={{ flexShrink: 0 }}>⏳</span>
                    <span>Syarat: Minimal Main {promo.minimal_jam_main} Jam</span>
                  </div>
                  
                  <div style={{ color: 'var(--text-primary)', fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', display: 'flex', alignItems: 'flex-start', gap: '8px', lineHeight: '1.5' }}>
                    <span style={{ flexShrink: 0 }}>💰</span>
                    <span>Harga Diskon: Rp {promo.harga_promo?.toLocaleString('id-ID')}/Jam</span>
                  </div>

                  {/* 👇 Info Tampilan Customer di Kartu Admin 👇 */}
                  <div style={{ marginTop: '5px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--wijaya-blue)', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.6' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Info di Layar Customer:</strong>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ flexShrink: 0 }}>•</span>
                      <span>Teks Kustom: {promo.hari_berlaku ? <strong style={{color: '#10b981'}}>{promo.hari_berlaku}</strong> : '-'}</span>
                    </div>
                    <div>• Tampilan Tanggal: {promo.tampilkan_tgl ? '✅ Ditampilkan' : '❌ Disembunyikan'}</div>
                    <div>• Tulisan Min. Jam: {promo.tampilkan_min_jam ? '✅ Ditampilkan' : '❌ Disembunyikan'}</div>
                  </div>

                </div>
                
                {/* 👇 TOMBOL AKSI DIBUAT FLEKSIBEL 👇 */}
                <div className="bc-actions" style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                  <button 
                    disabled={isLoadingBtn || !promo.is_active} 
                    onClick={() => handleEditPromo(promo)} 
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isLoadingBtn || !promo.is_active ? 'not-allowed' : 'pointer', background: '#3b82f6', color: '#fff', opacity: !promo.is_active ? 0.4 : 1, minWidth: '100px' }}>
                    Edit
                  </button>
                  <button 
                    disabled={isLoadingBtn || !promo.is_active} 
                    onClick={() => handleHapusPromo(promo.id)} 
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isLoadingBtn || !promo.is_active ? 'not-allowed' : 'pointer', background: '#ef4444', color: '#fff', opacity: !promo.is_active ? 0.4 : 1, minWidth: '100px' }}>
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const slotJam = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  
  // 👇 PERBAIKAN KALKULASI DURASI ASLI AGAR 23:59 DIHITUNG 24 👇
  let durasiJamAsli = 1;
  let startHAsli = 0;
  let endHAsli = 0;
  
  if (selectedBooking) {
    startHAsli = parseInt((selectedBooking.jam_mulai || '00:00').split(':')[0]);
    const strSelesai = selectedBooking.jam_selesai || '00:00';
    endHAsli = strSelesai.startsWith('23:59') ? 24 : parseInt(strSelesai.split(':')[0]);
    durasiJamAsli = endHAsli - startHAsli;
    if (durasiJamAsli < 1) durasiJamAsli = 1; 
  }

  let jamPenuhBeneran = Array.isArray(jamPenuhModal) ? [...jamPenuhModal] : [];
  
  if (selectedBooking && selectedBooking.tanggal_main === editTanggal) {
    for(let i = startHAsli; i < endHAsli; i++) {
      jamPenuhBeneran = jamPenuhBeneran.filter(j => j !== `${i < 10 ? '0' : ''}${i}:00`);
    }
  }

  const cekJamMulaiAman = (jamCek) => {
    for(let i = 0; i < durasiJamAsli; i++) {
      const jamDicek = parseInt(jamCek.split(':')[0]) + i;
      if (jamPenuhBeneran.includes(`${jamDicek < 10 ? '0' : ''}${jamDicek}:00`) || jamDicek > 23) return false; 
    }
    const dNow = new Date();
    const timeZoneOffset = dNow.getTimezoneOffset() * 60000;
    const hariIniStr = new Date(dNow.getTime() - timeZoneOffset).toISOString().split('T')[0];
    if (editTanggal === hariIniStr) {
       const jamSekarang = dNow.getHours();
       if (parseInt(jamCek.split(':')[0]) <= jamSekarang) return false;
    }
    return true;
  };

 return (
    <div className="admin-layout">
      <div className="mobile-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <img src="/logo_wijaya_1.png" alt="Logo GOR Wijaya" className="mobile-logo-img" />
        </div>
        <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? "Ganti Mode Terang" : "Ganti Mode Gelap"}>
          <i className={isDarkMode ? "bi bi-sun-fill" : "bi bi-moon-stars-fill"}></i>
        </button>
      </div>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`} 
        style={{ 
          display: 'flex', flexDirection: 'column', 
          width: isSidebarCollapsed ? '0px' : '260px', 
          padding: isSidebarCollapsed ? '0' : '20px 0 0 0', 
          boxSizing: 'border-box', 
          transition: 'all 0.3s ease', 
          overflowX: 'hidden',
          whiteSpace: 'nowrap', 
          height: '100vh',
          opacity: isSidebarCollapsed ? 0 : 1 
        }}>
        
        {/* 👇 LOGO BRAND DENGAN NAMA FILE BARU 👇 */}
        <div className="sidebar-brand" style={{ padding: '0 20px', marginBottom: '30px', textAlign: 'left', display: 'flex', alignItems: 'center' }}>
          <img src="/logo_wijaya_1.png" alt="Wijaya Badminton" style={{ height: '45px', objectFit: 'contain' }} />
        </div>

        {/* 👇 DAFTAR MENU DENGAN EFEK TRANSPARAN YANG ELEGAN 👇 */}
        <ul className="sidebar-menu" style={{ listStyle: 'none', padding: '0 15px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <li onClick={() => { setActiveMenu('dashboard'); setIsSidebarOpen(false); }}
            style={{
              padding: '12px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold', fontSize: '1rem',
              // 👇 PERBAIKAN: Background transparan kemerahan, warna teks adaptif 👇
              background: activeMenu === 'dashboard' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              borderLeft: activeMenu === 'dashboard' ? '4px solid #ef4444' : '4px solid transparent',
              color: activeMenu === 'dashboard' ? '#ef4444' : 'var(--text-primary)', 
              borderRadius: '8px', transition: '0.2s'
            }}>
            <i className="bi bi-grid-1x2-fill" style={{ fontSize: '1.2rem', color: activeMenu === 'dashboard' ? '#ef4444' : 'var(--text-secondary)' }}></i>
            <span>Dashboard</span>
          </li>

          <li onClick={() => { setActiveMenu('pesan'); setIsSidebarOpen(false); }}
            style={{
              padding: '12px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold', fontSize: '1rem',
              background: activeMenu === 'pesan' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              borderLeft: activeMenu === 'pesan' ? '4px solid #ef4444' : '4px solid transparent',
              color: activeMenu === 'pesan' ? '#ef4444' : 'var(--text-primary)', 
              borderRadius: '8px', transition: '0.2s'
            }}>
            <i className="bi bi-plus-circle" style={{ fontSize: '1.2rem', color: activeMenu === 'pesan' ? '#ef4444' : 'var(--text-secondary)' }}></i>
            <span>Pesan Jadwal</span>
          </li>

          <li onClick={() => { setActiveMenu('jadwal'); setIsSidebarOpen(false); }}
            style={{
              padding: '12px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold', fontSize: '1rem',
              background: activeMenu === 'jadwal' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              borderLeft: activeMenu === 'jadwal' ? '4px solid #ef4444' : '4px solid transparent',
              color: activeMenu === 'jadwal' ? '#ef4444' : 'var(--text-primary)', 
              borderRadius: '8px', transition: '0.2s'
            }}>
            <i className="bi bi-calendar-event" style={{ fontSize: '1.2rem', color: activeMenu === 'jadwal' ? '#ef4444' : 'var(--text-secondary)' }}></i>
            <span>Kelola Jadwal</span>
          </li>

          <li onClick={() => { setActiveMenu('promo'); setIsSidebarOpen(false); }}
            style={{
              padding: '12px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold', fontSize: '1rem',
              background: activeMenu === 'promo' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              borderLeft: activeMenu === 'promo' ? '4px solid #ef4444' : '4px solid transparent',
              color: activeMenu === 'promo' ? '#ef4444' : 'var(--text-primary)', 
              borderRadius: '8px', transition: '0.2s'
            }}>
            <i className="bi bi-tags-fill" style={{ fontSize: '1.2rem', color: activeMenu === 'promo' ? '#ef4444' : 'var(--text-secondary)' }}></i>
            <span>Kelola Promo</span>
          </li>

          <li onClick={() => { setActiveMenu('laporan'); setIsSidebarOpen(false); }}
            style={{
              padding: '12px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: 'bold', fontSize: '1rem',
              background: activeMenu === 'laporan' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              borderLeft: activeMenu === 'laporan' ? '4px solid #ef4444' : '4px solid transparent',
              color: activeMenu === 'laporan' ? '#ef4444' : 'var(--text-primary)', 
              borderRadius: '8px', transition: '0.2s'
            }}>
            <i className="bi bi-bar-chart-fill" style={{ fontSize: '1.2rem', color: activeMenu === 'laporan' ? '#ef4444' : 'var(--text-secondary)' }}></i>
            <span>Laporan Keuangan</span>
          </li>

        </ul>
        {/* 👇 BAGIAN BAWAH: TOMBOL LOGOUT 👇 */}
        <div style={{ marginTop: 'auto', padding: '0 15px 15px 15px' }}>
          <button className="btn-logout" onClick={handleLogout} 
            style={{ 
              width: '100%', padding: '12px', background: '#b91c1c', color: '#fff', border: 'none', 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1rem', transition: '0.3s'
            }}>
            <i className="bi bi-box-arrow-right" style={{ fontSize: '1.2rem' }}></i> Logout 
          </button>
        </div>

      </aside>
      <main className="admin-main">
        {/* 👇 PERBAIKAN: Memaksa Header agar Rata Kiri di Semua Layar 👇 */}
        <header className="admin-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          
          {/* Kontainer ditarik full width (100%) dan isinya dirapatkan ke kiri (flex-start) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%', justifyContent: 'flex-start' }}>
            
            <button className="hamburger-btn desktop-only" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>☰</button>
            
            {/* H1 diberi flex: 1 agar teksnya punya ruang luas untuk merapat ke kiri */}
            <h1 style={{ margin: 0, textAlign: 'left', flex: 1 }}>
              {activeMenu === 'dashboard' ? 'Dashboard' : activeMenu === 'jadwal' ? 'Kelola Jadwal' : activeMenu === 'promo' ? 'Kelola Promo' : activeMenu === 'pesan' ? 'Pesan Jadwal' : 'Laporan Keuangan'}
            </h1>
            
          </div>
          
          {/* Tombol Dark Mode didorong ke kanan ujung (marginLeft: auto) */}
          <div className="header-desktop-right" style={{ marginLeft: 'auto' }}>
            <button className="theme-toggle-btn desktop-only" onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? "Ganti Mode Terang" : "Ganti Mode Gelap"}>
              <i className={isDarkMode ? "bi bi-sun-fill" : "bi bi-moon-stars-fill"}></i>
            </button>
          </div>
          
        </header>

        <div className="admin-content">
          {activeMenu === 'dashboard' && renderDashboardUtama()}
          {activeMenu === 'jadwal' && renderKelolaJadwal()}
          {activeMenu === 'promo' && renderKelolaPromo()}
          {activeMenu === 'laporan' && renderLaporanKeuangan()}
          {activeMenu === 'pesan' && renderPesanJadwalAdmin()}
        </div>
      </main>

      {/* 👇 SISTEM ALERT & MODAL TERPUSAT 👇 */}
      {alertConfig.isOpen && (
        <div className="custom-alert-overlay" style={{ zIndex: 10001 }}>
          <div className="custom-alert-box">
            
            {/* KONDISI 1: POP-UP TUTUP GOR */}
            {alertConfig.type === 'form_tutup' ? (
              <>
                <div className="custom-alert-icon">🔴</div>
                <h2 className="custom-alert-title">Tutup GOR</h2>
                <p className="custom-alert-message">Silakan atur tanggal tutup dan pesan pemberitahuan.</p>
                <div className="form-group" style={{ textAlign: 'left', marginTop: '15px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Pesan Penutupan:</label>
                  <textarea className="input-filter" style={{ width: '100%', height: '60px', marginTop: '5px' }} placeholder="Contoh: Sedang ada perbaikan rutin" value={formTutup.pesan} onChange={(e) => setFormTutup({...formTutup, pesan: e.target.value})}></textarea>
                </div>
                {/* 👇 PERBAIKAN: Input Tanggal dibuat vertikal (atas-bawah) agar ukurannya lega 👇 */}
                <div className="form-group" style={{ textAlign: 'left', marginTop: '15px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Tgl Mulai:</label>
                  <input type="date" value={formTutup.tglMulai} className="input-filter" style={{ width: '100%', boxSizing: 'border-box', marginTop: '5px', padding: '10px 12px' }} onChange={(e) => setFormTutup({...formTutup, tglMulai: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                </div>
                <div className="form-group" style={{ textAlign: 'left', marginTop: '15px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Tgl Sampai (Opsional):</label>
                  <input type="date" value={formTutup.tglSampai} className="input-filter" style={{ width: '100%', boxSizing: 'border-box', marginTop: '5px', padding: '10px 12px' }} min={formTutup.tglMulai} onChange={(e) => setFormTutup({...formTutup, tglSampai: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
                </div>
                
                {/* 👇 PERBAIKAN: Tombol Batal & Tutup GOR dibuat sejajar Kiri-Kanan 👇 */}
                <div className="custom-alert-actions" style={{ marginTop: '25px', display: 'flex', flexDirection: 'row', gap: '15px', width: '100%' }}>
                  <button className="btn-alert-cancel" style={{ flex: 1, padding: '12px', margin: 0 }} onClick={closeAlert}>Batal</button>
                  <button disabled={isLoadingBtn || !formTutup.tglMulai} className="btn-alert-confirm danger" style={{ flex: 1, padding: '12px', margin: 0 }} onClick={() => executeToggleGor('tutup', { pesan: formTutup.pesan, tgl_mulai: formTutup.tglMulai, tgl_sampai: formTutup.tglSampai })}>
                    {isLoadingBtn ? '⏳' : 'Tutup GOR'}
                  </button>
                </div>
              </>
              
            // KONDISI 2: POP-UP KONFIRMASI LOGOUT
            ) : alertConfig.type === 'logout' ? (
              <>
                {/* 1. GANTI IKON MENJADI <i class="bi bi-upload"> DAN DIROTASI KE KANAN 90 derajat */}
                <div className="custom-alert-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                  <i 
                    className={alertConfig.icon} 
                    style={{ 
                      fontSize: '3.5rem', 
                      color: 'var(--text-secondary)',
                      //👇 Jurus untuk merotasi ikon ke kanan 90 derajat 👇
                      transform: 'rotate(90deg)', 
                      display: 'inline-block' // Wajib agar transform berfungsi
                    }}
                  ></i>
                </div>
                
                <h2 className="custom-alert-title">{alertConfig.title}</h2>
                <p className="custom-alert-message">{alertConfig.message}</p>
                
                {/* Fitur Lupakan Akun (Hanya muncul jika sebelumnya mencentang "Ingat Akun" saat Login) */}
                {alertConfig.isRemembered && (
                  <div style={{ textAlign: 'left', marginTop: '15px', marginBottom: '15px', padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      <input 
                        type="checkbox" 
                        checked={forgetAccount} 
                        onChange={(e) => setForgetAccount(e.target.checked)} 
                        style={{ width: '16px', height: '16px', margin: 0 }}
                      />
                      Lupakan akun saya di browser ini
                    </label>
                  </div>
                )}

                {/* 2. PENATAAN TOMBOL: Paksa menjadi Baris (Row) Kiri-Kanan */}
                <div className="custom-alert-actions" style={{ 
                  display: 'flex', 
                  flexDirection: 'row', // Paksa menjadi menyamping
                  gap: '15px',          // Jarak antar tombol
                  marginTop: '25px', 
                  width: '100%' 
                }}>
                  
                  {/* Tombol Batal di Kiri (flex: 1 agar ukurannya seimbang) */}
                  <button className="btn-alert-cancel" style={{ flex: 1, margin: 0, padding: '12px' }} onClick={closeAlert}>
                    Batal
                  </button>
                  
                  {/* Tombol Ya, Keluar di Kanan (flex: 1 agar ukurannya seimbang) */}
                  <button className="btn-alert-confirm danger" style={{ flex: 1, margin: 0, padding: '12px' }} onClick={() => {
                    localStorage.removeItem('isAdminLoggedIn');
                    if (forgetAccount) {
                      localStorage.removeItem('rememberAdmin');
                    }
                    closeAlert();
                    navigate('/login');
                  }}>
                    {alertConfig.confirmText}
                  </button>
                  
                </div>
              </>
              
            // KONDISI 3: POP-UP ALERT & KONFIRMASI STANDAR (Hapus/Simpan/Peringatan)
            ) : (
              <>
                <div className="custom-alert-icon">{alertConfig.icon}</div>
                <h2 className="custom-alert-title">{alertConfig.title}</h2>
                <p className="custom-alert-message">{alertConfig.message}</p>
                
                {/* 👇 PERBAIKAN: Layout tombol dibuat menyamping (kiri-kanan) secara seimbang 👇 */}
                <div className="custom-alert-actions" style={{ display: 'flex', flexDirection: 'row', gap: '15px', marginTop: '20px', width: '100%' }}>
                  
                  {alertConfig.type === 'confirm' && (
                    <button className="btn-alert-cancel" style={{ flex: 1, margin: 0, padding: '12px' }} onClick={closeAlert}>
                      Batal
                    </button>
                  )}
                  
                  <button disabled={isLoadingBtn} className={`btn-alert-confirm ${alertConfig.isDanger ? 'danger' : ''}`} style={{ flex: 1, margin: 0, padding: '12px' }} onClick={() => { if (alertConfig.onConfirm) alertConfig.onConfirm(); else closeAlert(); }}>
                    {isLoadingBtn ? '⏳' : alertConfig.confirmText}
                  </button>
                  
                </div>
              </>
            )}
            
          </div>
        </div>
      )}

      {/* 👇 POP-UP BUAT/EDIT PROMO BARU (SUDAH DIRAPIHKAN) 👇 */}
      {isPromoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box promo-modal" style={{ width: '95%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>🏷️ {formPromo.id ? 'Edit Promo Harga' : 'Buat Promo Baru'}</h2>
            
            <div className="form-group-promo">
              <label>Nama Promo (Opsional):</label>
              <input type="text" placeholder="Cth: Promo Harian" value={formPromo.nama_promo} onChange={(e) => setFormPromo({...formPromo, nama_promo: e.target.value})} className="input-filter"/>
            </div>

            <div className="form-group-flex">
              <div className="form-group-promo">
                <label>Tgl Mulai:</label>
                <input type="date" value={formPromo.tgl_mulai} min={minHariIni} onChange={(e) => {
                    const baruTglMulai = e.target.value;
                    if(formPromo.tgl_selesai && formPromo.tgl_selesai <= baruTglMulai) {
                      setFormPromo({...formPromo, tgl_mulai: baruTglMulai, tgl_selesai: ''});
                    } else { setFormPromo({...formPromo, tgl_mulai: baruTglMulai}); }
                  }} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="input-filter"/>
              </div>
              <div className="form-group-promo">
                <label>Tgl Selesai:</label>
                <input type="date" value={formPromo.tgl_selesai} min={getMinTglSelesaiPromo()} onChange={(e) => setFormPromo({...formPromo, tgl_selesai: e.target.value})} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="input-filter"/>
              </div>
            </div>

            <div className="form-group-flex">
              <div className="form-group-promo">
                <label>Jam Mulai:</label>
                <select value={formPromo.jam_mulai} onChange={(e) => setFormPromo({...formPromo, jam_mulai: e.target.value})} className="input-filter" style={{ cursor: 'pointer' }}>
                  <option value="" disabled>-- Pilih --</option>
                  {opsiJamPromo.map(jam => <option key={jam} value={jam}>{jam}</option>)}
                </select>
              </div>
              <div className="form-group-promo">
                <label>Jam Selesai:</label>
                <select value={formPromo.jam_selesai} onChange={(e) => setFormPromo({...formPromo, jam_selesai: e.target.value})} className="input-filter" style={{ cursor: 'pointer' }}>
                  <option value="" disabled>-- Pilih --</option>
                  {opsiJamPromo.map(jam => <option key={jam} value={jam}>{jam}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group-flex">
              <div className="form-group-promo">
                <label>Syarat Min. Main (Jam):</label>
                <input type="number" min="1" value={formPromo.minimal_jam_main} onChange={(e) => setFormPromo({...formPromo, minimal_jam_main: e.target.value})} className="input-filter"/>
              </div>
              <div className="form-group-promo">
                <label>Harga Promo (Rp/Jam):</label>
                <input type="number" placeholder="Cth: 20000" value={formPromo.harga_promo} onChange={(e) => setFormPromo({...formPromo, harga_promo: e.target.value})} className="input-filter"/>
              </div>
            </div>

            {/* 👇 PENGATURAN LOGIKA HARI & TANGGAL MERAH 👇 */}
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '20px 0 15px 0', paddingTop: '15px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '12px' }}>
                📅 Hari Berlaku Promo
              </h3>

              <label style={{ fontSize: '0.9rem', display: 'block', marginBottom: '10px', color: 'var(--text-secondary)' }}>Pilih Hari (Kosongkan jika berlaku setiap hari):</label>
              
              {/* 👇 Checkbox Hari Dibuat GRID agar sejajar dan tidak berantakan di HP 👇 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                {[{id: '1', label: 'Senin'}, {id: '2', label: 'Selasa'}, {id: '3', label: 'Rabu'}, {id: '4', label: 'Kamis'}, {id: '5', label: 'Jumat'}, {id: '6', label: 'Sabtu'}, {id: '7', label: 'Minggu'}].map(hari => (
                  <label key={hari.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-hover)', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
                    <input 
                      type="checkbox" 
                      checked={formPromo.hari_spesifik.includes(hari.id)}
                      onChange={(e) => {
                        const newHari = e.target.checked 
                          ? [...formPromo.hari_spesifik, hari.id] 
                          : formPromo.hari_spesifik.filter(h => h !== hari.id);
                        setFormPromo({...formPromo, hari_spesifik: newHari});
                      }}
                      style={{ flexShrink: 0, margin: 0 }}
                    />
                    <span style={{ whiteSpace: 'nowrap' }}>{hari.label}</span>
                  </label>
                ))}
              </div>

              {/* 👇 Box Merah Dibuat Flex-Start agar icon tidak turun saat teks kepanjangan 👇 */}
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#ef4444', lineHeight: '1.4' }}>
                  <input 
                    type="checkbox" 
                    checked={formPromo.kecualikan_libur}
                    onChange={(e) => setFormPromo({...formPromo, kecualikan_libur: e.target.checked})}
                    style={{ width: '18px', height: '18px', accentColor: '#ef4444', flexShrink: 0, marginTop: '2px' }}
                  />
                  <span>Matikan Promo Saat Tanggal Merah / Libur Nasional</span>
                </label>
                <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '28px', marginTop: '6px', lineHeight: '1.4' }}>
                  Jika dicentang, promo otomatis dibatalkan oleh sistem saat pelanggan memesan di hari libur.
                </span>
              </div>
            </div>

            {/* 👇 SETINGAN TAMPILAN CUSTOMER 👇 */}
            <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '20px 0 15px 0', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--wijaya-blue)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                👁️ Pengaturan Tampilan di Layar Customer
              </h3>
              
              <div className="form-group-promo" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Ganti Tanggal Menjadi Teks Hari (Opsional):</label>
                <input type="text" placeholder="Cth: Khusus Senin - Kamis" value={formPromo.hari_berlaku} onChange={(e) => setFormPromo({...formPromo, hari_berlaku: e.target.value})} className="input-filter" style={{ width: '100%', boxSizing: 'border-box' }}/>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'block', lineHeight: '1.4' }}>*Jika diisi, tulisan ini akan menggantikan tanggal di aplikasi customer.</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', lineHeight: '1.4' }}>
                  <input type="checkbox" checked={formPromo.tampilkan_tgl} onChange={(e) => setFormPromo({...formPromo, tampilkan_tgl: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }} />
                  <span>Tampilkan Tanggal (Bulan/Tahun)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.95rem', lineHeight: '1.4' }}>
                  <input type="checkbox" checked={formPromo.tampilkan_min_jam} onChange={(e) => setFormPromo({...formPromo, tampilkan_min_jam: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }} />
                  <span>Tampilkan Syarat (Min. Main)</span>
                </label>
              </div>
            </div>

            <div className="modal-actions-promo">
              <button className="btn-batal" onClick={() => setIsPromoModalOpen(false)}>Batal</button>
              <button disabled={isLoadingBtn} className="btn-simpan" onClick={handleSimpanPromo}>{isLoadingBtn ? '⏳ Memproses...' : 'Simpan Promo'}</button>
            </div>
          </div>
        </div>
      )}
      
      {/* POP-UP RESCHEDULE */}
      {isModalOpen && (
        <div className="modal-overlay">
          
          {/* 👇 INI DIA WADAH YANG HILANG! Kita pasang kembali modal-box nya 👇 */}
          <div className="modal-box" style={{ maxHeight: '90vh', overflowY: 'auto', width: '95%', maxWidth: '500px' }}>
            
            <div className="modal-header-card" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>📅 Pindah Jadwal - {selectedBooking?.nama_pemesan}</h2>
            </div>

            {/* 👇 CARD 1: INFORMASI JADWAL LAMA (CERDAS DETEKSI REGULER VS RUTIN) 👇 */}
            {(() => {
               const namaUpper = (selectedBooking?.nama_pemesan || '').toUpperCase();
               const isReguler = !namaUpper.includes('MEMBER') && !namaUpper.includes('RUTIN');

               if (isReguler) {
                  // TAMPILAN REGULER: Hanya Info Singkat, Tanpa Dropdown yang Bikin Pusing
                  return (
                     <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Jadwal Asli:</span><br/>
                        <strong style={{ color: '#fff', fontSize: '1.1rem', display: 'inline-block', marginTop: '5px' }}>
                          📅 {selectedBooking?.tanggal_main} | ⏰ {selectedBooking?.jam_mulai?.substring(0,5)} - {selectedBooking?.jam_selesai?.substring(0,5)}
                        </strong>
                     </div>
                  );
               } else {
                  // TAMPILAN RUTIN/MEMBER: Tampilkan Dropdown Pertemuan
                  return (
                    <div style={{ background: 'var(--bg-hover)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                      <label style={{ fontWeight: 'bold', fontSize: '1.05rem', display: 'block', marginBottom: '5px' }}>Pilih Jadwal Lama (Yang Ingin Dipindah):</label>
                      <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Berikut daftar pertemuan yang belum terlewat untuk pelanggan ini.</p>
                      <select 
                        className="input-filter" 
                        style={{ width: '100%', cursor: 'pointer', background: 'var(--bg-input)' }}
                        value={selectedBooking?.id}
                        onChange={(e) => {
                          const bId = parseInt(e.target.value);
                          const newBooking = daftarJadwalLama.find(b => b.id === bId);
                          if (newBooking) {
                            setSelectedBooking(newBooking);
                            setEditLapanganId(newBooking.lapangan_id); 
                            applyLompatHari(newBooking);
                          }
                        }} 
                      >
                        <option value="" disabled>-- Pilih Jadwal Lain --</option>
                        {daftarJadwalLama.map(b => (
                          <option key={b.id} value={b.id}>{b.lapangan?.nama_lapangan} 📅 {b.tanggal_main} | ⏰ {b.jam_mulai?.substring(0,5)} - {b.jam_selesai?.substring(0,5)}</option>
                        ))}
                      </select>
                    </div>
                  );
               }
            })()}

            {/* 👇 CARD 2: PILIH LAPANGAN BARU 👇 */}
            <div className="form-group" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Pindah ke Lapangan:</label>
              <select 
                value={editLapanganId} 
                onChange={(e) => {
                  setEditLapanganId(e.target.value);
                  setEditSplits([{ jam_mulai: '', jam_selesai: '' }]); 
                }} 
                className="input-filter" style={{ cursor: 'pointer', width: '100%' }}>
                <option value="" disabled>-- Pilih Lapangan --</option>
                {daftarLapangan.map(l => (
                  <option key={l.id} value={l.id}>{l.nama_lapangan}</option>
                ))}
              </select>
            </div>

            {/* 👇 CARD 3: PILIH TANGGAL BARU 👇 */}
            <div className="form-group" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>Pindah ke Tanggal Baru:</label>
              <input 
                type="date" 
                value={editTanggal} 
                min={selectedBooking?.tanggal_main} 
                onChange={(e) => { 
                  const tglBaru = e.target.value;
                  if (tglBaru < selectedBooking?.tanggal_main) { showAlert("Ditolak", "Tanggal baru tidak boleh mundur sebelum jadwal aslinya!", "⚠️"); return; }
                  if ((selectedBooking?.nama_pemesan || '').toUpperCase().includes('PROMO')) {
                    const day = new Date(tglBaru).getDay();
                    if (day === 0 || day === 5 || day === 6) { showAlert("Ditolak", "Member Promo hanya bisa pindah ke hari Senin - Kamis!", "⚠️"); return; }
                  }
                  setEditTanggal(tglBaru); setEditSplits([{ jam_mulai: '', jam_selesai: '' }]);
                }} 
                onClick={(e) => e.target.showPicker && e.target.showPicker()} 
                className="input-filter" style={{ cursor: 'pointer', width: '100%' }} 
              />
            </div>

            {/* 👇 CARD 4: PEMILIHAN JAM (REGULER OTOMATIS & MEMBER BISA PECAH) 👇 */}
            {(() => {
              const namaUpper = (selectedBooking?.nama_pemesan || '').toUpperCase();
              const isReguler = !namaUpper.includes('MEMBER') && !namaUpper.includes('RUTIN');

              if (isReguler) {
                  // 👉 TAMPILAN KHUSUS PELANGGAN REGULER (FULL WIDTH, ATAS BAWAH)
                  return (
                    <div className="split-section" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.1)', marginTop: '25px' }}>
                      <label style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--wijaya-blue)', display: 'block', marginBottom: '15px' }}>Pindah ke Jam Baru:</label>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="form-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Jam Mulai:</label>
                            <select 
                              value={editSplits[0]?.jam_mulai || ''} 
                              onChange={(e) => {
                                  const val = e.target.value;
                                  const startH = parseInt(val.split(':')[0]);
                                  const endH = startH + durasiJamAsli;
                                  const formatEnd = endH >= 24 ? '23:59:00' : `${endH < 10 ? '0' : ''}${endH}:00`;
                                  setEditSplits([{ jam_mulai: val, jam_selesai: formatEnd }]);
                              }} 
                              className="input-filter" style={{ width: '100%', cursor: 'pointer', padding: '12px' }}>
                              <option value="" disabled>-- Pilih Jam Mulai --</option>
                              
                              {slotJam.map(jam => {
                                let aman = true;
                                let isJamAsli = false; // 👈 Variabel penanda jadwal lama
                                const jamInt = parseInt(jam.split(':')[0]);

                                // 👇 1. Cek apakah ini jam asli (di hari & lapangan yang sama) 👇
                                if (editTanggal === selectedBooking?.tanggal_main && String(editLapanganId) === String(selectedBooking?.lapangan_id)) {
                                   if (jamInt >= startHAsli && jamInt < endHAsli) {
                                       aman = false;
                                       isJamAsli = true;
                                   }
                                }

                                // 2. Cek apakah bentrok dengan jadwal orang lain
                                for(let i = 0; i < durasiJamAsli; i++) {
                                  const jamDicek = jamInt + i;
                                  const formatJamCek = `${jamDicek < 10 ? '0' : ''}${jamDicek}:00`;
                                  if (jamPenuhBeneran.includes(formatJamCek) || jamDicek > 23) { aman = false; break; }
                                }

                                // 3. Cek apakah jam sudah terlewat hari ini
                                const dNow = new Date();
                                const timeZoneOffset = dNow.getTimezoneOffset() * 60000;
                                const hariIniStr = new Date(dNow.getTime() - timeZoneOffset).toISOString().split('T')[0];
                                if (editTanggal === hariIniStr) {
                                   const jamSekarang = dNow.getHours();
                                   if (jamInt <= jamSekarang) aman = false;
                                }

                                return (
                                  <option 
                                    key={jam} 
                                    value={jam} 
                                    disabled={!aman} 
                                    // 👇 Beri efek coretan dan warna merah jika itu jadwal lama 👇
                                    style={isJamAsli ? { textDecoration: 'line-through', color: '#ef4444' } : {}}
                                  >
                                    {jam} {isJamAsli ? '(Jadwal Lama)' : (!aman ? '(Penuh)' : '')}
                                  </option>
                                );
                              })}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Jam Selesai (Otomatis):</label>
                            <select value={editSplits[0]?.jam_selesai || ''} disabled className="input-filter" style={{ width: '100%', cursor: 'not-allowed', opacity: 0.7, background: 'var(--bg-hover)', padding: '12px' }}>
                                {editSplits[0]?.jam_selesai ? (
                                    <option value={editSplits[0].jam_selesai}>
                                        {editSplits[0].jam_selesai.substring(0,5)} ({durasiJamAsli} Jam)
                                    </option>
                                ) : (
                                    <option value="">-- Otomatis Mengisi --</option>
                                )}
                            </select>
                        </div>
                      </div>
                    </div>
                  );
              } else {
                  // 👉 TAMPILAN KHUSUS MEMBER / RUTIN (FITUR PECAH JAM MAIN)
                  return (
                    <div className="split-section" style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.1)', marginTop: '25px' }}>
                      <div className="split-header" style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--wijaya-blue)' }}>Pecah Jam Main</label>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Target Durasi: {durasiJamAsli} Jam</span>
                      </div>
                      
                      {(() => {
                        const totalTerisi = editSplits.reduce((acc, curr) => {
                          if(curr.jam_mulai && curr.jam_selesai) {
                              const start = parseInt(curr.jam_mulai.split(':')[0]);
                              const end = curr.jam_selesai.startsWith('23:59') ? 24 : parseInt(curr.jam_selesai.split(':')[0]);
                              return acc + (end - start);
                          } return acc;
                        }, 0);
                        const sisaTargetMurni = durasiJamAsli - totalTerisi;

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {editSplits.map((split, index) => {
                              let curDurasi = 0;
                              if (split.jam_mulai && split.jam_selesai) {
                                  const st = parseInt(split.jam_mulai.split(':')[0]);
                                  const en = split.jam_selesai.startsWith('23:59') ? 24 : parseInt(split.jam_selesai.split(':')[0]);
                                  curDurasi = en - st;
                              }
                              const maxDropdown = sisaTargetMurni + curDurasi;

                              const jamTerpakaiDiSplitLain = [];
                              editSplits.forEach((s, i) => {
                                  if (i !== index && s.jam_mulai) {
                                      const startH = parseInt(s.jam_mulai.split(':')[0]);
                                      let endH = startH + 1;
                                      if (s.jam_selesai) {
                                          endH = s.jam_selesai.startsWith('23:59') ? 24 : parseInt(s.jam_selesai.split(':')[0]);
                                      }
                                      for (let h = startH; h < endH; h++) {
                                          jamTerpakaiDiSplitLain.push(`${h < 10 ? '0' : ''}${h}:00`);
                                      }
                                  }
                              });

                              return (
                                <div key={index} className="split-row" style={{ display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                                  <select 
                                    value={split.jam_mulai} 
                                    onChange={(e) => {
                                        const newSplits = [...editSplits];
                                        newSplits[index].jam_mulai = e.target.value;
                                        newSplits[index].jam_selesai = ''; 
                                        setEditSplits(newSplits);
                                    }} 
                                    className="input-filter" style={{ flex: 1, cursor: 'pointer' }}>
                                    <option value="" disabled>-- Mulai --</option>
                                    
                                    {slotJam.map(jam => {
                                      let aman = cekJamMulaiAman(jam);
                                      let isJamAsli = false; // 👈 Variabel penanda jadwal lama
                                      const jamInt = parseInt(jam.split(':')[0]);

                                      // 👇 1. Cek apakah ini jam asli (di hari & lapangan yang sama) 👇
                                      if (editTanggal === selectedBooking?.tanggal_main && String(editLapanganId) === String(selectedBooking?.lapangan_id)) {
                                         if (jamInt >= startHAsli && jamInt < endHAsli) {
                                             aman = false;
                                             isJamAsli = true;
                                         }
                                      }

                                      // 👇 2. Cek apakah jam ini sudah dipilih di baris pecahan lain 👇
                                      if (jamTerpakaiDiSplitLain.includes(jam)) aman = false;
                                      
                                      return (
                                        <option 
                                          key={jam} 
                                          value={jam} 
                                          disabled={!aman} 
                                          // 👇 Beri efek coretan dan warna merah jika itu jadwal lama 👇
                                          style={isJamAsli ? { textDecoration: 'line-through', color: '#ef4444' } : {}}
                                        >
                                          {jam} {isJamAsli ? '(Jadwal Lama)' : (!aman ? '(Penuh)' : '')}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  
                                  <select 
                                    value={split.jam_selesai} 
                                    onChange={(e) => {
                                        const newSplits = [...editSplits];
                                        newSplits[index].jam_selesai = e.target.value;
                                        setEditSplits(newSplits);
                                    }} 
                                    className="input-filter" style={{ flex: 1, cursor: 'pointer' }} disabled={!split.jam_mulai}>
                                    <option value="" disabled>-- Selesai --</option>
                                    {split.jam_mulai && Array.from({ length: maxDropdown }, (_, i) => {
                                        const startH = parseInt(split.jam_mulai.split(':')[0]);
                                        const endH = startH + (i + 1);
                                        if (endH > 24) return null; 
                                        const formatEnd = endH >= 24 ? '23:59:00' : `${endH < 10 ? '0' : ''}${endH}:00`;
                                        
                                        let amanBeneran = true;
                                        for(let x = 0; x <= i; x++){
                                          let jamCek = `${startH + x < 10 ? '0' : ''}${startH + x}:00`;
                                          if(!cekJamMulaiAman(jamCek) || jamTerpakaiDiSplitLain.includes(jamCek)) {
                                              amanBeneran = false;
                                          }
                                        }
                                        return amanBeneran ? <option key={formatEnd} value={formatEnd}>{formatEnd} ({i + 1} Jam)</option> : null;
                                    })}
                                  </select>

                                  {editSplits.length > 1 && (
                                    <button onClick={() => setEditSplits(editSplits.filter((_, i) => i !== index))} style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
                                  )}
                                </div>
                              )
                            })}
                            
                            {sisaTargetMurni > 0 && editSplits.length < durasiJamAsli && (
                              <button 
                                onClick={() => setEditSplits([...editSplits, { jam_mulai: '', jam_selesai: '' }])}
                                style={{ padding: '10px', background: 'var(--wijaya-blue)', color: '#fff', border: '1px solid #93c5fd', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%', marginTop: '10px', fontSize: '0.9rem' }}>
                                ➕ Pecah Jadwal (Sisa {sisaTargetMurni} Jam Belum Dialokasikan)
                              </button>
                            )}

                            {sisaTargetMurni === 0 && editSplits.length > 0 && (
                                <div style={{ textAlign: 'center', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '10px', border: '1px solid #10b981' }}>
                                    ✅ Total jam sudah terpenuhi ({totalTerisi} Jam)
                                </div>
                            )}

                          </div>
                        );
                      })()}
                    </div>
                  );
              }
            })()}

            {/* 👇 TOMBOL AKSI UTAMA 👇 */}
            <div className="modal-actions" style={{ marginTop: '35px', display: 'flex', flexDirection: 'row', gap: '15px', width: '100%', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <button className="btn-batal" style={{ flex: 1, width: '100%', textAlign: 'center', padding: '12px', fontSize: '1rem' }} onClick={() => setIsModalOpen(false)}>Batal</button>
              
              {(() => {
                  const totalTerisi = editSplits.reduce((acc, curr) => {
                    if(curr.jam_mulai && curr.jam_selesai) {
                        const start = parseInt(curr.jam_mulai.split(':')[0]);
                        const end = curr.jam_selesai.startsWith('23:59') ? 24 : parseInt(curr.jam_selesai.split(':')[0]);
                        return acc + (end - start);
                    } return acc;
                  }, 0);
                  
                  // Perhitungan sisa target yang sudah diperbaiki sebelumnya
                  const sisaTargetHitung = durasiJamAsli - totalTerisi;
                  const isReady = sisaTargetHitung === 0 && editSplits.every(s => s.jam_mulai && s.jam_selesai);

                  return (
                    <button 
                      disabled={isLoadingBtn || !isReady} 
                      className="btn-simpan" 
                      onClick={simpanReschedule}
                      style={{ 
                        flex: 1,
                        width: '100%',
                        textAlign: 'center',
                        padding: '12px',
                        fontSize: '1rem',
                        opacity: (isLoadingBtn || !isReady) ? 0.4 : 1, 
                        cursor: (isLoadingBtn || !isReady) ? 'not-allowed' : 'pointer' 
                      }}>
                      {isLoadingBtn ? '⏳' : 'Simpan Jadwal'}
                    </button>
                  );
              })()}
            </div>
            
          </div> {/* 👈 INI PENUTUP MODAL-BOX YANG TADI HILANG */}
        </div>
      )}
      {/* 👇 POP-UP KONFIRMASI SEBELUM SIMPAN KE DATABASE 👇 */}
      {confirmBookingModal.isOpen && confirmBookingModal.data && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-box" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 15px 0' }}>📄 Konfirmasi Pesanan</h2>
            <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '8px', textAlign: 'left', marginBottom: '20px', border: '1px dashed var(--border-color)' }}>
              <p style={{ margin: '0 0 8px 0' }}><strong>👤 Nama:</strong> {confirmBookingModal.data.nama_pemesan}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>📱 No. WhatsApp:</strong> {confirmBookingModal.data.no_wa}</p>
              <p style={{ margin: '0 0 8px 0' }}><strong>🏸 Lapangan:</strong> {confirmBookingModal.data.nama_lapangan}</p>
              
              {/* 👇 KONDISI TAMPILAN TANGGAL & WAKTU (REGULER VS MASSAL) 👇 */}
              {confirmBookingModal.data.is_bulk && confirmBookingModal.data.bulk_data ? (
                <div style={{ margin: '12px 0', padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                  <p style={{ margin: '0 0 8px 0' }}><strong>📅 Tanggal & Waktu Main ({confirmBookingModal.data.bulk_data.length}x Pertemuan):</strong></p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                    {confirmBookingModal.data.bulk_data.map((item, i) => {
                        const startInt = parseInt(item.jam_mulai_baru.split(':')[0]);
                        const endInt = startInt + confirmBookingModal.data.durasi;
                        const endStr = endInt >= 24 ? '23:59' : `${endInt < 10 ? '0' : ''}${endInt}:00`;
                        return (
                            <li key={i}>
                                {formatTglSingkat(item.tanggal_baru)} | <strong style={{ color: 'var(--text-primary)' }}>{item.jam_mulai_baru} - {endStr}</strong>
                            </li>
                        );
                    })}
                  </ul>
                </div>
              ) : (
                <>
                  <p style={{ margin: '0 0 8px 0' }}><strong>📅 Tanggal:</strong> {formatTglSingkat(confirmBookingModal.data.tanggal_main)}</p>
                  <p style={{ margin: '0 0 8px 0' }}><strong>⏰ Waktu:</strong> {confirmBookingModal.data.waktu} ({confirmBookingModal.data.durasi} Jam)</p>
                </>
              )}

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '12px 0' }}></div>
              <p style={{ margin: 0, fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between' }}>
                <strong>Total Tagihan:</strong> 
                {/* 👇 Warna otomatis jadi Putih di Dark Mode dan Hitam di Light Mode 👇 */}
                <strong style={{ color: 'var(--text-primary)' }}>Rp {confirmBookingModal.data.total_harga.toLocaleString('id-ID')}</strong>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setConfirmBookingModal({ isOpen: false, data: null })} 
                style={{ flex: 1, padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Batal
              </button>
              <button 
                disabled={isLoadingBtn}
                onClick={() => {
                  setIsLoadingBtn(true);
                  if (confirmBookingModal.data.is_bulk && confirmBookingModal.data.bulk_data.length > 0) {
                      // 👉 EKEKUSI BOOKING MASSAL TANPA MENYENTUH BACKEND 👈
                      const isMemberKategori = confirmBookingModal.data.kategori.includes('Member');
                      
                      const requests = confirmBookingModal.data.bulk_data.map(item => {
                          const endHourInt = parseInt(item.jam_mulai_baru.split(':')[0]) + confirmBookingModal.data.durasi;
                          const jamSelesaiAkhir = endHourInt >= 24 ? '23:59:00' : `${endHourInt < 10 ? '0' : ''}${endHourInt}:00`;
                          
                          return axios.post('http://127.0.0.1:8000/api/admin/booking/manual', {
                              nama_pemesan: confirmBookingModal.data.nama_pemesan,
                              no_wa: confirmBookingModal.data.no_wa,
                              lapangan_id: confirmBookingModal.data.lapangan_id,
                              tanggal_main: item.tanggal_baru,
                              jam_mulai: item.jam_mulai_baru,
                              jam_selesai: jamSelesaiAkhir,
                              // Khusus member, harga di 0-kan. Rutin bayar normal dikali jumlah pertemuannya.
                              total_harga: isMemberKategori ? 0 : confirmBookingModal.data.harga_per_pertemuan,
                              status_pembayaran: confirmBookingModal.data.status_pembayaran
                          });
                      });

                      Promise.all(requests).then(() => {
                          showAlert("Sukses", `${requests.length} Jadwal berhasil diamankan!`, "✅");
                          setConfirmBookingModal({ isOpen: false, data: null });
                          setPreviewBulk([]);
                          setFormPesan({ nama: '', no_wa: '', kategori: 'Reguler', isLocked: false, tanggal: '', lapangan_id: '', jam_mulai: '', durasi: 1, status: 'Lunas', jumlah_pekan: 4 });
                          fetchAdminData();
                      }).catch(() => showAlert("Gagal", "Terjadi kesalahan saat menyimpan jadwal massal.", "❌"))
                      .finally(() => setIsLoadingBtn(false));
                      
                  } else {
                      // 👉 BOOKING REGULER (NORMAL 1x MAIN) 👈
                      const payload = {
                        nama_pemesan: confirmBookingModal.data.nama_pemesan,
                        no_wa: confirmBookingModal.data.no_wa,
                        lapangan_id: confirmBookingModal.data.lapangan_id,
                        tanggal_main: confirmBookingModal.data.tanggal_main,
                        jam_mulai: confirmBookingModal.data.waktu.split(' - ')[0],
                        jam_selesai: confirmBookingModal.data.waktu.split(' - ')[1] === '24:00' ? '23:59:00' : confirmBookingModal.data.waktu.split(' - ')[1],
                        total_harga: confirmBookingModal.data.total_harga,
                        status_pembayaran: confirmBookingModal.data.status_pembayaran
                      };
                      axios.post('http://127.0.0.1:8000/api/admin/booking/manual', payload)
                        .then(res => {
                          showAlert("Sukses", res.data.pesan, "✅");
                          setConfirmBookingModal({ isOpen: false, data: null });
                          setFormPesan({ nama: '', no_wa: '', kategori: 'Reguler', isLocked: false, tanggal: '', lapangan_id: '', jam_mulai: '', durasi: 1, status: 'Lunas', jumlah_pekan: 4 });
                          fetchAdminData();
                        }).catch(() => showAlert("Gagal", "Terjadi kesalahan server.", "❌"))
                        .finally(() => setIsLoadingBtn(false));
                  }
                }} 
                style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {isLoadingBtn ? '⏳' : 'Ya, Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👇 MODAL 1: DAFTAR MEMBER BARU (OTOMATIS MASUK PENDAPATAN) 👇 */}
      {modalDaftarMember && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-box" style={{ maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '20px' }}>➕ Pendaftaran Member</h2>
            
            <div className="form-group">
              <label>Nama Pelanggan:</label>
              {/* 👇 Hanya izinkan HURUF dan SPASI masuk 👇 */}
              <input type="text" className="input-filter" style={{ width: '100%' }} value={formMemberBaru.nama} onChange={e => setFormMemberBaru({...formMemberBaru, nama: e.target.value.replace(/[^a-zA-Z\s]/g, '')})} placeholder="Masukkan nama..." />
            </div>
            
            <div className="form-group" style={{ marginTop: '15px', position: 'relative' }}>
              <label>No. WhatsApp:</label>
              {/* 👇 Hanya izinkan ANGKA masuk, plus efek border merah kalau error 👇 */}
              <input type="tel" className="input-filter" style={{ width: '100%', border: waErrorMember ? '2px solid #ef4444' : '', transition: 'all 0.3s ease' }} value={formMemberBaru.no_wa} onChange={e => setFormMemberBaru({...formMemberBaru, no_wa: e.target.value.replace(/[^0-9]/g, '')})} placeholder="Cth: 08123456789" />
              
              {/* 👇 Teks Peringatan Muncul di Bawah Input 👇 */}
              {waErrorMember && <span style={{ color: '#ef4444', fontSize: '0.8rem', position: 'absolute', left: 0, bottom: '-20px' }}>{waErrorMember}</span>}
            </div>
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Pilih Kategori:</label>
              <select className="input-filter" style={{ width: '100%' }} value={formMemberBaru.kategori} onChange={e => setFormMemberBaru({...formMemberBaru, kategori: e.target.value})}>
                <option value="Member Promo">Member Promo (Rp 240.000)</option>
                <option value="Member Eksklusif">Member Eksklusif (Rp 300.000)</option>
              </select>
            </div>
            <div className="modal-actions" style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
              <button className="btn-batal" style={{ flex: 1 }} onClick={() => setModalDaftarMember(false)}>Batal</button>
              <button className="btn-simpan" style={{ flex: 1 }} disabled={isLoadingBtn || !formMemberBaru.nama || !formMemberBaru.no_wa || formMemberBaru.no_wa.length < 11} onClick={() => {
                setIsLoadingBtn(true);
                // Trick Cerdas: Kirim data jam 00:00 - 00:01 biar masuk database sebagai pendapatan tanpa menuhin jadwal
                const payload = {
                  nama_pemesan: formMemberBaru.nama.trim() + (formMemberBaru.kategori === 'Member Promo' ? ' [MEMBER PROMO]' : ' [MEMBER EKSKLUSIF]'),
                  no_wa: formMemberBaru.no_wa,
                  lapangan_id: daftarLapangan.length > 0 ? daftarLapangan[0].id : 1,
                  tanggal_main: new Date().toISOString().split('T')[0],
                  jam_mulai: '00:00', jam_selesai: '00:01:00',
                  total_harga: formMemberBaru.kategori === 'Member Promo' ? 240000 : 300000,
                  status_pembayaran: 'Lunas'
                };
                axios.post('http://127.0.0.1:8000/api/admin/booking/manual', payload)
                  .then(res => {
                    showAlert("Berhasil", "Member didaftarkan! Tagihan masuk ke Laporan Keuangan.", "✅");
                    setModalDaftarMember(false); setFormMemberBaru({ nama: '', kategori: 'Member Promo' });
                    fetchAdminData();
                  }).finally(() => setIsLoadingBtn(false));
              }}>
                {isLoadingBtn ? '⏳' : 'Daftarkan & Bayar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 👇 MODAL 2: INFO DATA MEMBER (MESIN PELACAK MASA AKTIF & KUOTA) 👇 */}
      {modalInfoMember && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-box" style={{ maxWidth: '650px', width: '95%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>📋 Info Data Member</h2>
              <button onClick={() => setModalInfoMember(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>✖</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {(() => {
                // MESIN AI: Cari semua member dari riwayat pembayaran
                const members = [];
                const seenNames = new Set();
                const sortedBookings = [...bookings].sort((a,b) => new Date(b.tanggal_main) - new Date(a.tanggal_main));

                sortedBookings.forEach(b => {
                  // 👈 Perbaikan di dua baris bawah ini
                  if (b.total_harga >= 240000 && (b.nama_pemesan || '').includes('[MEMBER')) {
                    const baseName = (b.nama_pemesan || '').replace(/\[.*?\]/g, '').replace(/\(via admin\)/gi, '').trim();
                    if (!seenNames.has(baseName.toLowerCase())) {
                      seenNames.add(baseName.toLowerCase());
                      
                      // Kalkulasi Masa Aktif (Tepat 1 Bulan)
                      const tglDaftar = new Date(b.tanggal_main);
                      const tglExpired = new Date(tglDaftar);
                      tglExpired.setMonth(tglExpired.getMonth() + 1);
                      const isExpired = new Date() > tglExpired;

                      // Kalkulasi Kuota Pekan Berjalan (Senin - Minggu)
                      let jamTerpakai = 0;
                      const dNow = new Date();
                      const day = dNow.getDay();
                      const diff = dNow.getDate() - day + (day === 0 ? -6 : 1); 
                      const startOfWeek = new Date(dNow); startOfWeek.setDate(diff); startOfWeek.setHours(0,0,0,0);
                      const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23,59,59,999);

                      
                          bookings.forEach(bk => {
                        if ((bk.nama_pemesan || '').toLowerCase().includes(baseName.toLowerCase()) && !(bk.status_pembayaran || '').toLowerCase().includes('batal')) {
                          
                          // 👇 INI BARIS YANG HILANG DAN BIKIN CRASH (bDate) 👇
                          const bDate = new Date(bk.tanggal_main); 
                          
                          if (bDate >= startOfWeek && bDate <= endOfWeek) {
                            // Tambahkan pengaman String() agar tidak crash jika jam_mulai berupa angka
                            const startH = parseInt(String(bk.jam_mulai || '00:00').split(':')[0]);
                            const endH = String(bk.jam_selesai || '00:00').startsWith('23:59') ? 24 : parseInt(String(bk.jam_selesai || '00:00').split(':')[0]);
                            let dur = endH - startH; if (dur < 0) dur += 24;
                            jamTerpakai += dur;
                          }
                        }
                      });

                      let sisaKuota = 3 - jamTerpakai;
                      if (sisaKuota < 0) sisaKuota = 0;

                      let noWaData = b.no_wa || '';
                      members.push({
                        nama: baseName, no_wa: noWaData, kategori: b.nama_pemesan.includes('PROMO') ? 'Member Promo' : 'Member Eksklusif',
                        tglDaftar: tglDaftar, tglExpired: tglExpired, sisaKuota: sisaKuota, jamTerpakai: jamTerpakai, isExpired: isExpired
                      });
                    }
                  }
                });

                if (members.length === 0) return <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada member yang mendaftar.</p>;

                return members.map((m, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: '10px', border: m.isExpired ? '2px solid #ef4444' : '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-primary)' }}>{m.nama}</h3>
                        <span style={{ background: 'var(--wijaya-blue)', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{m.kategori}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>📱 {m.no_wa || '-'}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: m.isExpired ? '#ef4444' : 'var(--text-secondary)' }}>
                          Berlaku s/d: <strong>{m.tglExpired.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                        </p>
                        {m.isExpired ? (
                           <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>❌ Masa Aktif Habis!</span>
                        ) : (
                           <span style={{ color: m.sisaKuota === 0 ? '#ef4444' : '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>
                             📊 Kuota Pekan Ini: {m.sisaKuota} Jam
                           </span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                      <button 
                        disabled={m.isExpired || m.sisaKuota === 0}
                        onClick={() => {
                          // 👇 INI TOMBOL AJAIB! Ngunci form pesan otomatis 👇
                          setFormPesan({ nama: m.nama, no_wa: m.no_wa, kategori: m.kategori, isLocked: true, tanggal: '', lapangan_id: '', jam_mulai: '', durasi: 1, status: 'Lunas' });
                          setModalInfoMember(false);
                        }}
                        style={{ flex: 1, padding: '10px', background: (m.isExpired || m.sisaKuota === 0) ? 'var(--bg-hover)' : '#10b981', color: (m.isExpired || m.sisaKuota === 0) ? 'var(--text-secondary)' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: (m.isExpired || m.sisaKuota === 0) ? 'not-allowed' : 'pointer' }}>
                        Lanjut Booking {m.isExpired ? '(Expired)' : (m.sisaKuota === 0 ? '(Kuota Habis)' : '')}
                      </button>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
    
  );
}