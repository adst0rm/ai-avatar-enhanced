import { useState, useEffect, useRef, useCallback } from 'react';

export const useVoiceRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [volume, setVolume] = useState(0);
    const [lastSpeechTime, setLastSpeechTime] = useState(null);
    const [autoSendEnabled, setAutoSendEnabled] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    const recognitionRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const onAutoSendRef = useRef(null);

    // Check if browser supports speech recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition && !!navigator.mediaDevices?.getUserMedia);
    }, []);

    // Initialize audio analysis for volume visualization
    const initializeAudioAnalysis = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            setHasPermission(true);

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            microphone.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const updateVolume = () => {
                if (analyserRef.current && isListening) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / bufferLength;
                    setVolume(average);
                }
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };

            updateVolume();
        } catch (error) {
            console.error('Microphone access denied:', error);
            setHasPermission(false);
        }
    }, [isListening]);

    // Initialize speech recognition
    const initializeSpeechRecognition = useCallback(() => {
        if (!isSupported) return null;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update transcripts
            setTranscript(prev => prev + finalTranscript);
            setInterimTranscript(interimTranscript);

            // Track speech activity for silence detection
            if (finalTranscript.trim() || interimTranscript.trim()) {
                setLastSpeechTime(Date.now());

                // Clear any existing silence timeout
                if (silenceTimeoutRef.current) {
                    clearTimeout(silenceTimeoutRef.current);
                    silenceTimeoutRef.current = null;
                }

                // Set up auto-send after 2 seconds of silence (only for final transcript)
                if (finalTranscript.trim() && autoSendEnabled && onAutoSendRef.current) {
                    silenceTimeoutRef.current = setTimeout(() => {
                        const currentTranscript = finalTranscript.trim();
                        if (currentTranscript) {
                            onAutoSendRef.current(currentTranscript);
                            setTranscript(''); // Clear transcript after sending
                            // Automatically stop listening after sending to prevent picking up AI response
                            if (recognitionRef.current && isListening) {
                                recognitionRef.current.stop();
                            }
                        }
                    }, 2000); // 2 seconds of silence
                }
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
        };

        return recognition;
    }, [isSupported]);

    const startListening = useCallback(async () => {
        if (!isSupported) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (!hasPermission) {
            await initializeAudioAnalysis();
        }

        if (!recognitionRef.current) {
            recognitionRef.current = initializeSpeechRecognition();
        }

        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setInterimTranscript('');
            recognitionRef.current.start();
        }
    }, [isSupported, hasPermission, isListening, initializeAudioAnalysis, initializeSpeechRecognition]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Clear silence timeout
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }

        setVolume(0);
        setLastSpeechTime(null);
    }, [isListening]);

    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        // Clear silence timeout when manually clearing
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
    }, []);

    const setAutoSendCallback = useCallback((callback) => {
        onAutoSendRef.current = callback;
    }, []);

    const toggleAutoSend = useCallback(() => {
        setAutoSendEnabled(prev => !prev);
        // Clear timeout if disabling auto-send
        if (!autoSendEnabled && silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
    }, [autoSendEnabled]);

    const pauseListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsPaused(true);
        }
    }, [isListening]);

    const resumeListening = useCallback(() => {
        if (isPaused && !isListening) {
            setIsPaused(false);
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
        }
    }, [isPaused, isListening]);

    const forceStop = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
        setIsPaused(false);
        setTranscript('');
        setInterimTranscript('');
        if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
        }
    }, [isListening]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        hasPermission,
        volume,
        lastSpeechTime,
        autoSendEnabled,
        isPaused,
        startListening,
        stopListening,
        clearTranscript,
        setAutoSendCallback,
        toggleAutoSend,
        pauseListening,
        resumeListening,
        forceStop,
    };
}; 