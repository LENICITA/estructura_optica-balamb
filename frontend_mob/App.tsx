// @ts-nocheck
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';

// Importa tus pantallas
import Home from './src/presentation/views/home/Home';
import Login from './src/presentation/views/login/Login';
import PrincipalCliente from './src/presentation/views/principal-cliente/PrincipalCliente';
import RegisterScreen from './src/presentation/views/register/RegisterScreen'; // 👈 IMPORTA EL REGISTRO

// Importa Header y Footer
import Header from './src/presentation/components/header';
import Footer from './src/presentation/components/footer';

const Stack = createNativeStackNavigator();

// Layout con Header y Footer
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
            
            <Stack.Screen name="Home">
              {(props) => (
                <Layout>
                  <Home {...props} />
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="PrincipalCliente" component={PrincipalCliente} />
            
            {/* 👈 AGREGA ESTA LÍNEA PARA EL REGISTRO */}
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />

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