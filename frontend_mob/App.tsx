// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext'; // Si ya tienes AuthContext

// Importa tus pantallas
import Home from './src/presentation/views/home/Home';
import { RegisterScreen } from './src/presentation/views/register/Register';

// Importa Header y Footer
import Header from './src/presentation/components/header';
import Footer from './src/presentation/components/footer';

export type RootStackParamList = {
  Home: undefined;
  RegisterScreen: undefined;
  // Agrega aquí todas tus rutas
  Login: undefined;
  Catalogo: undefined;
  Carrito: undefined;
  // ... etc
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Componente Layout que envuelve las pantallas con Header y Footer
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
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {/* ========== PANTALLAS CON HEADER Y FOOTER ========== */}
            <Stack.Screen name="Home">
              {() => (
                <Layout>
                  <Home />
                </Layout>
              )}
            </Stack.Screen>

            {/* Agrega aquí todas las pantallas que necesiten Header y Footer */}
            <Stack.Screen name="Catalogo">
              {() => (
                <Layout>
                  {/* <Catalogo /> */}
                  <Home /> {/* Temporal para probar */}
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Carrito">
              {() => (
                <Layout>
                  {/* <Carrito /> */}
                  <Home /> {/* Temporal para probar */}
                </Layout>
              )}
            </Stack.Screen>

            {/* ========== PANTALLAS SIN HEADER Y FOOTER ========== */}
            <Stack.Screen 
              name="RegisterScreen" 
              component={RegisterScreen} 
            />

            
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaView>
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