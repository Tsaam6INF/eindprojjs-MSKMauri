import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function DownloadPage() {
  const { shareId } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const response = await fetch(`${API_URL}/files/${shareId}`);
        if (!response.ok) {
          throw new Error('Bestand niet gevonden of verlopen.');
        }
        const data = await response.json();
        setFile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [shareId]);

  const handleDownload = () => {
    window.open(`${API_URL}/download/${shareId}`, '_blank');
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
          <h1>Download bestand</h1>
        </header>
        <main>
          <div className="wetransfer-upload-block" style={{marginBottom: '1.5rem'}}>
            {loading ? (
              <div className="loading-message">Bestand laden...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : file ? (
              <>
                <div style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.7rem'}}>{file.originalname}</div>
                <div style={{color: '#888', marginBottom: '1.2rem'}}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                <button className="download-button" onClick={handleDownload}>Download</button>
              </>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DownloadPage; 