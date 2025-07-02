import { useState, useRef, useCallback, useEffect } from 'react';

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useOpenAIVoiceRecognition = (language = 'kk') => { // 'kk' for Kazakh, 'en' for English
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [volume, setVolume] = useState(0);
    const [lastSpeechTime, setLastSpeechTime] = useState(null);
    const [autoSendEnabled, setAutoSendEnabled] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const onAutoSendRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimeoutRef = useRef(null);

    // Check if browser supports MediaRecorder
    useEffect(() => {
        setIsSupported(!!window.MediaRecorder && !!navigator.mediaDevices?.getUserMedia);
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
            setError('Microphone access denied');
        }
    }, [isListening]);

    // Transcribe audio using OpenAI Whisper
    const transcribeAudio = async (audioBlob) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');
            formData.append('language', language); // Kazakh or English

            const response = await fetch(`${backendUrl}/whisper/transcribe`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Transcription failed');
            }

            const data = await response.json();
            const transcribedText = data.text.trim();

            if (transcribedText) {
                setTranscript(transcribedText);
                setLastSpeechTime(Date.now());

                // Auto-send if enabled
                if (autoSendEnabled && onAutoSendRef.current) {
                    setTimeout(() => {
                        onAutoSendRef.current(transcribedText);
                        setTranscript('');
                    }, 500); // Small delay to show the transcript
                }
            }

            return transcribedText;
        } catch (err) {
            setError('Transcription failed: ' + err.message);
            console.error('Transcription error:', err);
            return '';
        } finally {
            setIsProcessing(false);
        }
    };

    const startListening = useCallback(async () => {
        if (!isSupported) {
            setError('Voice recording is not supported in this browser.');
            return;
        }

        if (!hasPermission) {
            await initializeAudioAnalysis();
        }

        if (!mediaStreamRef.current) {
            setError('Please allow microphone access.');
            return;
        }

        try {
            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    await transcribeAudio(audioBlob);
                }
                setIsListening(false);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsListening(true);
            setError(null);

            // Auto-stop recording after 30 seconds to prevent long recordings
            recordingTimeoutRef.current = setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 30000);

        } catch (err) {
            setError('Failed to start recording: ' + err.message);
            console.error('Recording error:', err);
        }
    }, [isSupported, hasPermission, initializeAudioAnalysis, transcribeAudio, autoSendEnabled]);

    const stopListening = useCallback(() => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
        }

        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        setVolume(0);
        setLastSpeechTime(null);
    }, [isListening]);

    const clearTranscript = useCallback(() => {
        setTranscript('');
        setError(null);
    }, []);

    const setAutoSendCallback = useCallback((callback) => {
        onAutoSendRef.current = callback;
    }, []);

    const toggleAutoSend = useCallback(() => {
        setAutoSendEnabled(prev => !prev);
    }, []);

    const pauseListening = useCallback(() => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsPaused(true);
        }
    }, [isListening]);

    const resumeListening = useCallback(() => {
        if (isPaused && !isListening) {
            setIsPaused(false);
            startListening();
        }
    }, [isPaused, isListening, startListening]);

    const forceStop = useCallback(() => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
        }
        setIsPaused(false);
        setTranscript('');
        setError(null);
        if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
        }
    }, [isListening]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (recordingTimeoutRef.current) {
                clearTimeout(recordingTimeoutRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return {
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
    };
}; 