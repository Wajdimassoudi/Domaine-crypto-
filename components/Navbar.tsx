
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { web3Service } from '../services/web3Service';
import { User } from '../types';
import { useNotification } from '../context/NotificationContext';
import { mockBackend } from '../services/mockBackend';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('theme') as any) || 'dark');

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('cryptoreg_user_v3');
    if (saved) setUser(JSON.parse(saved));

    const updateCart = () => {
        const cart = mockBackend.getCart();
        setCartCount(cart.items.reduce((acc: number, item: any) => acc + item.quantity, 0));
    };
    updateCart();
    window.addEventListener('cartUpdated', updateCart);
    return () => window.removeEventListener('cartUpdated', updateCart);
  }, []);

  const menuCategories = ['الهواتف الذكية', 'الحواسيب واللابتوب', 'المنزل والتلفاز', 'الموضة والأزياء', 'المجوهرات والساعات', 'الألعاب والترفيه', 'الجمال والصحة'];

  return (
    <nav className={`fixed w-full z-50 border-b shadow-xl transition-all duration-300 ${theme === 'dark' ? 'bg-darker border-border' : 'bg-white border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-xl"><i className="fas fa-shopping-bag"></i></div>
            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-darker'}`}>Crypto<span className="text-primary">Mart</span></span>
          </Link>

          <form onSubmit={(e) => { e.preventDefault(); navigate(`/marketplace?q=${search}`); }} className="flex-grow max-w-xl hidden md:flex">
             <div className="flex w-full bg-gray-100 dark:bg-surface rounded-full overflow-hidden border-2 border-primary/30">
                <input type="text" placeholder="ابحث عن آلاف المنتجات بأسعار الجملة..." className="flex-grow px-6 py-2 bg-transparent outline-none" value={search} onChange={e => setSearch(e.target.value)} />
                <button className="bg-primary text-white px-6 font-bold"><i className="fas fa-search"></i></button>
             </div>
          </form>

          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-xl text-primary">
                <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <Link to="/cart" className="relative p-2">
                <i className={`fas fa-shopping-cart text-2xl ${theme === 'dark' ? 'text-white' : 'text-darker'}`}></i>
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{cartCount}</span>}
            </Link>
            <button onClick={async () => { const u = await web3Service.connectWallet(); setUser(u); }} className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm">
                {user ? user.username : 'ربط المحفظة'}
            </button>
          </div>
      </div>
      <div className="bg-gray-50 dark:bg-surface border-t border-gray-200 dark:border-border overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 flex gap-6 py-2 text-xs font-bold whitespace-nowrap">
              {menuCategories.map(cat => (
                  <Link key={cat} to={`/marketplace?cat=${cat}`} className="hover:text-primary transition-colors">{cat}</Link>
              ))}
          </div>
      </div>
    </nav>
  );
};
