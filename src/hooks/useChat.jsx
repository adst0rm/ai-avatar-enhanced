import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('kk'); // Default to Kazakh

  const chat = async (message, userLanguage = language) => {
    setLoading(true);
    setError(null);
    console.log('Chat called with message:', message, 'language:', userLanguage);

    try {
      // General chat context including language
      const chatContext = {
        message,
        context: "virtual_meeting",
        role: "assistant",
        language: userLanguage, // Include language for proper response
      };

      console.log('Attempting to fetch from:', `${backendUrl}/chat`);
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chatContext),
      });

      if (!data.ok) {
        throw new Error(`HTTP error! status: ${data.status}`);
      }

      const resp = (await data.json()).messages;
      console.log('Backend response:', resp);
      setMessages((messages) => [...messages, ...resp]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);

      // Enhanced fallback response when backend is not available - in the user's language
      const fallbackResponse = {
        text: userLanguage === 'kk'
          ? `Кешіріңіз, дауыстық жүйе қазір жұмыс істемейді. Сіздің сұрағыңыз: "${message}"\n\nМен сізге жауап бергім келеді, бірақ серверге қосыла алмай отырмын.`
          : `Sorry, the voice system is currently offline. Your question was: "${message}"\n\nI would like to respond to you, but I cannot connect to the server.`,
        audio: null, // No audio for fallback
        animation: "Talking_1",
        facialExpression: "default",
        lipsync: null
      };

      console.log('Setting fallback response:', fallbackResponse);
      setMessages((messages) => [...messages, fallbackResponse]);
    } finally {
      setLoading(false);
    }
  };

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(false);

  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        language,
        setLanguage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
