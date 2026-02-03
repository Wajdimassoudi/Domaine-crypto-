
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { web3Service } from '../services/web3Service';
import { dbService } from '../services/supabaseClient';
import { useNotification } from '../context/NotificationContext';
import { CartItem, Order } from '../types';

const ALL_COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
    "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen", "Zambia", "Zimbabwe"
];

export const Cart: React.FC = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [processing, setProcessing] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const [shipping, setShipping] = useState({ 
      fullName: '', 
      email: '',
      phone: '',
      address: '', 
      city: '', 
      country: '',
      zipCode: ''
  });

  useEffect(() => {
      const cart = mockBackend.getCart();
      setItems(cart.items);
      setTotal(cart.total);
  }, []);

  const updateQty = (id: string | number, newQty: number) => {
      if (newQty < 1) {
          mockBackend.removeFromCart(id);
      } else {
          const item = items.find(i => i.id === id);
          if (item) mockBackend.addToCart({...item}, newQty - item.quantity);
      }
      const updated = mockBackend.getCart();
      setItems(updated.items);
      setTotal(updated.total);
  };

  const removeItem = (id: string | number) => {
      mockBackend.removeFromCart(id);
      const updated = mockBackend.getCart();
      setItems(updated.items);
      setTotal(updated.total);
  };

  const handleCheckout = async () => {
      if (!shipping.address || !shipping.fullName || !shipping.email || !shipping.phone || !shipping.zipCode || !shipping.country) {
          showNotification("Please fill in all shipping details correctly.", "error");
          return;
      }
      
      setProcessing(true);
      try {
          const user = await web3Service.connectWallet();
          const payment = await web3Service.sendPayment(total, 'USDT'); 
          if (!payment.success) throw new Error(payment.error || "Payment Failed");

          showNotification("Payment Sent! Confirming on Blockchain...", "info");
          if(payment.wait) await payment.wait();

          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + 20);

          const invoiceNum = `INV-${Date.now().toString().slice(-6)}`;

          const orderData: Order = {
              id: invoiceNum,
              buyer: user.walletAddress,
              total: total,
              currency: 'USDT',
              items: [...items],
              date: new Date().toISOString(),
              hash: payment.hash || '',
              status: 'Processing',
              shippingInfo: shipping,
              invoiceNumber: invoiceNum,
              estimatedDelivery: deliveryDate.toLocaleDateString()
          };
          
          await dbService.createOrder(orderData); 
          mockBackend.saveOrder(orderData);
          mockBackend.clearCart();
          setCompletedOrder(orderData);
          showNotification("Order Placed Successfully!", "success");

      } catch (err: any) {
          showNotification(err.message, "error");
      } finally {
          setProcessing(false);
      }
  };

  if (completedOrder) {
      return (
          <div className="min-h-screen pt-32 pb-20 bg-gray-100 flex items-center justify-center p-4">
              <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl overflow-hidden border border-gray-200 animate-[fadeIn_0.5s]">
                  <div className="bg-green-600 p-6 text-center text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                          <i className="fas fa-check text-3xl"></i>
                      </div>
                      <h2 className="text-2xl font-bold">Payment Confirmed!</h2>
                      <p className="opacity-90">Your order is being processed via getwealthos.icu logistics.</p>
                  </div>
                  
                  <div className="p-8">
                      <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                          <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Invoice Number</p>
                              <p className="font-mono font-bold text-lg text-darker">{completedOrder.invoiceNumber}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Amount</p>
                              <p className="font-bold text-xl text-green-600">${completedOrder.total.toFixed(2)} USDT</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mb-8">
                          <div>
                              <h4 className="font-bold text-darker mb-2 text-sm">Shipping To:</h4>
                              <p className="text-sm text-gray-600">{completedOrder.shippingInfo.fullName}</p>
                              <p className="text-sm text-gray-600">{completedOrder.shippingInfo.address}</p>
                              <p className="text-sm text-gray-600">{completedOrder.shippingInfo.city}, {completedOrder.shippingInfo.country}</p>
                          </div>
                          <div>
                               <h4 className="font-bold text-darker mb-2 text-sm">Estimated Delivery:</h4>
                               <p className="text-lg font-bold text-primary">{completedOrder.estimatedDelivery}</p>
                               <p className="text-xs text-gray-400 mt-1">Standard Global Shipping (15-25 Days)</p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <button onClick={() => window.print()} className="flex-1 border border-gray-300 text-darker font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <i className="fas fa-print mr-2"></i> Print Invoice
                          </button>
                          <button onClick={() => navigate('/orders')} className="flex-1 bg-darker text-white font-bold py-3 rounded-lg hover:bg-black transition-colors">
                              Track Order
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (items.length === 0) {
      return (
          <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400 text-4xl">
                  <i className="fas fa-shopping-basket"></i>
              </div>
              <h2 className="text-2xl font-bold text-darker mb-2">Your Cart is Empty</h2>
              <p className="text-gray-500 mb-6">Explore our global catalog powered by getwealthos.icu.</p>
              <Link to="/marketplace" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primaryHover">Start Shopping</Link>
          </div>
      );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-darker mb-6">Checkout Securely</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="font-bold text-darker mb-4 border-b border-gray-100 pb-2">1. Review Items</h3>
                      <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-4 items-center border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                                <img src={item.image} className="w-16 h-16 object-contain bg-gray-50 rounded border border-gray-200" alt={item.title} />
                                <div className="flex-grow">
                                    <h3 className="font-bold text-darker text-sm">{item.title}</h3>
                                    <div className="text-green-600 font-bold mt-1 text-sm">${item.price}</div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center border border-gray-300 rounded">
                                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100 text-xs">-</button>
                                        <span className="px-2 text-sm font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100 text-xs">+</button>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-xs text-red-400 hover:text-red-600 underline">Remove</button>
                                </div>
                            </div>
                        ))}
                      </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="font-bold text-darker mb-4 border-b border-gray-100 pb-2">2. Shipping Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="col-span-2 md:col-span-1">
                              <label className="block text-xs font-bold text-gray-500 mb-1">Full Name</label>
                              <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                                value={shipping.fullName} onChange={e => setShipping({...shipping, fullName: e.target.value})} placeholder="John Doe" />
                          </div>
                          <div className="col-span-2 md:col-span-1">
                              <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                              <input type="tel" className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                                value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} placeholder="+1 234 567 8900" />
                          </div>
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                              <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                                value={shipping.email} onChange={e => setShipping({...shipping, email: e.target.value})} placeholder="john@example.com" />
                          </div>
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-500 mb-1">Street Address</label>
                              <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                                value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} placeholder="123 Market St, Apt 4B" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">City</label>
                              <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                                value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} placeholder="New York" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Zip / Postal Code</label>
                              <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                                value={shipping.zipCode} onChange={e => setShipping({...shipping, zipCode: e.target.value})} placeholder="10001" />
                          </div>
                          <div className="col-span-2">
                              <label className="block text-xs font-bold text-gray-500 mb-1">Country</label>
                              <select className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
                                value={shipping.country} onChange={e => setShipping({...shipping, country: e.target.value})}>
                                  <option value="">Select Country...</option>
                                  {ALL_COUNTRIES.map(country => (
                                      <option key={country} value={country}>{country}</option>
                                  ))}
                              </select>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24 border border-gray-200">
                      <h3 className="font-bold text-lg mb-4 text-darker">Order Summary</h3>
                      <div className="flex justify-between mb-2 text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-bold">${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between mb-2 text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span className="text-green-600 font-bold">Free</span>
                      </div>
                      <div className="border-t border-dashed border-gray-200 pt-4 mb-6 flex justify-between text-xl font-bold text-darker">
                          <span>Total</span>
                          <span className="text-green-600">${total.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={handleCheckout} 
                        disabled={processing}
                        className="w-full bg-primary hover:bg-primaryHover text-white font-bold py-3.5 rounded-lg shadow-lg shadow-primary/30 transition-all flex justify-center items-center gap-2"
                      >
                          {processing ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fab fa-bitcoin"></i> Confirm & Pay</>}
                      </button>
                      <p className="text-[10px] text-center text-gray-400 mt-4 italic">Powered by WealthOS Secure Payment Engine at getwealthos.icu</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
