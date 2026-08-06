// Archivo enrutador

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EditarRepartidor from './src/presentation/views/admin/EditarRepartidor';

export type RootStackParamList = {
  EditarRepartidor: undefined;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

// ruta de registro
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="EditarRepartidor"
          component={EditarRepartidor}
          options={{
            headerShown: true,
            title: "Editar Repartidor",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
