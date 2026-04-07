import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Register Admin - GOR WIJAYA";
    document.documentElement.classList.remove('dark-mode');
    document.body.classList.remove('dark-mode');
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.remove('dark-mode');
    }
    document.body.classList.add('light-mode');
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    axios.post('http://127.0.0.1:8000/api/register', {
      name: username,      
      username: username,
      password: password
    })
    .then(() => {
      setIsLoading(false);
      alert("Pendaftaran Berhasil! Silakan Login.");
      navigate('/login'); 
    })
    .catch((err) => {
      setIsLoading(false);
      setError("Pendaftaran Gagal! Username mungkin sudah terpakai.");
      console.error(err);
    });
  };

  const styles = {
    pageBg: {
      minHeight: '100vh', width: '100vw', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      // 👇 Background disamakan dengan halaman Login (Abu-abu muda) 👇
      backgroundColor: '#f3f4f6', 
      padding: '20px', boxSizing: 'border-box', fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      position: 'absolute', top: 0, left: 0
    },
    card: {
      background: '#ffffff', width: '450px', maxWidth: '100%', padding: '40px',
      // 👇 Border radius dan shadow disamakan agar terlihat melayang elegan 👇
      borderRadius: '16px', boxShadow: '0 10px 35px rgba(0, 0, 0, 0.15)',
      display: 'flex', flexDirection: 'column', zIndex: 1 
    },
    inputGroup: { marginBottom: '20px', position: 'relative' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '0.9rem' },
    input: {
      width: '100%', padding: '12px 14px 12px 40px', border: '1px solid #d1d5db', boxSizing: 'border-box',
      borderRadius: '8px', fontSize: '1rem', transition: 'border-color 0.2s', outline: 'none',
      color: '#1f2937', backgroundColor: '#ffffff'
    },
    inputFocus: { borderColor: '#2563eb' },
    icon: { position: 'absolute', left: '14px', top: '40px', color: '#9ca3af', width: '18px', height: '18px' },
    btnAction: {
      width: '100%', padding: '14px', background: '#2563eb', color: '#ffffff', border: 'none', 
      borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s'
    },
    btnActionDisabled: { opacity: 0.7, cursor: 'not-allowed' },
    linkToggle: { color: '#2563eb', textDecoration: 'none', fontWeight: '600', cursor: 'pointer' },
    alertError: { padding: '12px', background: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }
  };

  const [focusedInput, setFocusedInput] = useState(null);

  const Icons = {
    User: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Lock: () => <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  };

  return (
    <div style={styles.pageBg} className="auth-wrapper-secure">
      <style>{`
        .auth-wrapper-secure h2, .auth-wrapper-secure p, .auth-wrapper-secure label, .auth-wrapper-secure span { color: #1f2937 !important; }
        .auth-wrapper-secure input { color: #1f2937 !important; background-color: #ffffff !important; border: 1px solid #d1d5db !important; }
        .auth-wrapper-secure input::placeholder { color: #9ca3af !important; }
        .auth-wrapper-secure svg { color: #9ca3af !important; }
        .auth-wrapper-secure .link-toggle { color: #2563eb !important; }
        .auth-wrapper-secure button { color: #ffffff !important; }
      `}</style>

      <div style={styles.card}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/logo_wijaya_1.png" alt="Logo GOR Wijaya" style={{ width: '80px', height: 'auto', marginBottom: '15px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>Register Akun</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>Buat akun untuk mengelola GOR</p>
        </div>

        {error && <div style={styles.alertError}>{error}</div>}

        <form onSubmit={handleRegister} style={{ margin: 0 }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Pengguna</label>
            <div style={styles.icon}><Icons.User /></div>
            <input 
              type="text" placeholder="Masukan nama anda..." value={username} onChange={e => setUsername(e.target.value)} required
              onFocus={() => setFocusedInput('username')} onBlur={() => setFocusedInput(null)}
              style={{ ...styles.input, ...(focusedInput === 'username' ? styles.inputFocus : {}) }} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Kata Sandi</label>
            <div style={styles.icon}><Icons.Lock /></div>
            <input 
              type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
              onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)}
              style={{ ...styles.input, ...(focusedInput === 'password' ? styles.inputFocus : {}) }} 
            />
          </div>

          <button type="submit" disabled={isLoading} style={{ ...styles.btnAction, ...(isLoading ? styles.btnActionDisabled : {}), marginTop: '10px' }}>
            {isLoading ? '⏳ Memproses...' : 'Register Sekarang'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem' }}>
          <span style={{ color: '#4b5563' }}>Sudah memiliki akun?</span>
          {' '}
          <Link to="/login" className="link-toggle" style={styles.linkToggle}>Login di sini</Link>
        </div>
      </div>
    </div>
  );
}