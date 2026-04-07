import React from 'react';
import CustomerHeader from '../components/CustomerHeader';
import CustomerFooter from '../components/CustomerFooter';
import '../appCustomer.css';

const FasilitasPage = () => {
  return (
    <div className="info-page-wrapper">
      <CustomerHeader />
      
      {/* 👇 JURUS JITU CSS INTERNAL 👇 */}
      <style>{`
        /* --- TAMPILAN LIGHT MODE --- */
        .sk-card { background-color: #ffffff !important; }
        .sk-title { color: #111827 !important; border-bottom: 2px solid #e5e7eb !important; padding-bottom: 10px; margin-bottom: 15px; }
        .sk-desc { color: #1f2937 !important; }

        /* --- TAMPILAN DARK MODE --- */
        body.dark-mode .sk-card { background-color: #1e293b !important; }
        body.dark-mode .sk-title { color: #ffffff !important; border-bottom: 2px solid #374151 !important; }
        body.dark-mode .sk-desc { color: #f9fafb !important; }
      `}</style>

      <div className="info-content">
        <h1 className="info-title" style={{ color: 'var(--wijaya-blue)' }}>
          <i className="bi bi-building"></i> Fasilitas GOR
        </h1>
        
        {/* --- 1. TEMPAT PARKIR --- */}
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">Tempat Parkir</h3>
          <img src="parkir.jpg" alt="Tempat Parkir Luas GOR Wijaya" className="info-card-img" />
          <p className="info-card-description sk-desc">
            Area parkir luas untuk motor & mobil, aman dengan CCTV 24 jam, dan GRATIS
          </p>
        </div>

        {/* --- 2. MUSHOLLA --- */}
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">Musholla</h3>
          <img src="mushola.jpg" alt="Musholla Bersih GOR Wijaya" className="info-card-img" />
          <p className="info-card-description sk-desc">
            Musholla bersih dan nyaman lengkap dengan perlengkapan solat untuk beribadah.
          </p>
        </div>

        {/* --- 3. TOILET --- */}
        <div className="info-card sk-card" style={{ padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 className="sk-title">Toilet</h3>
          <img src="toilet.jpg" alt="Toilet Bersih GOR Wijaya" className="info-card-img" />
          <p className="info-card-description sk-desc">
            Toilet bersih & ruang ganti terpisah pria/wanita demi kenyamanan bersama.
          </p>
        </div>
      </div>
      
      <CustomerFooter />
    </div>
  );
};

export default FasilitasPage;