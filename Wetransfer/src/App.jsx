import { Routes, Route } from 'react-router-dom';
import UploadPage from './UploadPage';
import DownloadPage from './DownloadPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<UploadPage />} />
      <Route path="/share/:shareId" element={<DownloadPage />} />
    </Routes>
  );
}

export default App;
