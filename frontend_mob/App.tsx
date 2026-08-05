// Archivo enrutador

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardRepartidores from './src/presentation/views/admin/dashboardRepartidores';

export type RootStackParamList = {
  DashboardRepartidores: undefined;
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
            title: "Registro",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
