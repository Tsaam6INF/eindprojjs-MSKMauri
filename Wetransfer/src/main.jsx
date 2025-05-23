/**
 * Main Entry Point
 * 
 * Dit is het startpunt van de React applicatie. Het:
 * - Initialiseert de React applicatie
 * - Configureert de router
 * - Voegt globale stijlen toe
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
