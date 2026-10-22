import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';

import Dashboard from './pages/Dashboard';
import PredictCustomer from './pages/PredictCustomer';
import CustomerExplorer from './pages/CustomerExplorer';
import CustomerDetails from './pages/CustomerDetails';
import Analytics from './pages/Analytics';
import ModelInsights from './pages/ModelInsights';
import Login from './pages/Login';
import Profile from './pages/Profile';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('churniq-session') || 'null'); } catch { return null; }
  });

  const signIn = (user) => {
    localStorage.setItem('churniq-session', JSON.stringify(user));
    setSession(user);
  };
  const signOut = () => {
    localStorage.removeItem('churniq-session');
    setSession(null);
    setCurrentTab('dashboard');
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId);
    setCurrentTab('customer_details');
  };

  const handleBackToExplorer = () => {
    setSelectedCustomerId(null);
    setCurrentTab('customers');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigateToPredict={() => setCurrentTab('predict')}
            onSelectCustomer={handleSelectCustomer}
          />
        );
      case 'predict':
        return <PredictCustomer />;
      case 'customers':
        return <CustomerExplorer onSelectCustomer={handleSelectCustomer} />;
      case 'customer_details':
        return (
          <CustomerDetails
            customerId={selectedCustomerId}
            onBack={handleBackToExplorer}
          />
        );
      case 'analytics':
        return <Analytics />;
      case 'model':
        return <ModelInsights />;
      case 'profile':
        return <Profile user={session} onSave={(user) => signIn(user)} onSignOut={signOut} />;
      default:
        return (
          <Dashboard
            onNavigateToPredict={() => setCurrentTab('predict')}
            onSelectCustomer={handleSelectCustomer}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      {!session ? <Login onSignIn={signIn} /> : (
      <AppLayout
        currentTab={currentTab === 'customer_details' ? 'customers' : currentTab}
        user={session}
        onSelectTab={(tab) => {
          setSelectedCustomerId(null);
          setCurrentTab(tab);
        }}
      >
        {renderContent()}
      </AppLayout>
      )}
    </ThemeProvider>
  );
}
