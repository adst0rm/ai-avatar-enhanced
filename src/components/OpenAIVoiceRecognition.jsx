import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useOpenAIVoiceRecognition } from '../hooks/useOpenAIVoiceRecognition';

export const OpenAIVoiceRecognition = forwardRef(({
    onTranscript,
    onAutoSend,
    isActive,
    onToggle,
    language = 'kk' // Default to Kazakh
}, ref) => {
    const {
        isListening,
        transcript,
        isProcessing,
        isSupported,
        hasPermission,
        volume,
        lastSpeechTime,
        autoSendEnabled,
        isPaused,
        error,
        startListening,
        stopListening,
        clearTranscript,
        setAutoSendCallback,
        toggleAutoSend,
        pauseListening,
        resumeListening,
        forceStop,
    } = useOpenAIVoiceRecognition(language);

    // Expose control methods through ref
    useImperativeHandle(ref, () => ({
        pauseListening,
        resumeListening,
        forceStop,
        isListening,
        isPaused,
    }), [pauseListening, resumeListening, forceStop, isListening, isPaused]);

    // Set up auto-send callback
    useEffect(() => {
        if (onAutoSend) {
            setAutoSendCallback(onAutoSend);
        }
    }, [onAutoSend, setAutoSendCallback]);

    // Send transcript to parent component when speech is detected (manual mode)
    useEffect(() => {
        if (transcript.trim() && onTranscript && !autoSendEnabled) {
            onTranscript(transcript.trim());
            clearTranscript();
        }
    }, [transcript, onTranscript, clearTranscript, autoSendEnabled]);

    const handleToggle = async () => {
        if (isListening) {
            stopListening();
            onToggle?.(false);
        } else {
            await startListening();
            onToggle?.(true);
        }
    };

    // Volume-based animation intensity
    const volumeIntensity = Math.min(volume / 50, 1);
    const pulseScale = 1 + volumeIntensity * 0.3;

    if (!isSupported) {
        return (
            <div className="flex items-center space-x-2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
                </svg>
                <span className="text-sm">Voice not supported</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-3">
            {/* Microphone Button with Visual Feedback */}
            <div className="relative">
                <button
                    onClick={handleToggle}
                    disabled={isProcessing}
                    className={`relative p-3 rounded-full transition-all duration-300 disabled:opacity-50 ${isListening
                            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
                            : hasPermission
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-gray-500 hover:bg-gray-600'
                        }`}
                    style={{
                        transform: isListening ? `scale(${pulseScale})` : 'scale(1)',
                    }}
                    title={isListening ? 'Stop Voice Recognition' : 'Start Voice Recognition'}
                >
                    {/* Microphone Icon */}
                    <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                    </svg>

                    {/* Recording Indicator */}
                    {isListening && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    )}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-spin"></div>
                    )}
                </button>

                {/* Sound Wave Animation */}
                {isListening && volumeIntensity > 0.1 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                            className="absolute w-16 h-16 border-2 border-red-300 rounded-full opacity-60 animate-ping"
                            style={{
                                animationDuration: `${Math.max(0.8 - volumeIntensity * 0.3, 0.3)}s`,
                            }}
                        ></div>
                        <div
                            className="absolute w-20 h-20 border border-red-200 rounded-full opacity-40 animate-ping"
                            style={{
                                animationDuration: `${Math.max(1.2 - volumeIntensity * 0.4, 0.5)}s`,
                                animationDelay: '0.2s',
                            }}
                        ></div>
                    </div>
                )}
            </div>

            {/* Voice Status Indicator */}
            <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                    {isListening && (
                        <>
                            <div className="flex space-x-1">
                                <div
                                    className="w-1 bg-red-400 rounded-full transition-all duration-150"
                                    style={{ height: `${8 + volumeIntensity * 12}px` }}
                                ></div>
                                <div
                                    className="w-1 bg-red-400 rounded-full transition-all duration-150"
                                    style={{ height: `${6 + volumeIntensity * 16}px` }}
                                ></div>
                                <div
                                    className="w-1 bg-red-400 rounded-full transition-all duration-150"
                                    style={{ height: `${10 + volumeIntensity * 8}px` }}
                                ></div>
                                <div
                                    className="w-1 bg-red-400 rounded-full transition-all duration-150"
                                    style={{ height: `${4 + volumeIntensity * 14}px` }}
                                ></div>
                            </div>
                            <span className="text-xs text-red-400 font-medium">
                                {language === 'kk' ? 'Тыңдап жатыр...' : 'Listening...'}
                            </span>
                        </>
                    )}
                    {isProcessing && (
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-blue-400">
                                {language === 'kk' ? 'Өңдеу...' : 'Processing...'}
                            </span>
                        </div>
                    )}
                    {!isListening && !isProcessing && hasPermission && !isPaused && (
                        <span className="text-xs text-gray-400">
                            {language === 'kk' ? 'Дауыс дайын' : 'Voice ready'}
                        </span>
                    )}
                    {isPaused && (
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-xs text-orange-400">
                                {language === 'kk' ? 'Үзілген (AI жауап беруде)' : 'Paused (AI responding)'}
                            </span>
                        </div>
                    )}
                    {!hasPermission && (
                        <span className="text-xs text-yellow-400">
                            {language === 'kk' ? 'Микрофон рұқсаты қажет' : 'Mic permission needed'}
                        </span>
                    )}
                </div>

                {/* Live Transcript Preview */}
                {transcript && (
                    <div className="mt-1 max-w-48">
                        <div className="text-xs text-gray-300 bg-gray-800/80 rounded px-2 py-1 backdrop-blur-sm">
                            <span className="text-blue-300">
                                {transcript}
                            </span>
                            {isListening && <span className="text-blue-400 animate-pulse">|</span>}
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-1 max-w-48">
                        <div className="text-xs text-red-300 bg-red-900/20 rounded px-2 py-1 backdrop-blur-sm">
                            {error}
                        </div>
                    </div>
                )}

                {/* Auto-send status */}
                {autoSendEnabled && !isProcessing && (
                    <div className="mt-1 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">
                            {language === 'kk' ? 'Автоматты жіберу қосулы' : 'Auto-send enabled'}
                        </span>
                    </div>
                )}

                {/* Resume button when paused */}
                {isPaused && (
                    <div className="mt-1">
                        <button
                            onClick={resumeListening}
                            className="px-2 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                        >
                            {language === 'kk' ? 'Жалғастыру' : 'Resume'}
                        </button>
                    </div>
                )}

                {/* Language indicator */}
                <div className="mt-1">
                    <span className="text-xs text-gray-500">
                        {language === 'kk' ? '🇰🇿 Қазақша' : '🇺🇸 English'}
                    </span>
                </div>
            </div>
        </div>
    );
});

OpenAIVoiceRecognition.displayName = 'OpenAIVoiceRecognition'; 