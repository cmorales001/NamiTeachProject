import React, { useState, useEffect, useRef } from 'react';
import { Button, Image, StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync, FlipType, SaveFormat, CropOptions } from 'expo-image-manipulator';
import axios from 'axios';
import { endPoint } from './Endpoint';


export default function CameraScreen({ navigation }) {
  const cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [editedPhoto, setEditedPhoto] = useState(null);
  const [rotations, setRotations] = useState(0);
  

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
  }, []);

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  const _rotate90 = async () => {
    if (!photo || !photo.uri) {
      console.error("Photo uri is null");
      return;
    }
  
    const rotationAngle = 90;
    const totalRotations = (rotations + 1) % 4; // Limitar a 0, 1, 2 o 3
  
    const manipResult = await manipulateAsync(
      photo.uri,
      [{ rotate: rotationAngle * totalRotations }],
      { compress: 1, format: SaveFormat.JPEG }
    );
    setEditedPhoto(manipResult);
    setRotations(totalRotations);
  };
  
  const _cropPhoto = async () => {
    if (!photo || !photo.uri) {
      console.error("Photo uri is null");
      return;
    }

    const cropOptions = {
      originX: 0,
      originY: 0,
      width: photo.width,
      height: photo.height,
    };

    const manipResult = await manipulateAsync(
      photo.uri,
      [{ crop: cropOptions }],
      { compress: 1, format: SaveFormat.JPEG }
    );
    setEditedPhoto(manipResult);
  };

  const _renderImage = () => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: editedPhoto?.uri || photo?.uri }} style={styles.image} />
    </View>
  );

  const handleSend = async () => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: editedPhoto?.uri || photo?.uri,
        type: 'image/jpeg',
        name: 'image.jpg',
      });

      const response = await axios.post(
        endPoint + '/convert/text',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const resultText = response.data.message;

      navigation.navigate('TextInputScreenImage', { text: resultText });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const savePhoto = () => {
    MediaLibrary.saveToLibraryAsync(editedPhoto?.uri || photo?.uri).then(() => {
      setPhoto(null);
      setEditedPhoto(null);
    });
  };

  if (hasCameraPermission === null) {
    return <Text>Requesting permissions...</Text>;
  }

  if (hasCameraPermission === false) {
    return <Text>Permission for camera not granted. Please change this in settings.</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {!photo && (
        <Camera style={styles.camera} ref={cameraRef} type={Camera.Constants.Type.back}>
          <View style={styles.buttonContainer}>
            <Button title="Tomar foto" onPress={takePic} />
          </View>
        </Camera>
      )}
      {photo && (
        <View style={styles.imageContainer}>
          {_renderImage()}
          <View style={styles.buttonGroup}>
            <Button title="Enviar" onPress={handleSend} />           
            <Button title="Descartar" onPress={() => setPhoto(null)} />
            <Button title="Rotar" onPress={_rotate90} />
          </View>
        </View>
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 500,
    height: 500,
    resizeMode: 'contain',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    marginBottom:10,
  },
});
