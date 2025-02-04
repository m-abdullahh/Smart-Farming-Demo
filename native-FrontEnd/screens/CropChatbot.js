import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Send, Volume2, Mic, AudioLines } from "lucide-react-native";
import * as Speech from "expo-speech";
import { franc } from "franc-min";
import { Audio } from "expo-av";
import Toast from "react-native-toast-message";

const CropChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ChatBot",
      content:
        "Hi! You can talk to me about Crops🌾 and Weather☁️ of Pakistan, Will be Happy to help you!! 😄",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording,setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recording, setRecording] = useState(null);
  const recordingRef = useRef(null);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecording(recording);
    } catch (error) {
      setIsRecording(false);
      Toast.show({
        type: 'error',
        text1: `Failed to start recording: ${error.message}`,
        autoHide: true,
        visibilityTime: 4000,
        topOffset: 60,
      });
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setRecording(null);
        await sendAudioToServer(uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to stop recording: " + error.message);
    }
    setIsRecording(false);
  };

  const sendAudioToServer = async (uri) => {
    setIsTranscribing(true);
    try {
      const fileUri = uri;
      const fileType = "audio/wav";

      const formData = new FormData();
      formData.append("audio", {
        uri: fileUri,
        name: "recording.wav",
        type: fileType,
      });

      const response = await fetch("http://192.168.0.5:7860/api/transcribe", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = await response.json();
      if (result.transcription) {
        const cleanedTranscription = result.transcription.slice(3);
        setInputMessage(cleanedTranscription);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to transcribe audio.',
          text2: result.error || "",
          autoHide: true,
          visibilityTime: 2000,
          topOffset: 30,
        });
      }
    } catch (error) {
      Toast.show({
          type: 'error',
          text1: 'Failed to Send an audio.',
          text2: error.message || "",
          autoHide: true,
          visibilityTime: 2000,
          topOffset: 30,
        });
    }
    setIsTranscribing(false);
  };

  const flatListRef = useRef(null);

  const predefinedQuestions = ["Punjab's Usual Weather", "Which Crop is most efficient in Punjab", "Punjab's Top 5 Crops"]

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      console.log("Stopping speech...");
      Speech.stop(); // Stop speech when the component unmounts
      setRecording(null);
      setIsRecording(false);
    };
  }, []); // Empty dependency array

  // ... (handleSend and other functions remain the same) ...
  const handleSend = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: "User",
      content: messageText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://m-abdu11ah-cropapp.hf.space/query?query='${encodeURIComponent(
          messageText
        )}'`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        sender: "ChatBot",
        content: data.response || "Sorry, I could not process your request.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: "ChatBot",
        content: "Sorry, something went wrong. Please try again.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "User" ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "User"
            ? styles.userMessageText
            : styles.botMessageText,
        ]}
      >
        {item.content}
      </Text>
      <Text
        style={[
          styles.timeText,
          item.sender === "User" ? styles.userTimeText : styles.botTimeText,
        ]}
      >
        {item.time}
      </Text>
    </View>
  );

  const renderPredefinedQuestions = () => {
    if (messages.length > 1) return null;

    return (
      <View style={styles.suggestionsContainer}>
        {predefinedQuestions.map((question, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionButton}
            onPress={() => handleSend(question)}
          >
            <Text style={styles.suggestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      const message = "Stopping";
      Speech.speak(message, {
        onDone: () => setIsSpeaking(false),
        // onStart: () => setIsSpeaking(true),
      });
    } else {
      Speech.stop();
      const message = messages
        .slice()
        .reverse()
        .find((msg) => msg.sender === "ChatBot");

      const langCode = franc(message.content);
      const langMap = {
        urd: "ur-PK",
        eng: "en-US",
        hin: "hi-IN",
      };

      const detectedLang = langMap[langCode] || "en-US";
      Speech.speak(message.content, {
        onDone: () => setIsSpeaking(false),
        onStart: () => setIsSpeaking(true),
        language: detectedLang,
      });
      setIsSpeaking(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.innerContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          ListFooterComponent={renderPredefinedQuestions}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        />
      </View>

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type your message..."
            placeholderTextColor="#666"
            multiline
            maxHeight={100}
          />
          <TouchableOpacity style={styles.speechButton} onPress={toggleSpeech} disabled={isRecording || isTranscribing} >
            {isSpeaking ? <ActivityIndicator color="#fff" /> : <Volume2 size={24} color="#fff" />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.MicButton}
            onPress={recording ? stopRecording : startRecording}
          >
            {isTranscribing &&  <ActivityIndicator color="#fff" />}
            {isRecording && !isTranscribing && <AudioLines size={24} color="#fff" />}
            {!isRecording && !isTranscribing && <Mic size={24} color="#fff" />}

          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => handleSend(inputMessage)}
            disabled={isLoading || isRecording || isTranscribing}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  innerContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 90 : 70,
  },
  inputWrapper: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2ecc71",
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#fff",
  },
  botMessageText: {
    color: "#333",
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimeText: {
    color: "rgba(255,255,255,0.7)",
  },
  botTimeText: {
    color: "rgba(0,0,0,0.5)",
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    color: "#333",
    maxHeight: 100,
  },
  speechButton: {
    backgroundColor: "#3498db",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  MicButton: {
    backgroundColor: "#D6002D",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  MicButtonRecording: {
    backgroundColor: "#FFFF00",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#2ecc71",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionsContainer: {
    padding: 16,
  },
  suggestionButton: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    color: "#2e7d32",
    fontSize: 14,
  },
});

export default CropChatbot;
