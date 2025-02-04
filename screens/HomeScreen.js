import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ImageBackground,
} from "react-native";

export default function HomeScreen({ navigation }) {

  return (
    <ImageBackground
      source={require("../assets/bg_image.jpeg")} // Replace with your background image path
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.appName}>AI SMART FARMING</Text>
            <Text style={styles.tagline}>
              Revolutionizing agriculture with technology
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Page1")}
          >
            <Text style={styles.buttonText}>Disease Analyzer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Page2")}
          >
            <Text style={styles.buttonText}>Crop Help Bot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Page3")}
          >
            <Text style={styles.buttonText}>Farm Management Bot</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Page4")}
          >
            <Text style={styles.buttonText}>WeatherAssistScreen</Text>
          </TouchableOpacity>
      
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Dark overlay for readability
    justifyContent: "center",
  },
  container: {
    padding: 0,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  appName: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2ecc71",
    marginBottom: 0,
  },
  tagline: {
    fontSize: 16,
    color: "#ecf0f1",
    textAlign: "center",
    opacity: 0.8,
  },
  welcomeText: {
    fontSize: 18,
    color: "#ecf0f1",
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.5,
  },
  button: {
    backgroundColor: "#2ecc71", // Restored original button design
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignSelf: "center",
    marginVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
