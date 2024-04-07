import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const TakePhotoScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Presiona el botón para tomar una foto</Text>
      <View style={styles.button}>
        <Button title="Tomar Foto" onPress={() => navigation.navigate('CameraScreen')} />
      </View>
      <Text>Presiona el botón para elegir una foto</Text>
      <View style={styles.button}>
        <Button title="Seleccionar Imagen" onPress={() => navigation.navigate('ImageScreen')} />
      </View>
      <Text>Presiona el botón para escribir tu pregunta</Text>
      <View style={styles.button}>
      <Button title="Escribe tu pregunta" onPress={() => navigation.navigate('TextInputScreen')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginVertical: 10,
    borderRadius: 10, 
    overflow: 'hidden',
  },
});

export default TakePhotoScreen;