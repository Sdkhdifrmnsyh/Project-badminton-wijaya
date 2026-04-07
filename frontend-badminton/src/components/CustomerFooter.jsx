import React from 'react';

const CustomerFooter = () => {
  return (
    <footer className="customer-footer">
      <p>&copy; {new Date().getFullYear()} GOR Wijaya. All rights reserved.</p>
      <p className="footer-address">
        <i className="bi bi-geo-alt-fill"></i> Jl. Kusuma Utara X RT.14 RW.017 Kel. Duren Jaya Kec. Bekasi Timur, Bekasi 17111, Jawa Barat, Indonesia
      </p>
    </footer>
  );
};

export default CustomerFooter;