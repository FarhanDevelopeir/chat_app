

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
    const [isPlaying, setIsPlaying] = useState(false);

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

    // Handle audio playback events
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            const handleEnded = () => setIsPlaying(false);

            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            audio.addEventListener('ended', handleEnded);

            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
                audio.removeEventListener('ended', handleEnded);
            };
        }
    }, [audioUrl]);

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

    const stopRecordingAndSend = () => {
        if (mediaRecorderRef.current && isRecording) {
            // Stop recording first
            mediaRecorderRef.current.stop();
            
            // Add a small delay to ensure the blob is ready, then send
            setTimeout(() => {
                if (audioChunksRef.current.length > 0) {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        const base64data = reader.result;
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
            }, 100);
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

    const togglePause = () => {
        try {
            pauseRecording();
        } catch (err) {
            console.error('Pausing not supported in this browser:', err);
            stopRecordingAndSend();
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
                onSendVoice({
                    type: 'audio',
                    name: `Voice Message (${formatTime(recordingTime)})`,
                    data: base64data,
                    size: audioBlob.size,
                });
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

    // Recording button (initial state) - Mobile first
    if (!isRecording && !isReviewing) {
        return (
            <button
                type="button"
                onClick={startRecording}
                className="flex-shrink-0 p-2 text-gray-600 hover:text-[#00a884] rounded-full transition-all duration-200 hover:bg-gray-100 active:scale-95 touch-manipulation"
                aria-label="Start voice recording"
            >
                <Mic className="h-5 w-5" />
            </button>
        );
    }

    // Recording in progress UI - WhatsApp mobile style
    if (isRecording) {
        return (
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t shadow-lg md:relative md:inset-auto md:border md:rounded-full md:shadow-md md:max-w-sm md:mx-auto">
                <div className="flex items-center px-4 py-3 md:px-3 md:py-2">
                    {/* Recording indicator */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0 md:space-x-2">
                        <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full animate-pulse md:w-2 md:h-2"></div>
                        
                        {/* Timer */}
                        <div className="text-base font-medium text-gray-800 whitespace-nowrap md:text-sm">
                            {formatTime(recordingTime)}
                        </div>
                        
                        {/* Audio wave animation - Hidden on very small screens */}
                        <div className="hidden xs:flex items-center space-x-1 flex-1 min-w-0">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-[#00a884] rounded-full animate-pulse"
                                    style={{
                                        height: `${Math.random() * 16 + 8}px`,
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                ></div>
                            ))}
                        </div>

                        {/* Mobile-only slide to cancel text */}
                        <div className="text-sm text-gray-500 md:hidden">
                            ← Slide to cancel
                        </div>
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center space-x-3 flex-shrink-0 md:space-x-2">
                        {/* Pause/Resume button */}
                        <button
                            type="button"
                            onClick={togglePause}
                            className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors touch-manipulation active:scale-95 md:p-1.5"
                            aria-label={isPaused ? "Resume recording" : "Pause recording"}
                        >
                            {isPaused ? <Play className="h-5 w-5 md:h-4 md:w-4" /> : <Pause className="h-5 w-5 md:h-4 md:w-4" />}
                        </button>

                        {/* Send button */}
                        <button
                            type="button"
                            onClick={stopRecordingAndSend}
                            className="p-2 text-white bg-[#00a884] hover:bg-[#008c6f] rounded-full transition-colors shadow-md active:scale-95 touch-manipulation md:p-1.5"
                            aria-label="Send voice message"
                        >
                            <Send className="h-5 w-5 md:h-4 md:w-4" />
                        </button>

                        {/* Cancel button */}
                        <button
                            type="button"
                            onClick={cancelRecording}
                            className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors touch-manipulation active:scale-95 md:p-1.5"
                            aria-label="Cancel recording"
                        >
                            <X className="h-5 w-5 md:h-4 md:w-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Review recorded audio UI - WhatsApp mobile style
    if (isReviewing) {
        return (
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t shadow-lg md:relative md:inset-auto md:border md:rounded-full md:shadow-md md:max-w-sm md:mx-auto">
                <div className="flex items-center px-4 py-3 md:px-3 md:py-2">
                    <audio ref={audioRef} src={audioUrl} className="hidden" />

                    {/* Play/Pause button */}
                    <button
                        type="button"
                        onClick={togglePlayback}
                        className="flex-shrink-0 p-2 text-[#00a884] hover:text-[#008c6f] rounded-full hover:bg-gray-100 transition-colors touch-manipulation active:scale-95 md:p-1.5"
                        aria-label={isPlaying ? "Pause playback" : "Play recording"}
                    >
                        {isPlaying ? <Pause className="h-6 w-6 md:h-5 md:w-5" /> : <Play className="h-6 w-6 md:h-5 md:w-5" />}
                    </button>

                    {/* Waveform visualization */}
                    <div className="flex items-center flex-1 mx-4 min-w-0 md:mx-3">
                        <div className="flex items-center space-x-1 flex-1">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-gray-300 rounded-full transition-colors"
                                    style={{
                                        height: `${Math.random() * 16 + 6}px`,
                                        backgroundColor: i < (isPlaying ? 15 : 10) ? '#00a884' : '#e5e7eb'
                                    }}
                                ></div>
                            ))}
                        </div>
                        
                        {/* Duration */}
                        <div className="text-sm font-medium text-gray-600 ml-3 whitespace-nowrap md:text-xs md:ml-2">
                            {formatTime(recordingTime)}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 flex-shrink-0 md:space-x-2">
                        {/* Send button */}
                        <button
                            type="button"
                            onClick={handleSendVoice}
                            className="p-2 text-white bg-[#00a884] hover:bg-[#008c6f] rounded-full transition-colors shadow-md active:scale-95 touch-manipulation md:p-1.5"
                            aria-label="Send voice message"
                        >
                            <Send className="h-5 w-5 md:h-4 md:w-4" />
                        </button>

                        {/* Delete button */}
                        <button
                            type="button"
                            onClick={cancelRecording}
                            className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors touch-manipulation active:scale-95 md:p-1.5"
                            aria-label="Delete recording"
                        >
                            <Trash className="h-5 w-5 md:h-4 md:w-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default VoiceRecorder;