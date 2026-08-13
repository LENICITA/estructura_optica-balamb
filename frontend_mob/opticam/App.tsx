// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { COLORS } from './src/constants/colors';

// Pantallas desde screens/all/
import { Principal } from './src/screens/all/Principal';
import { Iniciosesion } from './src/screens/all/Iniciosesion';
import { RecuperarContraseña } from './src/screens/all/RecuperarContraseña';
import { RestablecerContraseña } from './src/screens/all/RestablecerContraseña';

// Pantallas desde screens/client/
import { AutoRegistro } from './src/screens/client/AutoRegistro';
import { PrincipalCliente } from './src/screens/client/PrincipalCliente';
import { PerfilCliente } from './src/screens/client/PerfilCliente';

// Pantallas desde screens/admin/
import { RegistrarRepartidor } from './src/screens/admin/RegistrarRepartidor';
import { PerfilAdmin } from './src/screens/admin/PerfilAdmin';
import { PrincipalAdmin } from './src/screens/admin/PrincipalAdmin';
import DashboardRepartidores from './src/screens/admin/DashboardRepartidores';

// Pantallas desde screens/repa/
import { PerfilRepartidor } from './src/screens/repa/PerfilRepartidor';
import { PrincipalRepartidor } from './src/screens/repa/PrincipalRepartidor';

// Importa Header y Footer
import { Header } from './src/components/Header';
import { Footer } from './src/components/Footer';
import { BottomNavigation } from './src/components/BottomNavigation';
import { ChatBot } from './src/components/ChatBot';

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

const UserLayout = ({
  children
}: {
  children: React.ReactNode
}) => {

    const { user } = useAuth();

      const roles = Array.isArray(user?.roles)
          ? user.roles.map((rol: string) =>
              String(rol).toUpperCase()
            )
          : typeof user?.roles === 'string'
            ? [user.roles.toUpperCase()]
            : user?.rol
              ? [String(user.rol).toUpperCase()]
              : [];

        const esCliente = roles.includes('CLIENTE');

  return (
    <View style={styles.layoutContainer}>

      {/* HEADER */}
      <Header />

      {/* CONTENIDO */}
      <View style={styles.contentContainer}>
        {children}
      </View>

      {/* CHATBOT - SOLO CLIENTE */}
            {esCliente && <ChatBot />}

      {/* NAVEGACIÓN SEGÚN EL ROL */}
      <BottomNavigation />

      {/* FOOTER */}
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

            <Stack.Screen name="PrincipalAdmin">
              {({ navigation }) => (
                  <UserLayout>
                 <PrincipalAdmin navigation={navigation} />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="DashboardRepartidores">
              {() => (
                <UserLayout>
                  <DashboardRepartidores />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="RegistrarRepartidor">
              {({ navigation }) => (
                  <UserLayout>
                <RegistrarRepartidor navigation={navigation} />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PerfilAdmin">
               {({ navigation }) => (
                   <UserLayout>
                 <PerfilAdmin navigation={navigation} />
                   </UserLayout>
               )}
           </Stack.Screen>

            <Stack.Screen name="PrincipalCliente">
              {({ navigation }) => (
                  <UserLayout>
                  <PrincipalCliente navigation={navigation} />
                  </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PerfilCliente">
              {({ navigation }) => (
                <UserLayout>
                  <PerfilCliente navigation={navigation} />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PrincipalRepartidor">
              {({ navigation }) => (
                  <UserLayout>
                 <PrincipalRepartidor navigation={navigation} />
                 </UserLayout>
               )}
           </Stack.Screen>

            <Stack.Screen name="PerfilRepartidor">
               {({ navigation }) => (
                   <UserLayout>
                 <PerfilRepartidor navigation={navigation} />
                 </UserLayout>
               )}
           </Stack.Screen>

            {/* Pantallas sin Layout */}
            <Stack.Screen name="Iniciosesion">
              {({ navigation }) => (
                <Iniciosesion navigation={navigation} />
              )}
            </Stack.Screen>

            <Stack.Screen name="AutoRegistro">
              {({ navigation }) => (
                <AutoRegistro navigation={navigation} />
              )}
            </Stack.Screen>

            <Stack.Screen name="RecuperarContraseña">
              {({ navigation }) => (
                <RecuperarContraseña navigation={navigation} />
              )}
            </Stack.Screen>

            <Stack.Screen name="RestablecerContraseña">
              {({ navigation }) => (
                <RestablecerContraseña navigation={navigation} />
              )}
            </Stack.Screen>

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  layoutContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
  },
});