import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, KeyboardAvoidingView, Platform, Text, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { endPoint } from './Endpoint';

const TextInputScreenImage = ({ navigation, route }) => {
    const [text, setText] = useState(route.params.text || '');
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [errorModalVisible, setErrorModalVisible] = useState(false); // Estado para controlar la visibilidad del modal de error

  const handleCancel = () => {
    // Navegar de vuelta a la pantalla principal
    navigation.goBack();
  };

  const handleSend = async () => {
    try {
      // Enviar el texto a la nueva API que devuelve enlaces
      const response = await axios.post(endPoint +'/basicknowledge', {
        instruction: text,
        level: selectedLevel
      });

      // Extraer los enlaces de la respuesta
      const videoLinks = response.data.content;
      const basicKnowledge = response.data.basicKnowledge;

      // Navegar a la pantalla ResultScreen y pasar los enlaces como parámetro
      navigation.navigate('ResultScreen', { textResult: text, videoLinks: videoLinks, basicKnowledge: basicKnowledge});
    } catch (error) {
      console.error('Error al obtener enlaces:', error);
      setErrorModalVisible(true); // Mostrar el modal de error
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe tu pregunta"
          onChangeText={(inputText) => setText(inputText)}
          value={text}
          multiline={true}
          numberOfLines={5}
        />
        <View style={styles.levelContainer}>
          <Text style={styles.label}>Elige el nivel de estudio:</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[styles.radioButton, selectedLevel === 4 && styles.selectedButton]}
              onPress={() => setSelectedLevel(4)}
            >
              <Text style={styles.radioText}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, selectedLevel === 5 && styles.selectedButton]}
              onPress={() => setSelectedLevel(5)}
            >
              <Text style={styles.radioText}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, selectedLevel === 6 && styles.selectedButton]}
              onPress={() => setSelectedLevel(6)}
            >
              <Text style={styles.radioText}>6</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.radioButton, selectedLevel === 7 && styles.selectedButton]}
              onPress={() => setSelectedLevel(7)}
            >
              <Text style={styles.radioText}>7</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Cancelar" onPress={handleCancel} />
          <Button title="Enviar" onPress={handleSend} />
        </View>
      </View>
      
      {/* Modal de error */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => {
          setErrorModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.errorText}>La pregunta no pertenece a educación primaria.</Text>
            <Button title="Cerrar" onPress={() => setErrorModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '80%',
  },
  input: {
    height: 300,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  levelContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedButton: {
    backgroundColor: 'blue', // Color de fondo cuando está seleccionado
  },
  radioText: {
    fontSize: 16,
  },
  // Estilos del modal de error
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default TextInputScreenImage;