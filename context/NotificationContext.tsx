import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 animate-[slideIn_0.3s_ease-out] z-[100] flex items-center gap-3 border border-white/10 backdrop-blur-md ${
          notification.type === 'success' ? 'bg-green-600/90' : 
          notification.type === 'error' ? 'bg-red-600/90' : 'bg-primary/90'
        } text-white`}>
          <i className={`text-xl fas ${
            notification.type === 'success' ? 'fa-check-circle' :
            notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
          }`}></i>
          <span className="font-medium">{notification.message}</span>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};