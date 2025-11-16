import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebHeader from './components/WebHeader';
import WebOverviewScreen from './screens/WebOverviewScreen';
import WebEJISScorecard from './screens/WebEJISScorecard';
import WebCCCMarket from './screens/WebCCCMarket';
import WebContributionLedger from './screens/WebContributionLedger';
import WebVerificationTool from './screens/WebVerificationTool';
import WebAnalytics from './screens/WebAnalytics';
import AuthScreen from './screens/AuthScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const storedUser = localStorage.getItem('veritas_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('veritas_user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuth(false);
    localStorage.setItem('veritas_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setShowAuth(false);
    localStorage.removeItem('veritas_user');
  };

  const handleAuthClose = () => {
    setShowAuth(false);
  };

  const handleLoginClick = () => {
    setShowAuth(true);
  };

  const renderContent = () => {
    if (showAuth) {
      return <AuthScreen onLogin={handleLogin} onClose={handleAuthClose} />;
    }

    switch (activeTab) {
      case 'overview':
        return <WebOverviewScreen user={user} onTabChange={setActiveTab} />;
      case 'ejis':
        return <WebEJISScorecard user={user} />;
      case 'market':
        return <WebCCCMarket user={user} />;
      case 'ledger':
        return <WebContributionLedger user={user} />;
      case 'verification':
        return <WebVerificationTool user={user} />;
      case 'analytics':
        return <WebAnalytics user={user} />;
      default:
        return <WebOverviewScreen user={user} onTabChange={setActiveTab} />;
    }
  };

  return (
    <View style={styles.container}>
      <WebHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
      />
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  content: {
    flex: 1,
  },
});