import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Send } from "lucide-react-native";

const FarmChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ChatBot",
      content: "Hi! You can consult me about Farm Management. How can I help you? 🚜",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const predefinedQuestions = ["How can I manage my farm efficiently?", "What are the best crops for this season?", "How to improve soil quality?"];

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // ... (handleSend and other functions remain the same) ...
  const handleSend = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: "User",
      content: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`https://m-abdu11ah-cropapp.hf.space/farm-management-chatbot?query='${encodeURIComponent(messageText)}'`, {
        method: "GET",
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        sender: "ChatBot",
        content: data.response || "Sorry, I could not process your request.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: "ChatBot",
        content: "Sorry, something went wrong. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === "User" ? styles.userMessage : styles.botMessage]}>
      <Text style={[styles.messageText, item.sender === "User" ? styles.userMessageText : styles.botMessageText]}>{item.content}</Text>
      <Text style={[styles.timeText, item.sender === "User" ? styles.userTimeText : styles.botTimeText]}>{item.time}</Text>
    </View>
  );

  const renderPredefinedQuestions = () => {
    if (messages.length > 1) return null;

    return (
      <View style={styles.suggestionsContainer}>
        {predefinedQuestions.map((question, index) => (
          <TouchableOpacity key={index} style={styles.suggestionButton} onPress={() => handleSend(question)}>
            <Text style={styles.suggestionText}>{question}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
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
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
          <TouchableOpacity style={styles.sendButton} onPress={() => handleSend(inputMessage)} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Send size={20} color="#fff" />}
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

export default FarmChatbot;
