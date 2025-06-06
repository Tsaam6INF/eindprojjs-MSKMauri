/**
 * Login Component
 * 
 * Een pagina component voor het inloggen van gebruikers. Deze component biedt:
 * - Een formulier voor gebruikersnaam en wachtwoord
 * - Foutafhandeling en laadstatus
 * - Automatische navigatie naar dashboard na succesvol inloggen
 * - Link naar registratiepagina voor nieuwe gebruikers
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  // State voor formuliervelden en UI status
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handelt het inlogformulier af:
   * 1. Voorkomt standaard formulier gedrag
   * 2. Reset foutmeldingen
   * 3. Stuurt inlogverzoek naar de server
   * 4. Slaat token en gebruikersnaam op bij succes
   * 5. Navigeert naar dashboard
   * 6. Toont foutmelding bij mislukking
   * 
   * @param {Event} e - Het formulier submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Er is een fout opgetreden bij het inloggen');
      }

      // Sla authenticatiegegevens op
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('username', username);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Inloggen</h2>
        
        {/* Foutmelding */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Inlogformulier */}
        <form onSubmit={handleSubmit}>
          {/* Gebruikersnaam veld */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Gebruikersnaam
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Wachtwoord veld */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Wachtwoord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Inlog knop */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </form>

        {/* Registratie link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Nog geen account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-800">
            Registreer hier
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 