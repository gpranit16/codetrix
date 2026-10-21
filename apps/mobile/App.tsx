import React, { useState, useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AddLoanScreen } from './src/screens/AddLoanScreen';
import { colors } from './src/theme/colors';

const MainNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAddLoanVisible, setIsAddLoanVisible] = useState(false);
  const [dashboardKey, setDashboardKey] = useState(0);

  // Handle Android back button
  useEffect(() => {
    const onBackPress = () => {
      if (isAddLoanVisible) {
        setIsAddLoanVisible(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [isAddLoanVisible]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <DashboardScreen
        key={dashboardKey}
        onOpenAddLoan={() => setIsAddLoanVisible(true)}
      />

      {/* Add Loan Modal */}
      <Modal
        visible={isAddLoanVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAddLoanVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <AddLoanScreen
            onClose={() => setIsAddLoanVisible(false)}
            onSuccess={() => {
              setIsAddLoanVisible(false);
              // Trigger reload of dashboard
              setDashboardKey((prev) => prev + 1);
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
