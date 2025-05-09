import { useState, useCallback } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function UploadPage() {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [serverStatus, setServerStatus] = useState('online')
  const [shareLink, setShareLink] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file) => {
    if (serverStatus !== 'online') {
      throw new Error('Server is niet beschikbaar');
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    setUploading(true);
    setError(null);
    setCopied(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    try {
      const uploadPromises = droppedFiles.map(async (file) => {
        const result = await uploadFile(file);
        setShareLink(`${window.location.origin}/share/${result.shareId}`);
        return {
          ...file,
          shareId: result.shareId,
          uploaded: true
        };
      });
      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles(uploadedFiles);
    } catch (error) {
      setError('Er is een fout opgetreden bij het uploaden van de bestanden');
    } finally {
      setUploading(false);
    }
  }, [serverStatus]);

  const handleFileSelect = useCallback(async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setUploading(true);
    setError(null);
    setCopied(false);
    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const result = await uploadFile(file);
        setShareLink(`${window.location.origin}/share/${result.shareId}`);
        return {
          ...file,
          shareId: result.shareId,
          uploaded: true
        };
      });
      const uploadedFiles = await Promise.all(uploadPromises);
      setFiles(uploadedFiles);
    } catch (error) {
      setError('Er is een fout opgetreden bij het uploaden van de bestanden');
    } finally {
      setUploading(false);
    }
  }, [serverStatus]);

  const handleRemoveFile = (index) => {
    setFiles(files => files.filter((_, i) => i !== index));
  };

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
          <h1>Bestanden versturen</h1>
        </header>
        <main>
          <div className="drop-zone wetransfer-upload-block"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="wetransfer-upload-icon">
              <svg width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#e3f2fd"/>
                <path d="M24 14v20M24 34l-8-8m8 8l8-8" stroke="#006cff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2><b>Sleep je bestanden hierheen</b></h2>
            <p>of</p>
            <label className={`upload-button ${serverStatus !== 'online' ? 'disabled' : ''}`}>
              {uploading ? 'Uploaden...' : 'Kies bestanden'}
              <input 
                type="file" 
                multiple 
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={uploading || serverStatus !== 'online'}
              />
            </label>

            {files.length > 0 && (
              <div className="files-list wetransfer-file-list" style={{marginTop: '1.2rem'}}>
                <h3>Bestanden klaar om te delen</h3>
                <ul>
                  {files.map((file, index) => (
                    <li key={index} className="file-item">
                      <div className="file-row">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button className="remove-button" onClick={() => handleRemoveFile(index)} title="Verwijder bestand">✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {shareLink && (
              <div className="download-link-box" style={{marginTop: '1.2rem'}}>
                <div className="download-link-title">Downloadlink</div>
                <div className="download-link-row">
                  <a href={shareLink} target="_blank" rel="noopener noreferrer" className="download-link-url">{shareLink}</a>
                  <button className="copy-link-button" onClick={handleCopy}>{copied ? 'Gekopieerd!' : 'Kopieer link'}</button>
                </div>
              </div>
            )}

            {error && (
              <div className="error-message" style={{marginTop: '1.2rem'}}>
                {error}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default UploadPage; 