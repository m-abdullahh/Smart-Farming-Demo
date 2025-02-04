import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import Toast from "react-native-toast-message";

export default function WeatherAssistScreen() {
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});

      try {
        
        const res = await axios.get(
          `http://api.weatherapi.com/v1/current.json?key=6a505fb1a9524697bf6163145253001&q=${loc.coords.latitude},${loc.coords.longitude}`
        );
        setWeather(res.data);
        setError("");
      } catch (err) {
        setError(`Failed to fetch weather data. ${err}`);
      }
    })();
  }, []);

  useEffect(() => {
    if (weather) {
         Toast.show({
              type: 'success',
              text1: `Weather of ${weather.location.name}, is ${weather.current.condition.text} with ${weather.current.temp_c}°C.`,
              autoHide: true,
              position: 'top',
              visibilityTime: 6000,
              keyboardOffset: 0,
              swipeable: true,
            });

    }
  }, [weather]);

  const handleSubmit = async () => {
    setError("");
    setResponse("");

    if (!query) {
      setError("Please enter a query.");
      return;
    }
    if (!weather) {
      setError("Please allow location access and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.get(
        "https://m-abdu11ah-cropapp.hf.space/weather-analyst",
        {
          params: {
            query,
            weather: JSON.stringify(weather.current),
          },
        }
      );
      if (res.data.response) {
        setResponse(res.data.response);
      } else {
        setError("No response received from the server.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Query with Location</Text>
        <Text style={styles.locationStatus}>{weather ? `Weather of ${weather.location.name}, is ${weather.current.condition.text} with ${weather.current.temp_c}°C.` : "" }</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter Query</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Enter your query"
            placeholderTextColor="#666"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
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
  locationStatus: {
    fontStyle: "italic",
    fontSize: 16,
    color: "#2980b9",
    textAlign: "center",
    marginBottom: 10,
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
    textAlign: "justify",
    fontSize: 14,
    color: "#333",
  },
});
