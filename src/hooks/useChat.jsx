import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (message) => {
    setLoading(true);

    // Enhanced educational context
    const educationalContext = {
      message,
      context: "virtual_classroom",
      role: "ai_educator",
      subject: "physics_quantum_mechanics",
      lesson_progress: 34,
      student_level: "intermediate"
    };

    const data = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(educationalContext),
    });
    const resp = (await data.json()).messages;
    setMessages((messages) => [...messages, ...resp]);
    setLoading(false);
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(false);
  const [currentLesson, setCurrentLesson] = useState("Introduction to Quantum Physics");
  const [lessonProgress, setLessonProgress] = useState(34);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
    // Update lesson progress when message is played
    setLessonProgress(prev => Math.min(prev + 5, 100));
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
        currentLesson,
        setCurrentLesson,
        lessonProgress,
        setLessonProgress,
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
