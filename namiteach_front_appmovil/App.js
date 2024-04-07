import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TakePhotoScreen from './src/components/TakePhotoScreen';
import CameraScreen from './src/components/CameraScreen';
import ImagenScreen from './src/components/ImagenScreen';
import TextInputScreen from './src/components/TextInputScreen';
import ResultScreen from './src/components/ResultScreen';
import TextInputScreenImage from './src/components/TextScreenImage';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TakePhotoScreen">
        <Stack.Screen name="TakePhotoScreen" component={TakePhotoScreen} options={{ title: 'Nami Teach' }} />
        <Stack.Screen name="CameraScreen" component={CameraScreen} options={{ title: 'Cámara' }} />
        <Stack.Screen name="ImageScreen" component={ImagenScreen} options={{ title: 'Seleccionar Imagen' }} />
        <Stack.Screen name="TextInputScreen" component={TextInputScreen} options={{ title: 'Ingresar Texto' }} />
        <Stack.Screen name="ResultScreen" component={ResultScreen} options={{ title: 'Resultado' }} />
        <Stack.Screen name="TextInputScreenImage" component={TextInputScreenImage} options={{ title: 'Editar Texto' }} />
      </Stack.Navigator>
        
    </NavigationContainer>
  );
};

export default App;