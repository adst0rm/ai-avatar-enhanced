import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { ClassroomPage } from "./components/ClassroomPage";
import { ChatProvider } from "./hooks/useChat";

function App() {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/classroom" element={<ClassroomPage />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
}

export default App;
