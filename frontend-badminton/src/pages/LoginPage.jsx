import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // LOGIKA LOGIN
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true); 
      
    // Sesuaikan URL ini mau pakai internet atau localhost ya
    axios.post('https://gor-wijaya.page.gd/api/login', {
      username: username,
      password: password
    })
    .then((response) => {
      // 1. Simpan Token untuk Penjaga Pintu (ProtectedRoute)
      localStorage.setItem('token', response.data.token);
      
      // 2. Simpan Username yang diketik untuk disapa di Dashboard
      localStorage.setItem('username', username); 
      
      setIsLoading(false);
      navigate('/admin/dashboard'); 
    })
    .catch((error) => {
      setIsLoading(false);
      alert("Login Gagal! Username atau password salah.");
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>🏸 GOR Admin</h2>
          <p>Silakan masuk ke akun Anda</p>
        </div>
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Masukkan Username..." 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="btn-auth" disabled={isLoading}>
            {isLoading ? '⏳ Memeriksa...' : 'Masuk / Login'}
          </button>
        </form>

        <p className="auth-footer">
          Belum punya akun? <Link to="/register" className="auth-link">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}