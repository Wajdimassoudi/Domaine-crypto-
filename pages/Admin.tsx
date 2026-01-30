import React, { useEffect, useState } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Order } from '../types';
import { Link } from 'react-router-dom';

export const Admin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(mockBackend.getOrders());
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-darker mb-8">My Orders</h1>

        {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                <i className="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">No orders placed yet.</p>
                <Link to="/marketplace" className="text-primary font-bold mt-2 inline-block">Start Shopping</Link>
            </div>
        ) : (
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Order ID</span>
                                <div className="font-mono font-bold text-darker">{order.id}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-gray-500 uppercase tracking-wider">Total</span>
                                <div className="font-bold text-red-600">${order.total} {order.currency}</div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                }`}>
                                    {order.status}
                                </span>
                                <span className="text-xs text-gray-400">Placed on {new Date(order.date).toLocaleDateString()}</span>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <img src={item.image} className="w-16 h-16 object-contain bg-gray-50 rounded" />
                                        <div>
                                            <h4 className="font-bold text-sm text-darker">{item.title}</h4>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    <i className="fas fa-map-marker-alt mr-1"></i> 
                                    {order.shippingInfo.fullName}, {order.shippingInfo.city}
                                </div>
                                <a href={`https://bscscan.com/tx/${order.hash}`} target="_blank" className="text-primary text-xs hover:underline">
                                    View Transaction <i className="fas fa-external-link-alt"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};