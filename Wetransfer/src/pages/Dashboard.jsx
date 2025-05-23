/**
 * Dashboard Component
 * 
 * Een pagina component voor het dashboard van de gebruiker. Deze component biedt:
 * - Overzicht van geüploade bestanden
 * - Mogelijkheid om bestanden te downloaden
 * - Mogelijkheid om bestanden te verwijderen
 * - Navigatie naar upload pagina
 * - Foutafhandeling en laadstatus
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // State voor bestanden en UI status
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Haalt de lijst van bestanden op van de server
   */
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/files', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Kon bestanden niet ophalen');
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
  }, []);

  /**
   * Handelt het verwijderen van een bestand af
   * 
   * @param {string} fileId - ID van het te verwijderen bestand
   */
  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Kon bestand niet verwijderen');
      }

      // Verwijder het bestand uit de state
      setFiles(files.filter(file => file.id !== fileId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">Bezig met laden...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mijn bestanden</h2>
        <Link
          to="/upload"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Nieuw bestand uploaden
        </Link>
      </div>

      {/* Foutmelding */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Bestandenlijst */}
      {files.length === 0 ? (
        <p className="text-gray-600">Nog geen bestanden geüpload</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bestandsnaam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grootte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload datum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {files.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{file.size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`http://localhost:3001/api/files/${file.id}/download`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Downloaden
                    </a>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 