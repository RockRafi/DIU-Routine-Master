import React, { useState, useEffect } from 'react';
import { AppData } from './types';
import { getInitialData, saveData } from './services/dbService';
import PublicView from './components/PublicView';
import AdminDashboard from './components/AdminDashboard';
import LoginDialog from './components/LoginDialog';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadedData = getInitialData();
    setData(loadedData);
    setIsLoading(false);
  }, []);

  // Update handler
  const handleUpdateData = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  const handleLoginSuccess = (success: boolean) => {
    if (success) {
      setIsAdmin(true);
      setShowLogin(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDF5]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading Routine System...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoginDialog 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLogin={handleLoginSuccess} 
      />
      
      {isAdmin ? (
        <AdminDashboard 
          data={data} 
          onUpdateData={handleUpdateData} 
          onLogout={() => setIsAdmin(false)} 
        />
      ) : (
        <PublicView 
          data={data} 
          onAdminClick={() => setShowLogin(true)} 
        />
      )}
    </>
  );
};

export default App;