import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import DiseaseAnalyzeScreen from "./screens/DiseaseAnalyzeScreen";
import CropChatbot from "./screens/CropChatbot";
import { StatusBar } from "react-native";
import WeatherAssistScreen from "./screens/WeatherAssistScreen";
import FarmChatbot from "./screens/FarmChatbot";
import Toast from "react-native-toast-message";

const Stack = createNativeStackNavigator();

export default function App() {


  return (
    <>
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={true}
      />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
              title: "", // Change the header name here
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: "#2ecc71", // Set background color to #2ecc71
              },
              headerTintColor: "#ffffff", // Center the title
            }}
          />
          <Stack.Screen
            name="Page1"
            component={DiseaseAnalyzeScreen}
            options={{
              title: "Disease Analyzer", // Change the header name here
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: "#2ecc71", // Set background color to #2ecc71
              },
              headerTintColor: "#ffffff",
              // Center the title
            }}
          />
          <Stack.Screen
            name="Page2"
            component={CropChatbot}
            options={{
              title: "Crop Help Chatbot", // Change the header name here
              headerTitleAlign: "center", // Center the title
              headerStyle: {
                backgroundColor: "#2ecc71", // Set background color to #2ecc71
              },
              headerTintColor: "#ffffff", // Set text color to white
            }}
          />
          <Stack.Screen
            name="Page3"
            options={{
              title: "Farm Management Chatbot", // Change the header name here
              headerTitleAlign: "center", // Center the title
              headerStyle: {
                backgroundColor: "#2ecc71", // Set background color to #2ecc71
              },
              headerTintColor: "#ffffff", // Set text color to white
            }}
            component={FarmChatbot}
          />
          <Stack.Screen
            name="Page4"
            component={WeatherAssistScreen}
            options={{
              title: "Weather Assist", // Change the header name here
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: "#2ecc71", // Set background color to #2ecc71
              },
              headerTintColor: "#ffffff",
              // Center the title
            }}
          />
                   
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}
