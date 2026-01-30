import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { web3Service } from '../services/web3Service';
import { dbService } from '../services/supabaseClient';
import { useNotification } from '../context/NotificationContext';
import { CartItem } from '../types';

export const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Shipping Form
  const [shipping, setShipping] = useState({ fullName: '', address: '', city: '', country: '' });

  useEffect(() => {
      const cart = mockBackend.getCart();
      setItems(cart.items);
      setTotal(cart.total);
  }, []);

  const updateQty = (id: string, newQty: number) => {
      if (newQty < 1) {
          mockBackend.removeFromCart(id);
      } else {
          // Find original product to keep structure valid (simplified here)
          const item = items.find(i => i.id === id);
          if (item) mockBackend.addToCart({...item}, newQty - item.quantity);
      }
      const updated = mockBackend.getCart();
      setItems(updated.items);
      setTotal(updated.total);
  };

  const removeItem = (id: string) => {
      mockBackend.removeFromCart(id);
      const updated = mockBackend.getCart();
      setItems(updated.items);
      setTotal(updated.total);
  };

  const handleCheckout = async () => {
      if (!shipping.address || !shipping.fullName) {
          showNotification("Please fill in shipping details", "error");
          return;
      }
      
      setProcessing(true);
      try {
          const user = await web3Service.connectWallet();
          
          // Payment
          const payment = await web3Service.sendPayment(total, 'USDT'); // Defaulting to USDT for cart
          if (!payment.success) throw new Error(payment.error || "Payment Failed");

          showNotification("Payment Sent! Waiting confirmation...", "info");
          if(payment.wait) await payment.wait();

          // Save Order
          const orderData = {
              buyer_wallet: user.walletAddress,
              total_price: total,
              currency: 'USDT',
              tx_hash: payment.hash,
              shipping_info: shipping,
              status: 'Processing',
              created_at: new Date().toISOString()
          };
          
          await dbService.createOrder(orderData); // We'd need to adjust Supabase service slightly to handle Items relation, but for now flat order is fine for MVP
          
          mockBackend.saveOrder({
              id: 'ord_' + Date.now(),
              buyer: user.walletAddress,
              total: total,
              currency: 'USDT',
              items: items,
              date: new Date().toISOString(),
              hash: payment.hash || '',
              status: 'Processing',
              shippingInfo: shipping
          });

          mockBackend.clearCart();
          showNotification("Order Placed Successfully!", "success");
          navigate('/orders');

      } catch (err: any) {
          showNotification(err.message, "error");
      } finally {
          setProcessing(false);
      }
  };

  if (items.length === 0) {
      return (
          <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400 text-4xl">
                  <i className="fas fa-shopping-basket"></i>
              </div>
              <h2 className="text-2xl font-bold text-darker mb-2">Your Cart is Empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
              <Link to="/marketplace" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primaryHover">Start Shopping</Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-darker mb-6">Shopping Cart ({items.length})</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                  {items.map(item => (
                      <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm flex gap-4 items-center">
                          <img src={item.image} className="w-20 h-20 object-contain bg-gray-50 rounded" alt={item.title} />
                          <div className="flex-grow">
                              <h3 className="font-bold text-darker text-sm">{item.title}</h3>
                              <p className="text-xs text-gray-500">{item.category}</p>
                              <div className="text-red-600 font-bold mt-1">${item.price}</div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center border border-gray-300 rounded">
                                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100 text-xs">-</button>
                                  <span className="px-2 text-sm font-bold">{item.quantity}</span>
                                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100 text-xs">+</button>
                              </div>
                              <button onClick={() => removeItem(item.id)} className="text-xs text-gray-400 hover:text-red-500">
                                  <i className="fas fa-trash"></i> Remove
                              </button>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Checkout Sidebar */}
              <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                      <h3 className="font-bold text-lg mb-4 text-darker">Order Summary</h3>
                      
                      <div className="flex justify-between mb-2 text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-bold">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-4 text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span className="text-green-600">Free</span>
                      </div>
                      <div className="border-t border-gray-100 pt-4 mb-6 flex justify-between text-xl font-bold text-darker">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                      </div>

                      {/* Shipping Info */}
                      <div className="space-y-3 mb-6">
                          <h4 className="font-bold text-sm text-gray-700">Shipping Address</h4>
                          <input type="text" placeholder="Full Name" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-primary"
                            value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})} />
                          <input type="text" placeholder="Address Line" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-primary"
                            value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
                          <div className="flex gap-2">
                              <input type="text" placeholder="City" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-primary"
                                value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} />
                              <input type="text" placeholder="Country" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm outline-none focus:border-primary"
                                value={shipping.country} onChange={e => setShipping({...shipping, country: e.target.value})} />
                          </div>
                      </div>

                      <button 
                        onClick={handleCheckout} 
                        disabled={processing}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all flex justify-center items-center gap-2"
                      >
                          {processing ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fab fa-bitcoin"></i> Pay with Crypto</>}
                      </button>
                      <p className="text-xs text-center text-gray-400 mt-4">Secured by Blockchain Technology</p>
                  </div>
              </div>

          </div>
      </div>
    </div>
  );
};