import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { VoiceRecognition } from "./VoiceRecognition";

export const ClassroomUI = ({ hidden, ...props }) => {
    const input = useRef();
    const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [currentLesson, setCurrentLesson] = useState("Introduction to Physics");
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const voiceRecognitionRef = useRef();

    const sendMessage = (text = null) => {
        const messageText = text || input.current.value;
        if (!loading && !message && messageText.trim()) {
            chat(messageText.trim());
            if (input.current) {
                input.current.value = "";
            }
        }
    };

    const handleVoiceTranscript = (transcript) => {
        if (transcript.trim()) {
            // Fill the input field for manual mode
            if (input.current) {
                input.current.value = transcript;
                input.current.focus();
            }
        }
    };

    const handleAutoSend = (transcript) => {
        if (transcript.trim()) {
            // Automatically send voice messages after silence
            sendMessage(transcript);
        }
    };

    const handleVoiceToggle = (isActive) => {
        setIsVoiceActive(isActive);
    };

    // Automatically pause voice recognition when AI is responding
    useEffect(() => {
        if (voiceRecognitionRef.current) {
            if (loading || message) {
                // AI is responding, pause listening to avoid feedback
                voiceRecognitionRef.current.pauseListening();
            } else if (!loading && !message && voiceRecognitionRef.current.isPaused) {
                // AI finished responding, automatically resume listening after a short delay
                const resumeTimeout = setTimeout(() => {
                    if (voiceRecognitionRef.current && voiceRecognitionRef.current.isPaused) {
                        voiceRecognitionRef.current.resumeListening();
                    }
                }, 1000); // 1 second delay to ensure AI audio finishes playing

                return () => clearTimeout(resumeTimeout);
            }
        }
    }, [loading, message]);

    if (hidden) {
        return null;
    }

    const participants = [
        { id: 1, name: "Dr. Sarah Wilson", role: "Instructor", avatar: "👩‍🏫", isOnline: true },
        { id: 2, name: "Alex Chen", role: "Student", avatar: "👨‍🎓", isOnline: true },
        { id: 3, name: "Maria Garcia", role: "Student", avatar: "👩‍🎓", isOnline: true },
        { id: 4, name: "James Kim", role: "Student", avatar: "👨‍🎓", isOnline: false },
    ];

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col bg-gray-900 text-white">
                {/* Top Navigation Bar */}
                <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                                </svg>
                            </div>
                            <span className="font-bold">EduVerse</span>
                        </Link>
                        <div className="text-gray-300">
                            <span className="text-sm">Current Lesson:</span>
                            <span className="ml-2 font-semibold text-white">{currentLesson}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Live Session</span>
                        </div>
                        <div className="text-sm text-gray-300">
                            {participants.filter(p => p.isOnline).length} participants
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col">
                        {/* 3D Classroom Viewport */}
                        <div className="flex-1 relative bg-black">
                            {props.children}

                            {/* Virtual Environment Controls */}
                            <div className="absolute top-4 right-4 flex flex-col space-y-2">
                                <button
                                    onClick={() => setCameraZoomed(!cameraZoomed)}
                                    className="p-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg backdrop-blur-sm transition-colors"
                                    title={cameraZoomed ? "Zoom Out" : "Zoom In"}
                                >
                                    {cameraZoomed ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                        </svg>
                                    )}
                                </button>

                                <button
                                    className="p-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg backdrop-blur-sm transition-colors"
                                    title="Change Environment"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setIsHandRaised(!isHandRaised)}
                                    className={`p-3 rounded-lg backdrop-blur-sm transition-colors ${isHandRaised
                                        ? 'bg-yellow-500/80 hover:bg-yellow-400/80'
                                        : 'bg-gray-800/80 hover:bg-gray-700/80'
                                        }`}
                                    title="Raise Hand"
                                >
                                    <span className="text-lg">✋</span>
                                </button>
                            </div>

                            {/* Lesson Progress Bar */}
                            <div className="absolute bottom-20 left-4 right-4">
                                <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Lesson Progress</span>
                                        <span className="text-sm text-gray-300">34% Complete</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Control Bar */}
                        <div className="bg-gray-800 border-t border-gray-700 p-4">
                            <div className="flex justify-between items-center">
                                {/* Left Controls */}
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className={`p-3 rounded-lg transition-colors ${isMuted
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-gray-600 hover:bg-gray-500'
                                            }`}
                                        title={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setIsVideoOn(!isVideoOn)}
                                        className={`p-3 rounded-lg transition-colors ${!isVideoOn
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-gray-600 hover:bg-gray-500'
                                            }`}
                                        title={isVideoOn ? "Turn Off Video" : "Turn On Video"}
                                    >
                                        {isVideoOn ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Voice Recognition Controls */}
                                    <div className="border-l border-gray-600 pl-4 ml-4">
                                        <VoiceRecognition
                                            ref={voiceRecognitionRef}
                                            onTranscript={handleVoiceTranscript}
                                            onAutoSend={handleAutoSend}
                                            isActive={isVoiceActive}
                                            onToggle={handleVoiceToggle}
                                        />
                                    </div>
                                </div>

                                {/* Center - AI Educator Interaction */}
                                <div className="flex items-center space-x-4 max-w-md flex-1 mx-4">
                                    <div className="relative flex-1">
                                        <input
                                            className={`w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${isVoiceActive
                                                ? 'focus:ring-red-500 border-2 border-red-500/50'
                                                : 'focus:ring-blue-500'
                                                }`}
                                            placeholder={isVoiceActive ? "🎤 Listening... or type here" : "Ask your AI educator..."}
                                            ref={input}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    sendMessage();
                                                }
                                            }}
                                        />
                                        {isVoiceActive && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        disabled={loading || message}
                                        onClick={() => sendMessage()}
                                        className={`px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors ${loading || message ? "cursor-not-allowed opacity-50" : ""
                                            }`}
                                    >
                                        {loading ? "..." : "Ask"}
                                    </button>
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setShowParticipants(!showParticipants)}
                                        className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                                        title="Participants"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => setShowChat(!showChat)}
                                        className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                                        title="Chat"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </button>

                                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors">
                                        Leave Class
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Panels */}
                    {(showParticipants || showChat) && (
                        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
                            {/* Panel Tabs */}
                            <div className="flex border-b border-gray-700">
                                <button
                                    onClick={() => setShowParticipants(true)}
                                    className={`flex-1 py-3 px-4 text-sm font-medium ${showParticipants ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Participants ({participants.filter(p => p.isOnline).length})
                                </button>
                                <button
                                    onClick={() => setShowParticipants(false)}
                                    className={`flex-1 py-3 px-4 text-sm font-medium ${!showParticipants ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    Chat
                                </button>
                            </div>

                            {/* Panel Content */}
                            <div className="flex-1 overflow-y-auto">
                                {showParticipants ? (
                                    <div className="p-4 space-y-3">
                                        {participants.map((participant) => (
                                            <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                                                <div className="relative">
                                                    <span className="text-2xl">{participant.avatar}</span>
                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${participant.isOnline ? 'bg-green-400' : 'bg-gray-500'
                                                        }`}></div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-white">{participant.name}</div>
                                                    <div className="text-xs text-gray-400">{participant.role}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 space-y-3">
                                        <div className="text-sm text-gray-400 text-center">
                                            Class Discussion
                                        </div>
                                        {/* Chat messages would go here */}
                                        <div className="space-y-2">
                                            <div className="bg-gray-700 rounded-lg p-3">
                                                <div className="text-xs text-gray-400 mb-1">Dr. Sarah Wilson</div>
                                                <div className="text-sm">Welcome to today's physics lesson! We'll be exploring the fundamentals of quantum mechanics.</div>
                                            </div>
                                            <div className="bg-blue-600 rounded-lg p-3 ml-8">
                                                <div className="text-xs text-blue-200 mb-1">You</div>
                                                <div className="text-sm">Thank you! I'm excited to learn about quantum physics.</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}; 