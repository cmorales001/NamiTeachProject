import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { endPoint } from "./Endpoint";

const ResultScreen = ({ route, navigation }) => {
  const { textResult, videoLinks, basicKnowledge } = route.params;
  const [videoFeedback, setVideoFeedback] = useState({});
  const [likedVideos, setLikedVideos] = useState([]);
  const [dislikedVideos, setDislikedVideos] = useState([]);

  const handleFeedback = (videoUrl, feedback) => {
    try {
        if (videoFeedback[videoUrl]) {
            console.log("Ya has enviado feedback para este video");
            return;
        }

        setVideoFeedback((prevFeedback) => ({
            ...prevFeedback,
            [videoUrl]: feedback,
        }));
        if (feedback === "like") {
            setLikedVideos((prevLikedVideos) => [...prevLikedVideos, videoUrl]);
            setDislikedVideos((prevDislikedVideos) =>
                prevDislikedVideos.filter((url) => url !== videoUrl)
            );
        } else if (feedback === "dislike") {
            setDislikedVideos((prevDislikedVideos) => [
                ...prevDislikedVideos,
                videoUrl,
            ]);
            setLikedVideos((prevLikedVideos) =>
                prevLikedVideos.filter((url) => url !== videoUrl)
            );
        }
        sendFeedbackToAPI(); // Llamar a la función para enviar retroalimentación
    } catch (error) {
        console.error("Error en handleFeedback:", error);
    }
};

const isLiked = (videoUrl) => likedVideos.includes(videoUrl);
const isDisliked = (videoUrl) => dislikedVideos.includes(videoUrl);


  const sendFeedbackToAPI = async () => {
    try {
      for (const [videoUrl, feedback] of Object.entries(videoFeedback)) {
        await axios.post(
          endPoint + '/content/opinion',
          {
            basicKnowlegde: basicKnowledge,
            videoUrl: videoUrl,
            feedback: feedback,
          }
        );
      }
      console.log("Datos de retroalimentación enviados con éxito");
    } catch (error) {
      console.error(
        "Error al enviar datos de retroalimentación a la API:",
        error.response.data
      );
    }
  };

  const navigateToHome = () => {
    navigation.navigate("TakePhotoScreen");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.text}>Pregunta:</Text>
        <Text style={styles.extractedText}>{textResult}</Text>
      </View>
      <View style={styles.box}>
        <Text style={styles.text}>Lo que necesitas aprender:</Text>
        <FlatList
          scrollEnabled={false}
          data={videoLinks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View>
              <WebView
                source={{
                  uri:` https://www.youtube.com/embed/${item.split("=")[1]}`
                }}
                style={styles.videoContainer}
                allowsFullscreenVideo={true}
                allowsInlineMediaPlayback={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                scalesPageToFit={true}
                scrollEnabled={true}
                bounces={true}
                javaScriptEnabledAndroid={true}
                javaScriptEnabledIOS={true}
                mixedContentMode="always"
                useWebKit={true}
              />

              <AntDesign
                name="like1"
                size={28}
                color={isLiked(item) ? "blue" : "gray"}
                onPress={() => handleFeedback(item, "like")}
              />
              <AntDesign
                name="dislike1"
                size={28}
                color={isDisliked(item) ? "red" : "gray"}
                onPress={() => handleFeedback(item, "dislike")}
              />
            </View>
          )}
        />
      </View>
      <Button title="Volver a la pantalla principal" onPress={navigateToHome} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  box: {
    backgroundColor: "#e0e0e0",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  extractedText: {
    fontSize: 16,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  feedbackButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
});

export default ResultScreen;