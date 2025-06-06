/**
 * UpgradePage Component
 * 
 * Een pagina component voor het upgraden naar het Pro plan. Deze component biedt:
 * - Informatie over Pro voordelen
 * - Upgrade knop
 * - Bevestiging na succesvolle upgrade
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UpgradePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3001/api/user/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upgrade mislukt');
      }

      setSuccess(true);
      // Navigeer na 2 seconden terug naar dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Upgrade naar Pro</h2>
          <p className="text-blue-100">Krijg toegang tot alle premium features</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pro Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Pro Features</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Upload bestanden tot 5GB (10x groter dan gratis plan)
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Snellere uploads
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Prioriteit support
              </li>
            </ul>
          </div>

          {/* Prijs */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="text-center">
              <span className="text-4xl font-bold text-gray-900">€9.99</span>
              <span className="text-gray-600">/maand</span>
            </div>
            <p className="text-center text-gray-600 mt-2">Annuleer op elk moment</p>
          </div>

          {/* Foutmelding */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Succesmelding */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Upgrade succesvol! Je wordt doorgestuurd naar het dashboard...
            </div>
          )}

          {/* Upgrade knop */}
          <button
            onClick={handleUpgrade}
            disabled={loading || success}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Bezig met upgraden...' : success ? 'Upgrade Succesvol!' : 'Nu Upgraden naar Pro'}
          </button>

          {/* Terug link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            <button
              onClick={() => navigate(-1)}
              className="text-blue-600 hover:text-blue-800"
            >
              Terug
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage; 