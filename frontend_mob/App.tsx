// @ts-nocheck
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';

// Importa tus pantallas
import Home from './src/presentation/views/home/Home';
import Login from './src/presentation/views/login/Login';

// Importa Header y Footer
import Header from './src/presentation/components/header';
import Footer from './src/presentation/components/footer';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
};


// Layout con Header y Footer (solo para el Home)
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.layoutContainer}>
      <Header />
      <View style={styles.contentContainer}>
        {children}
      </View>
      <Footer />
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Home con Header y Footer */}
            <Stack.Screen name="Home">
              {(props) => (
                <Layout>
                  <Home {...props} />
                </Layout>
              )}
            </Stack.Screen>
            
            {/* Login sin Header ni Footer (pantalla limpia) */}
            <Stack.Screen name="Login" component={Login} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  layoutContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
  },
});