import { Navigate } from 'react-router-dom';

// Kita pakai 'children' untuk menerima komponen yang diapit (AdminDashboard)
const ProtectedRoute = ({ children }) => {
  // Mengecek apakah ada tiket (token) di dalam localStorage
  const token = localStorage.getItem('token'); 

  // Kalau tidak ada tiket, tendang balik ke halaman /login (bukan /admin/login)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kalau ada tiket, silakan masuk ke komponen yang ada di dalamnya (AdminDashboard)
  return children;
};

export default ProtectedRoute;