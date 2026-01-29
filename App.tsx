import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { DomainDetails } from './pages/DomainDetails';
import { Admin } from './pages/Admin';
import { Transfer } from './pages/Transfer';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-darker text-white font-sans selection:bg-primary selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/domain/:id" element={<DomainDetails />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
};

export default App;