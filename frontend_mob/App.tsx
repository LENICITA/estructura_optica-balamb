// Archivo enrutador

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardRepartidores from './src/presentation/views/admin/DashboardRepartidores';
import EditarRepartidor from './src/presentation/views/admin/EditarRepartidor';
import DetalleRepartidor from './src/presentation/views/admin/DetalleRepartidor';

export type RootStackParamList = {
  DashboardRepartidores: undefined;
  EditarRepartidor: undefined;
  DetalleRepartidor: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

// ruta de registro
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="DashboardRepartidores"
          component={DashboardRepartidores}
          options={{
            headerShown: true,
            title: "Dashboard Repartidores",
          }}
        />

        <Stack.Screen 
         name="DetalleRepartidor" 
         component={DetalleRepartidor} 
         options={{ headerShown: false }}
         />

        <Stack.Screen 
        name="EditarRepartidor" 
        component={EditarRepartidor}  // ← Tu componente real
        options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
