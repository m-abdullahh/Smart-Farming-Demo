// DiseaseAnalyzeForm.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Camera, Upload } from "lucide-react-native";

export default function DiseaseAnalyzeForm() {
  const [query, setQuery] = useState("");
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const openCamera = async () => {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      Alert.alert("Permission Denied", "Camera access is required to take photos.");
      return;
    }

    try {
      // Launch the camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.2,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error using camera:", error);
      Alert.alert("Error", "Unable to access the camera.");
    }
  };

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      setError("Sorry, we need camera roll permissions to upload images!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setError("");
      }
    } catch (e) {
      setError("Error picking image");
      console.error(e);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setResponse("");

    // Check if all fields are filled
    if ( !query || !image) {
      setError("Please fill in all fields and upload an image.");
      return;
    }

    setIsLoading(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("description", query);

      // Append image
      const imageFileName = image.split("/").pop();
      const match = /\.(\w+)$/.exec(imageFileName);
      const type = match ? `image/${match[1]}` : "image";

      formData.append("image", {
        uri: Platform.OS === "ios" ? image.replace("file://", "") : image,
        name: imageFileName,
        type,
      });

      // Send POST request
      const response = await axios.post("https://m-abdu11ah-cropapp.hf.space/analyze-crop", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResponse(response.data.response);
    } catch (error) {
      setError("An error occurred while processing your request. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Plant Disease Detection Model</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Input your Query</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Check health of crop in image"
            placeholderTextColor="#D3D3D3"
          />
        </View>

        <View style={styles.iconButtonsContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={openCamera}>
            <Camera size={24} color="#2ecc71" />
            <Text style={styles.iconButtonText}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
            <Upload size={24} color="#2ecc71" />
            <Text style={styles.iconButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.imagePreview} />
          </View>
        )}

        <TouchableOpacity style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit</Text>}
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {response ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{response}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2ecc71",
    textAlign: "center",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 16,
  },
  iconButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  iconButton: {
    alignItems: "center",
  },
  iconButtonText: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#e74c3c",
    marginTop: 10,
    textAlign: "center",
  },
  responseContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  responseText: {
    fontSize: 14,
    color: "#333",
  },
});
