import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
// Pastikan komponen ProtectedRoute kamu ada atau sesuaikan
import ProtectedRoute from './components/ProtectedRoute'; 

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;