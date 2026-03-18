import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Kirim data ke backend API
    axios.post('https://gor-wijaya.page.gd/api/register', {
      name: username,      // <--- JURUS SAKTI BIAR LARAVEL GAK MINTA NAMA LENGKAP
      username: username,
      password: password
    })
    .then(() => {
      setIsLoading(false);
      alert("Pendaftaran Berhasil! Silakan Login.");
      navigate('/login'); 
    })
    .catch((error) => {
      setIsLoading(false);
      alert("Pendaftaran Gagal! Username mungkin sudah terpakai.");
      console.error(error);
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>🏸 Daftar Admin Baru</h2>
          <p>Buat akun untuk mengelola GOR</p>
        </div>
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Contoh: hadi firman" 
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
            {isLoading ? '⏳ Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="auth-footer">
          Sudah punya akun? <Link to="/login" className="auth-link">Login di sini</Link>
        </p>
      </div>
    </div>
  );
}