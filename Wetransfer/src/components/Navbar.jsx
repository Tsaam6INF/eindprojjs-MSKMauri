/**
 * Navbar Component
 * 
 * Een navigatiebalk component die de hoofdnavigatie van de applicatie verzorgt.
 * De navbar toont verschillende elementen afhankelijk van de authenticatiestatus van de gebruiker:
 * 
 * Niet ingelogd:
 * - Logo/naam van de applicatie
 * - Inloggen knop
 * - Registreren knop
 * 
 * Ingelogd:
 * - Logo/naam van de applicatie
 * - Gebruikersmenu met:
 *   - Gebruikersinitiaal in een cirkel
 *   - Gebruikersnaam
 *   - Dropdown menu met:
 *     - Dashboard link
 *     - Upload Bestand link
 *     - Uitloggen knop
 */

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  // State voor het tonen/verbergen van het gebruikersmenu
  const [showMenu, setShowMenu] = useState(false);
  // State voor het opslaan van de gebruikersnaam
  const [username, setUsername] = useState('');

  // Laad de gebruikersnaam uit sessionStorage bij het mounten van de component
  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  /**
   * Handelt het uitloggen af:
   * - Verwijdert token en gebruikersnaam uit sessionStorage
   * - Reset de gebruikersnaam state
   * - Navigeert naar de login pagina
   */
  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    setUsername('');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo/naam sectie */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-gray-800">WeTransfer Clone</span>
            </Link>
          </div>

          {/* Authenticatie sectie */}
          <div className="flex items-center">
            {username ? (
              // Ingelogde gebruiker menu
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  {/* Gebruikersinitiaal in cirkel */}
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{username}</span>
                  {/* Dropdown pijl */}
                  <svg
                    className={`h-5 w-5 transition-transform ${showMenu ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    {/* Dashboard link */}
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </Link>
                    {/* Upload link */}
                    <Link
                      to="/"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowMenu(false)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Bestand
                    </Link>
                    {/* Uitloggen knop */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Uitloggen
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Niet ingelogde gebruiker knoppen
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Inloggen
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Registreren
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 