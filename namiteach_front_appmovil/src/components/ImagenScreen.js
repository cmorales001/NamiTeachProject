import React, { useState, useEffect } from 'react';
import { Button, Image, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { endPoint } from './Endpoint';
import { useNavigation } from '@react-navigation/native';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

const ImageScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [textResult, setTextResult] = useState(null);
  const [imageWidth, setImageWidth] = useState(windowWidth * 0.8);
  const [imageHeight, setImageHeight] = useState(windowHeight * 0.3);

  useEffect(() => {
    if (image) {
      Image.getSize(image, (width, height) => {
        const ratio = width / height;
        const newImageWidth = windowWidth * 0.8;
        const newImageHeight = newImageWidth / ratio;
        setImageWidth(newImageWidth);
        setImageHeight(newImageHeight);
      });
    }
  }, [image]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setTextResult(null); // Limpiar el texto resultante al elegir una nueva imagen
    }
  };

  const handleCancel = () => {
    // Navegar a la pantalla principal
    navigation.goBack();
  };

  const handleSend = async () => {
    try {
      if (image) {
        const formData = new FormData();
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
  
        const response = await axios.post(endPoint +'/convert/text', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        const resultText = response.data.message;
  
        // Navegar a la pantalla TextInputScreen y pasar el texto extraído como parámetro
        navigation.navigate('TextInputScreenImage', { text: resultText });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      <Button title="Elegir una imagen" onPress={pickImage} />
      {image && (
        <Image source={{ uri: image }} style={{ ...styles.image, width: imageWidth, height: imageHeight }} />
      )}
      {image && (
        <View style={styles.buttonContainer}>
          <Button title="Cancelar" onPress={handleCancel} />
          <Button title="Enviar" onPress={handleSend} />
        </View>
      )}
    </View>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 60,
  },
  image: {
    marginVertical: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default ImageScreen;
