import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Albums } from './pages/Albums';
import { PhotoGallery } from './pages/PhotoGallery';
import { PhotoDetails } from './pages/PhotoDetails';
import { Layout } from './components/Layout';
import './i18n';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/albums" element={<Layout><Albums /></Layout>} />
        <Route path="/albums/:albumId" element={<Layout><PhotoGallery /></Layout>} />
        <Route path="/photos/:photoId" element={<Layout><PhotoDetails /></Layout>} />
      </Routes>
    </HashRouter>
  );
};

export default App;