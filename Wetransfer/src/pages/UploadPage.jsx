/**
 * UploadPage Component
 * 
 * Een pagina component voor het uploaden van bestanden. Deze component biedt:
 * - Drag & drop functionaliteit voor bestanden
 * - Bestandsselectie via bestandsbrowser
 * - Voortgangsindicatie tijdens upload
 * - Foutafhandeling
 * - Automatische navigatie naar dashboard na succesvolle upload
 * - Bestandsgrootte limiet indicatie
 * - Upgrade optie naar Pro plan
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';

const UploadPage = () => {
  // State voor upload status en foutmeldingen
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [isPro, setIsPro] = useState(false);
  const navigate = useNavigate();

  // Haal pro status op bij component mount
  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user/status', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setIsPro(data.isPro);
      } catch (err) {
        console.error('Fout bij ophalen pro status:', err);
      }
    };

    checkProStatus();
  }, []);

  /**
   * Handelt het uploaden van bestanden af:
   * 1. Maakt een FormData object met het bestand
   * 2. Stuurt het bestand naar de server
   * 3. Toont voortgang en foutmeldingen
   * 4. Navigeert naar dashboard bij succes
   * 
   * @param {File[]} acceptedFiles - Array van geaccepteerde bestanden
   */
  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload mislukt');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [navigate]);

  // Configureer dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Bestand uploaden</h2>

      {/* Foutmelding */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          {error.includes('te groot') && !isPro && (
            <div className="mt-2">
              <p className="font-semibold">Upgrade naar Pro voor grotere bestanden!</p>
              <button
                onClick={() => navigate('/upgrade')}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Upgrade naar Pro
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-gray-600">Bezig met uploaden...</p>
        ) : isDragActive ? (
          <p className="text-blue-500">Laat het bestand hier los</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Sleep een bestand hierheen of klik om te selecteren</p>
            <p className="text-sm text-gray-500">
              Maximum bestandsgrootte: {isPro ? '5GB' : '500MB'}
              {!isPro && (
                <span className="ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/upgrade');
                    }}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Upgrade naar Pro voor 5GB
                  </button>
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage; 