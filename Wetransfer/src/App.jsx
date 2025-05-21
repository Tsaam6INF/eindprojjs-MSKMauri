import { Routes, Route, Navigate } from 'react-router-dom';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/" element={<UploadPage />} />
      <Route path="/share/:shareId" element={<DownloadPage />} />
    </Routes>
  );
}

export default App;
