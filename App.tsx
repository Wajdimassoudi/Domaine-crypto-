
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { ProductDetails } from './pages/ProductDetails';
import { Cart } from './pages/Cart';
import { Admin } from './pages/Admin';
import { About } from './pages/About';
import { Terms } from './pages/Terms';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Admin />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </NotificationProvider>
  );
};

export default App;
