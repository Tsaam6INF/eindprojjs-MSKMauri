import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Er is een fout opgetreden');
      }

      // Sla de token op in localStorage
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="wetransfer-bg-overlay">
      <div className="wetransfer-center-column">
        <div className="wetransfer-logo">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="38" height="38" rx="12" fill="#006cff"/>
            <text x="19" y="26" textAnchor="middle" fontSize="20" fill="#fff" fontFamily="Arial, sans-serif" fontWeight="bold">W</text>
          </svg>
        </div>
        <header>
          <h1>{isLogin ? 'Inloggen' : 'Registreren'}</h1>
        </header>
        <main>
          <div className="wetransfer-upload-block">
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Gebruikersnaam"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="password"
                  placeholder="Wachtwoord"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              <button type="submit" className="upload-button" style={{ width: '100%' }}>
                {isLogin ? 'Inloggen' : 'Registreren'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-button"
              >
                {isLogin ? 'Nog geen account? Registreer hier' : 'Al een account? Log hier in'}
              </button>
            </div>

            {error && (
              <div className="error-message" style={{ marginTop: '1rem' }}>
                {error}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default LoginPage; 