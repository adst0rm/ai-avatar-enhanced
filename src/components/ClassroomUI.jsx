import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useChat } from "../hooks/useChat";
import { useCamera } from "../hooks/useCamera";
import { VoiceRecognition } from "./VoiceRecognition";
import { OpenAIVoiceRecognition } from "./OpenAIVoiceRecognition";

export const ClassroomUI = ({ hidden, userInfo, ...props }) => {
    const input = useRef();
    const { chat, loading, cameraZoomed, setCameraZoomed, message, setLanguage } = useChat();
    const {
        isVideoOn,
        hasPermission,
        error: cameraError,
        isSupported: isCameraSupported,
        devices: cameraDevices,
        isLoading: isCameraLoading,
        videoRef,
        toggleCamera,
        switchCamera,
        clearError
    } = useCamera();

    const [isMuted, setIsMuted] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [showCameraSettings, setShowCameraSettings] = useState(false);
    const [useOpenAI, setUseOpenAI] = useState(true); // Toggle between OpenAI and browser STT
    const voiceRecognitionRef = useRef();

    // Get user's selected language, default to Kazakh
    const userLanguage = userInfo?.language || 'kk';

    // Set the language in chat context when component loads
    useEffect(() => {
        setLanguage(userLanguage);
    }, [userLanguage, setLanguage]);

    const sendMessage = (text = null) => {
        const messageText = text || input.current.value;
        if (!loading && !message && messageText.trim()) {
            chat(messageText.trim(), userLanguage); // Pass language to chat
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
            // Automatically send voice messages after silence with language
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

    // Close camera settings when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCameraSettings && !event.target.closest('.camera-settings-container')) {
                setShowCameraSettings(false);
            }
        };

        if (showCameraSettings) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showCameraSettings]);

    if (hidden) {
        return null;
    }

    const participants = [
        { id: 1, name: userInfo?.name || "Anonymous", role: "Host", avatar: "👨‍🎓", isOnline: true },
        { id: 2, name: "AI Teacher", role: "Teacher", avatar: "🤖", isOnline: true },
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
                            <span className="font-bold">ISSAI Avatar</span>
                        </Link>
                        <div className="text-gray-300">
                            <span className="text-sm">{userInfo?.class || "General"} Class</span>
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

                            {/* User Camera Display */}
                            <div className="absolute top-4 left-4 z-20">
                                <div className="relative camera-settings-container">
                                    {isCameraLoading ? (
                                        <div className="w-48 h-36 bg-gray-800 rounded-lg border-2 border-blue-500 shadow-lg flex items-center justify-center">
                                            <div className="text-center text-gray-300">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                                                <div className="text-xs">Starting Camera...</div>
                                            </div>
                                        </div>
                                    ) : isVideoOn ? (
                                        <div className="w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-green-500 shadow-lg">
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="w-full h-full object-cover scale-x-[-1]" // Mirror effect
                                                onLoadedMetadata={() => {
                                                    // Ensure video plays when metadata is loaded
                                                    if (videoRef.current) {
                                                        videoRef.current.play().catch(console.error);
                                                    }
                                                }}
                                                onError={(e) => {
                                                    console.error('[Camera] Video element error:', e);
                                                }}
                                            />
                                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                {userInfo?.name || "You"}
                                            </div>
                                            <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Camera Active"></div>
                                            {cameraDevices.length > 1 && !isCameraLoading && (
                                                <button
                                                    onClick={() => setShowCameraSettings(!showCameraSettings)}
                                                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 rounded transition-colors"
                                                    title="Camera Settings"
                                                >
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-48 h-36 bg-gray-800 rounded-lg border-2 border-gray-600 shadow-lg flex items-center justify-center">
                                            <div className="text-center text-gray-400">
                                                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
                                                </svg>
                                                <div className="text-xs">Camera Off</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Camera Settings Dropdown */}
                                    {showCameraSettings && cameraDevices.length > 1 && (
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-30">
                                            <div className="p-3 border-b border-gray-600">
                                                <h3 className="text-sm font-medium text-white">Camera Settings</h3>
                                                {isCameraLoading && (
                                                    <div className="text-xs text-blue-400 mt-1">Switching camera...</div>
                                                )}
                                            </div>
                                            <div className="p-3 space-y-2">
                                                {cameraDevices.map((device) => (
                                                    <button
                                                        key={device.deviceId}
                                                        onClick={() => {
                                                            if (!isCameraLoading) {
                                                                switchCamera(device.deviceId);
                                                                setShowCameraSettings(false);
                                                            }
                                                        }}
                                                        disabled={isCameraLoading}
                                                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${isCameraLoading
                                                            ? 'text-gray-500 cursor-not-allowed'
                                                            : 'text-white hover:bg-gray-700'
                                                            }`}
                                                    >
                                                        {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Camera Error Display */}
                                    {cameraError && (
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-red-800 border border-red-600 rounded-lg shadow-lg z-30">
                                            <div className="p-3">
                                                <div className="flex items-start space-x-2">
                                                    <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-red-200">Camera Error</div>
                                                        <div className="text-xs text-red-300 mt-1">{cameraError}</div>
                                                        <button
                                                            onClick={clearError}
                                                            className="text-xs text-red-200 hover:text-white mt-2 underline"
                                                        >
                                                            Dismiss
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

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
                                        onClick={toggleCamera}
                                        className={`p-3 rounded-lg transition-colors ${isCameraLoading
                                            ? 'bg-blue-500 cursor-wait'
                                            : !isVideoOn
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-gray-600 hover:bg-gray-500'
                                            }`}
                                        title={isCameraLoading ? "Starting Camera..." : isVideoOn ? "Turn Off Video" : "Turn On Video"}
                                        disabled={!isCameraSupported || isCameraLoading}
                                    >
                                        {isCameraLoading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : isVideoOn ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Voice Recognition Component */}
                                    <div className="flex items-center">
                                        {useOpenAI ? (
                                            <OpenAIVoiceRecognition
                                                ref={voiceRecognitionRef}
                                                onTranscript={handleVoiceTranscript}
                                                onAutoSend={handleAutoSend}
                                                onToggle={handleVoiceToggle}
                                                language={userLanguage}
                                            />
                                        ) : (
                                            <VoiceRecognition
                                                ref={voiceRecognitionRef}
                                                onTranscript={handleVoiceTranscript}
                                                onAutoSend={handleAutoSend}
                                                onToggle={handleVoiceToggle}
                                                language={userLanguage}
                                            />
                                        )}

                                        {/* STT Method Toggle */}
                                        <button
                                            onClick={() => setUseOpenAI(!useOpenAI)}
                                            className="ml-2 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                                            title={useOpenAI ? 'Switch to Browser STT' : 'Switch to OpenAI STT'}
                                        >
                                            {useOpenAI ? 'OpenAI' : 'Browser'}
                                        </button>
                                    </div>
                                </div>

                                {/* Center - Chat Input */}
                                <div className="flex items-center space-x-4 max-w-md flex-1 mx-4">
                                    <div className="relative flex-1">
                                        <input
                                            className={`w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${isVoiceActive
                                                ? 'focus:ring-red-500 border-2 border-red-500/50'
                                                : 'focus:ring-blue-500'
                                                }`}
                                            placeholder={isVoiceActive ? "🎤 Listening... or type here" : "Type your message..."}
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
                                        {loading ? "..." : "Send"}
                                    </button>
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center space-x-4">
                                    {/* Test Message Button */}
                                    <button
                                        onClick={() => {
                                            console.log('Test button clicked');
                                            chat("Test message - can you hear me?", userLanguage);
                                        }}
                                        className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition-colors"
                                        title="Test Avatar Response"
                                    >
                                        Test AI
                                    </button>

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
                                        Leave Meeting
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
                                            Meeting Chat
                                        </div>
                                        {/* Chat messages would go here */}
                                        <div className="space-y-2">
                                            <div className="bg-gray-700 rounded-lg p-3">
                                                <div className="text-xs text-gray-400 mb-1">Sarah Wilson</div>
                                                <div className="text-sm">Welcome to the meeting! Let's get started with today's discussion.</div>
                                            </div>
                                            <div className="bg-blue-600 rounded-lg p-3 ml-8">
                                                <div className="text-xs text-blue-200 mb-1">You</div>
                                                <div className="text-sm">Thank you! Looking forward to the discussion.</div>
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