import { useState, useEffect, useRef, useCallback } from 'react';

export const useCamera = () => {
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const isStartingRef = useRef(false);
    const retryTimeoutRef = useRef(null);
    const streamCheckIntervalRef = useRef(null);

    // Debug logging
    const log = useCallback((message, data = null) => {
        console.log(`[Camera] ${message}`, data || '');
    }, []);

    // Check if camera is supported
    useEffect(() => {
        const checkSupport = () => {
            const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            setIsSupported(isSupported);

            if (!isSupported) {
                setError('Camera is not supported in this browser');
                log('Camera not supported');
            } else {
                log('Camera supported');
            }
        };

        checkSupport();
    }, [log]);

    // Get available camera devices (fixed dependency issue)
    const getDevices = useCallback(async () => {
        try {
            if (!isSupported) return;

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);

            log('Devices found', videoDevices.length);

            // Set default device if none selected and devices are available
            if (videoDevices.length > 0 && !selectedDeviceId) {
                setSelectedDeviceId(videoDevices[0].deviceId);
                log('Default device set', videoDevices[0].label || videoDevices[0].deviceId);
            }
        } catch (err) {
            console.error('Error getting camera devices:', err);
            setError('Failed to get camera devices');
            log('Error getting devices', err.message);
        }
    }, [isSupported, log]); // Removed selectedDeviceId dependency to fix race condition

    // Monitor stream health
    const startStreamMonitoring = useCallback(() => {
        if (streamCheckIntervalRef.current) {
            clearInterval(streamCheckIntervalRef.current);
        }

        streamCheckIntervalRef.current = setInterval(() => {
            if (isVideoOn && streamRef.current) {
                const tracks = streamRef.current.getVideoTracks();
                if (tracks.length === 0 || tracks[0].readyState === 'ended') {
                    log('Stream ended unexpectedly, attempting recovery');
                    setIsVideoOn(false);
                    // Auto-retry after a short delay
                    retryTimeoutRef.current = setTimeout(() => {
                        if (!isStartingRef.current) {
                            log('Auto-retrying camera start');
                            startCamera();
                        }
                    }, 1000);
                }
            }
        }, 2000); // Check every 2 seconds
    }, [isVideoOn]);

    const stopStreamMonitoring = useCallback(() => {
        if (streamCheckIntervalRef.current) {
            clearInterval(streamCheckIntervalRef.current);
            streamCheckIntervalRef.current = null;
        }
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    // Enhanced video element attachment
    const attachVideoStream = useCallback((stream) => {
        if (videoRef.current && stream) {
            try {
                videoRef.current.srcObject = stream;
                log('Video stream attached successfully');

                // Ensure video plays
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        log('Video play failed', err.message);
                    });
                }
            } catch (err) {
                log('Error attaching video stream', err.message);
            }
        }
    }, [log]);

    // Request camera permission and start video
    const startCamera = useCallback(async () => {
        try {
            if (!isSupported) {
                setError('Camera is not supported in this browser');
                return false;
            }

            if (isStartingRef.current) {
                log('Camera start already in progress');
                return false;
            }

            isStartingRef.current = true;
            setIsLoading(true);
            setError(null);
            log('Starting camera');

            const constraints = {
                video: {
                    deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false // Only video for now, audio handled by voice recognition
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            streamRef.current = stream;
            setHasPermission(true);
            setIsVideoOn(true);

            // Attach stream to video element with retry mechanism
            attachVideoStream(stream);

            // Start monitoring stream health
            startStreamMonitoring();

            log('Camera started successfully');
            return true;
        } catch (err) {
            console.error('Camera access error:', err);
            setHasPermission(false);
            setIsVideoOn(false);

            let errorMessage = 'Failed to access camera. Please try again.';
            switch (err.name) {
                case 'NotAllowedError':
                    errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
                    break;
                case 'NotFoundError':
                    errorMessage = 'No camera found. Please connect a camera device.';
                    break;
                case 'NotReadableError':
                    errorMessage = 'Camera is already in use by another application.';
                    break;
                case 'OverconstrainedError':
                    errorMessage = 'Camera constraints could not be satisfied. Trying with default settings...';
                    // Try again with default constraints
                    setTimeout(() => {
                        if (selectedDeviceId) {
                            setSelectedDeviceId('');
                            log('Retrying with default constraints');
                        }
                    }, 1000);
                    break;
                default:
                    errorMessage = `Camera error: ${err.message}`;
            }

            setError(errorMessage);
            log('Camera start failed', err.message);
            return false;
        } finally {
            isStartingRef.current = false;
            setIsLoading(false);
        }
    }, [isSupported, selectedDeviceId, attachVideoStream, startStreamMonitoring, log]);

    // Stop camera stream
    const stopCamera = useCallback(() => {
        log('Stopping camera');

        stopStreamMonitoring();

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsVideoOn(false);
        isStartingRef.current = false;
        log('Camera stopped');
    }, [stopStreamMonitoring, log]);

    // Toggle camera on/off
    const toggleCamera = useCallback(async () => {
        if (isLoading) {
            log('Toggle ignored - camera is loading');
            return;
        }

        if (isVideoOn) {
            stopCamera();
        } else {
            await startCamera();
        }
    }, [isVideoOn, isLoading, stopCamera, startCamera, log]);

    // Switch camera device
    const switchCamera = useCallback(async (deviceId) => {
        if (isLoading) {
            log('Switch camera ignored - camera is loading');
            return;
        }

        const wasOn = isVideoOn;
        log('Switching camera', { deviceId, wasOn });

        if (wasOn) {
            stopCamera();
        }

        setSelectedDeviceId(deviceId);

        if (wasOn) {
            // Small delay to ensure previous stream is fully stopped
            setTimeout(() => {
                startCamera();
            }, 200); // Increased delay for better stability
        }
    }, [isVideoOn, isLoading, stopCamera, startCamera, log]);

    // Sync video element when stream changes
    useEffect(() => {
        if (streamRef.current && isVideoOn) {
            attachVideoStream(streamRef.current);
        }
    }, [isVideoOn, attachVideoStream]);

    // Handle device changes
    useEffect(() => {
        if (!isSupported) return;

        const handleDeviceChange = () => {
            log('Device change detected');
            getDevices();
        };

        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        };
    }, [isSupported, getDevices, log]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            log('Cleaning up camera hook');
            stopCamera();
            stopStreamMonitoring();
        };
    }, [stopCamera, stopStreamMonitoring, log]);

    // Get devices when component mounts
    useEffect(() => {
        if (isSupported) {
            getDevices();
        }
    }, [isSupported, getDevices]);

    // Re-attach video when selectedDeviceId changes and video is on
    useEffect(() => {
        if (selectedDeviceId && devices.length === 0) {
            getDevices(); // Refresh devices if we have a selected device but no devices list
        }
    }, [selectedDeviceId, devices.length, getDevices]);

    return {
        // State
        isVideoOn,
        hasPermission,
        error,
        isSupported,
        devices,
        selectedDeviceId,
        isLoading,

        // Refs
        videoRef,
        stream: streamRef.current,

        // Actions
        startCamera,
        stopCamera,
        toggleCamera,
        switchCamera,
        getDevices,

        // Utilities
        clearError: () => setError(null)
    };
}; 