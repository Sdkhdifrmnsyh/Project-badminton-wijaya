import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from "./pages/AdminDashboard";
import FasilitasPage from "./pages/FasilitasPage";
import SyaratKetentuanPage from "./pages/SyaratKetentuanPage";
import TentangKamiPage from "./pages/TentangKamiPage";
import ProtectedRoute from './components/ProtectedRoute'; 
import LayananGorPage from './pages/LayananGorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Halaman Utama untuk Customer */}
        <Route path="/" element={<UserPage />} />

        {/* 2. Halaman Khusus Admin (Bisa diakses kalau ngetik /login) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        
        {/* 3. Dashboard Admin yang dilindungi Password */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* 4. Kalau ketik link ngawur, balikin ke halaman Customer */}
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* 5. Halaman Informasi untuk Customer */}
        <Route path="/fasilitas" element={<FasilitasPage />} />
        <Route path="/syarat-ketentuan" element={<SyaratKetentuanPage />} />
        <Route path="/tentang-kami" element={<TentangKamiPage />} />

        <Route path="/layanan" element={<LayananGorPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;