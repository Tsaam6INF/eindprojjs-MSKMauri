import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function DashboardPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchFiles = async () => {
      try {
        const response = await fetch(`${API_URL}/files`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error('Er is een fout opgetreden bij het ophalen van de bestanden');
        }

        const data = await response.json();
        setFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpload = () => {
    navigate('/');
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
          <h1>Mijn Bestanden</h1>
        </header>
        <main>
          <div className="wetransfer-upload-block">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button onClick={handleUpload} className="upload-button">
                Bestand Uploaden
              </button>
              <button onClick={handleLogout} className="logout-button">
                Uitloggen
              </button>
            </div>

            {loading ? (
              <div className="loading-message">Bestanden laden...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : files.length === 0 ? (
              <div className="no-files-message">Je hebt nog geen bestanden gedeeld</div>
            ) : (
              <div className="files-list wetransfer-file-list">
                <h3>Gedeelde Bestanden</h3>
                <ul>
                  {files.map((file) => (
                    <li key={file.id} className="file-item">
                      <div className="file-row">
                        <span className="file-name">{file.originalname}</span>
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <a
                          href={`${window.location.origin}/share/${file.shareId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="share-link"
                        >
                          Deel Link
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage; 