import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import Comunidad from './pages/Comunidad';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/comunidad" element={<Comunidad />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
