// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { COLORS } from './src/constants/colors';

// Pantallas desde screens/all/
import { Principal } from './src/screens/all/Principal';
import { Iniciosesion } from './src/screens/all/Iniciosesion';
import { PerfilTodos } from './src/screens/all/PerfilTodos';
import { RecuperarContraseña } from './src/screens/all/RecuperarContraseña';
import { RestablecerContraseña } from './src/screens/all/RestablecerContraseña';

// Pantallas desde screens/client/
import { AutoRegistro } from './src/screens/client/AutoRegistro';
import { PrincipalCliente } from './src/screens/client/PrincipalCliente';

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
            initialRouteName="Principal"
            screenOptions={{ headerShown: false }}
          >

            {/* Pantallas con Layout (Header + Footer) */}
            <Stack.Screen name="Principal">
              {() => (
                <Layout>
                  <Principal />
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

            <Stack.Screen name="PerfilTodos">
              {() => (
                <Layout>
                  <PerfilTodos />
                </Layout>
              )}
            </Stack.Screen>

            {/* Pantallas SIN Layout (sin Header ni Footer) */}
            <Stack.Screen name="Iniciosesion" component={Iniciosesion} />
            <Stack.Screen name="AutoRegistro" component={AutoRegistro} />
            <Stack.Screen name="RecuperarContraseña" component={RecuperarContraseña} />
            <Stack.Screen name="RestablecerContraseña" component={RestablecerContraseña} />

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