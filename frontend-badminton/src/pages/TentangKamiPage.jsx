import React from 'react';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import '../appCustomer.css';

const TentangKamiPage = () => {
  return (
    <div className="info-page-wrapper">
      <CustomerHeader />

      {/* 👇 JURUS JITU CSS INTERNAL 👇 */}
      <style>{`
        /* --- TAMPILAN LIGHT MODE --- */
        .sk-card { background-color: #ffffff !important; }
        .sk-title { color: #111827 !important; border-bottom: 2px solid #e5e7eb !important; padding-bottom: 10px; margin-bottom: 15px; }
        .sk-desc { color: #1f2937 !important; }
        .sk-list, .sk-list li { color: #1f2937 !important; }
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
          <i className="bi bi-info-circle"></i> Tentang Kami
        </h1>
        
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">GOR Wijaya</h3>
          <p className="sk-desc" style={{ lineHeight: '1.8', margin: 0 }}>
            Berdiri sejak ...., GOR Wijaya berkomitmen menyediakan sarana olahraga bulutangkis terbaik di kawasan Bekasi Timur. Kami percaya bahwa kesehatan fisik berawal dari fasilitas olahraga yang layak dan nyaman.
             Dan selain cabang bututangkis, kami juga menyediakan cabang olahraga lain seperti tenis meja, dan renang
          </p>
        </div>

        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">📍 Lokasi & Jam Operasional</h3>
          <ul className="sk-list" style={{ lineHeight: '1.8', margin: 0 }}>
            <li><strong>Alamat:</strong> Jl. Kusuma Utara X RT.14 RW.017 Kel. Duren Jaya Kec. Bekasi Timur, Bekasi 17111</li>
            <li><strong>Jam Buka:</strong> Setiap Hari (Senin - Minggu) Pukul 07:00 - 24:00 WIB</li>
          </ul>
        </div>
      </div>
      
      <CustomerFooter />
    </div>
  );
};

export default TentangKamiPage;