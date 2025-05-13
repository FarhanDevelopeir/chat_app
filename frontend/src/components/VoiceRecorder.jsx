'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, X, Send, Pause, Play, Trash } from 'lucide-react';

const VoiceRecorder = ({ onSendVoice }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [isReviewing, setIsReviewing] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    // Clean up audio URL when component unmounts
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    // Timer for recording duration
    useEffect(() => {
        if (isRecording && !isPaused) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isRecording, isPaused]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Reset state
            audioChunksRef.current = [];
            setRecordingTime(0);
            setAudioBlob(null);
            setAudioUrl(null);
            setIsReviewing(false);

            // Create media recorder
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);

                setAudioBlob(audioBlob);
                setAudioUrl(audioUrl);
                setIsReviewing(true);
                setIsRecording(false);

                // Stop all audio tracks
                stream.getTracks().forEach(track => track.stop());
            };

            // Start recording
            mediaRecorder.start();
            setIsRecording(true);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
        } else if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
        }
    };

    // Note: Not all browsers support pausing MediaRecorder
    const togglePause = () => {
        try {
            pauseRecording();
        } catch (err) {
            console.error('Pausing not supported in this browser:', err);
            // Fallback to stopping if pausing is not supported
            stopRecording();
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }

        clearInterval(timerRef.current);
        setIsRecording(false);
        setIsPaused(false);
        setIsReviewing(false);
        setRecordingTime(0);

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }

        setAudioBlob(null);
    };

    const handleSendVoice = () => {
        if (audioBlob) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = () => {
                const base64data = reader.result;

                // Send voice message
                onSendVoice({
                    type: 'audio',
                    name: `Voice Message (${formatTime(recordingTime)})`,
                    data: base64data,
                    size: audioBlob.size,
                });

                // Reset state
                cancelRecording();
            };
        }
    };

    const togglePlayback = () => {
        if (audioRef.current) {
            if (audioRef.current.paused) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    };

    // Recording button
    if (!isRecording && !isReviewing) {
        return (
            <button
                type="button"
                onClick={startRecording}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full transition-colors"
            >
                <Mic className="h-5 w-5" />
            </button>
        );
    }

    // Recording in progress UI
    if (isRecording) {
        return (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>

                <div className="text-sm font-medium">
                    {formatTime(recordingTime)}
                </div>

                <button
                    type="button"
                    onClick={togglePause}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full"
                >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </button>

                <button
                    type="button"
                    onClick={stopRecording}
                    className="p-1.5 text-white bg-[#00a884] rounded-full"
                >
                    <Send className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={cancelRecording}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    // Review recorded audio UI
    if (isReviewing) {
        return (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                <audio ref={audioRef} src={audioUrl} className="hidden" />

                <button
                    type="button"
                    onClick={togglePlayback}
                    className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full"
                >
                    <Play className="h-4 w-4" />
                </button>

                <div className="flex-1 h-1 bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00a884] rounded-full" style={{ width: '100%' }}></div>
                </div>

                <div className="text-xs font-medium">
                    {formatTime(recordingTime)}
                </div>

                <button
                    type="button"
                    onClick={handleSendVoice}
                    className="p-1.5 text-white bg-[#00a884] rounded-full"
                >
                    <Send className="h-4 w-4" />
                </button>

                <button
                    type="button"
                    onClick={cancelRecording}
                    className="p-1.5 text-gray-500 hover:text-red-500 rounded-full"
                >
                    <Trash className="h-4 w-4" />
                </button>
            </div>
        );
    }

    return null;
};

export default VoiceRecorder;