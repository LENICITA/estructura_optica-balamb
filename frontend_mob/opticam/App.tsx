// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { COLORS } from './src/constants/colors';

// Importa tus pantallas
import { Home } from './src/presentation/views/home/Home';
import { Login } from './src/presentation/views/login/Login';
import { PrincipalCliente } from './src/presentation/views/principal-cliente/PrincipalCliente';
import { RegisterScreen } from './src/presentation/views/register/RegisterScreen';
import { PerfilCliente } from './src/presentation/views/perfil-cliente/PerfilCliente';

// Importa Header y Footer
import { Header } from './src/components/Header';
import { Footer } from './src/components/Footer';

const Stack = createNativeStackNavigator();

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
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
          >

            {/* Pantallas con Layout (Header + Footer) */}
            <Stack.Screen name="Home">
              {() => (
                <Layout>
                  <Home />
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PrincipalCliente">
              {() => (
                <Layout>
                  <PrincipalCliente />
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PerfilCliente">
              {() => (
                <Layout>
                  <PerfilCliente />
                </Layout>
              )}
            </Stack.Screen>

            {/* Pantallas SIN Layout (sin Header ni Footer) */}
            <Stack.Screen name="Login" component={Login} />
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
    backgroundColor: '#000',
  },
  layoutContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
  },
});